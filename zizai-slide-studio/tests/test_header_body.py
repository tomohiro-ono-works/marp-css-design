"""Semantic ::: header / ::: body; no external dependencies."""
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from zizai_slides import compile, convert, render_html
from zizai_slides.export_pptx import NS_A

SAMPLE = Path(__file__).resolve().parents[1] / 'samples' / 'header-body.slide.md'


class HeaderBodyTests(unittest.TestCase):
    def test_parses_separate_sections_and_nested_card(self):
        deck = compile(SAMPLE.read_text('utf-8'))
        self.assertEqual(deck['count'], 2)
        self.assertIn('class="slide-header"', deck['slides'][0]['html'])
        self.assertIn('class="slide-body"', deck['slides'][0]['html'])
        self.assertIn('class="slide-layout slide-h"', deck['slides'][0]['html'])
        self.assertIn('class="slide-card tone-turquoise-light"', deck['slides'][0]['html'])
        self.assertEqual(deck['slides'][0]['layout']['warnings'], [])
        self.assertEqual(deck['slides'][1]['layout']['warnings'], [])

    def test_body_starts_at_css_defined_band(self):
        with tempfile.TemporaryDirectory() as tmp:
            css = Path(tmp) / 'style.css'
            base = compile(SAMPLE.read_text('utf-8'))['slides'][0]['layout']
            css.write_text('.slide{--zs-header-height:160px; --zs-header-body-gap:20px;}', 'utf-8')
            themed = compile(SAMPLE.read_text('utf-8'), style_path=css)['slides'][0]['layout']
            old_body = next(x for x in base['texts'] if x['text']=='導入プロダクト数')
            new_body = next(x for x in themed['texts'] if x['text']=='導入プロダクト数')
            old_header = next(x for x in base['texts'] if 'マルチチャネルの成果' in x['text'])
            new_header = next(x for x in themed['texts'] if 'マルチチャネルの成果' in x['text'])
            self.assertAlmostEqual(new_body['y'] - old_body['y'], 26, delta=1)
            self.assertEqual(old_header['y'], new_header['y'])

    def test_editable_pptx_and_preview_share_section_text(self):
        html = render_html(SAMPLE.read_text('utf-8'))
        self.assertIn('マルチチャネルの成果', html)
        self.assertIn('導入プロダクト数', html)
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / 'out.pptx'
            convert(SAMPLE, target, mode='editable')
            with ZipFile(target) as z:
                self.assertIsNone(z.testzip())
                slide = ET.fromstring(z.read('ppt/slides/slide1.xml'))
                texts = ''.join(n.text or '' for n in slide.iter(f'{{{NS_A}}}t'))
                self.assertIn('マルチチャネルの成果', texts)
                self.assertIn('導入プロダクト数', texts)
                self.assertIn('クロスセルの伸長', texts)
                self.assertFalse(any(name.startswith('ppt/media/') for name in z.namelist()))

    def test_rejects_unscoped_top_level_content(self):
        invalid = '::: header\n# タイトル\n:::\n\n領域外の文章'
        with self.assertRaisesRegex(ValueError, 'コンテナ内'):
            compile(invalid)

    def test_rejects_multiple_body_sections(self):
        invalid = '::: body\nA\n:::\n\n::: body\nB\n:::'
        with self.assertRaisesRegex(ValueError, '1つまで'):
            compile(invalid)

    def test_legacy_unsectioned_deck_still_supported(self):
        legacy = '# 従来の見出し\n\n本文'
        self.assertEqual(compile(legacy)['count'], 1)
        self.assertIn('本文', render_html(legacy))


if __name__ == '__main__':
    unittest.main()
