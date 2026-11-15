"""Right footer pagination regression: Python-only, no external packages."""
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from zizai_slides import compile, convert_text, render_html
from zizai_slides.export_pptx import NS_A

SAMPLE = '''---
paginate: true
footer: '左フッター'
---
# 1枚目

::: card turquoise-light
内容
:::

---

# 2枚目

説明文

---

<!-- _class: cover -->

:::: hero
::: hero-media
ロゴ
:::
::: hero-copy
# 表紙
:::
::::
'''


def page_texts(text, style_path=None):
    return [[t for t in s['layout']['texts'] if t['name'] == 'Page number']
            for s in compile(text, style_path=style_path)['slides']]


class PageFooterTests(unittest.TestCase):
    def test_every_slide_numbered_and_aligned_right(self):
        got = page_texts(SAMPLE)
        self.assertEqual([[t['text'] for t in page] for page in got],
                         [['1'], ['2'], ['3']])
        self.assertTrue(all(1160 < page[0]['x'] < 1280 for page in got))
        self.assertTrue(all(670 < page[0]['y'] < 710 for page in got))
        self.assertTrue(all(t['color'] == '777777' for page in got for t in page))
        self.assertNotIn('1 / 3', render_html(SAMPLE))

    def test_without_left_footer_or_paginate_directive(self):
        src = '# A\n\n---\n\n# B\n'
        got = page_texts(src)
        self.assertEqual([page[0]['text'] for page in got], ['1', '2'])
        self.assertNotIn('Footer', [t['name'] for t in compile(src)['slides'][0]['layout']['texts']])

    def test_false_disables_all_numbers(self):
        src = SAMPLE.replace('paginate: true', 'paginate: false')
        self.assertTrue(all(not page for page in page_texts(src)))
        self.assertNotIn('Page number', '\n'.join(str(t) for l in compile(src)['slides'] for t in l['layout']['texts']))

    def test_invalid_paginate_fails(self):
        with self.assertRaisesRegex(ValueError, 'paginate'):
            compile(SAMPLE.replace('paginate: true', 'paginate: perhaps'))

    def test_css_tokens_control_position_and_text_color(self):
        with tempfile.TemporaryDirectory() as tmp:
            css = Path(tmp) / 'footer.css'
            css.write_text('.slide{--zs-page-number-color:#123456;'
                           '--zs-page-number-font-size:16px;'
                           '--zs-page-number-right:90px;'
                           '--zs-page-number-bottom:30px;}', encoding='utf-8')
            old = page_texts(SAMPLE)[0][0]
            new = page_texts(SAMPLE, css)[0][0]
            self.assertEqual(new['color'], '123456')
            self.assertEqual(new['fontSize'], 16.0)
            self.assertLess(new['x'], old['x'] - 30)
            self.assertLess(new['y'], old['y'])
            html = render_html(SAMPLE, style_path=css)
            self.assertIn('Page number', str(compile(SAMPLE, style_path=css)['slides'][0]['layout']['texts']))
            self.assertIn('--zs-page-number-color:#123456', html)

    def test_editable_pptx_uses_native_text_shapes(self):
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / 'pages.pptx'
            convert_text(SAMPLE, dest, mode='editable')
            with ZipFile(dest) as archive:
                self.assertIsNone(archive.testzip())
                for i in range(1, 4):
                    root = ET.fromstring(archive.read(f'ppt/slides/slide{i}.xml'))
                    texts = [node.text for node in root.iter('{' + NS_A + '}t')]
                    self.assertIn(str(i), texts)
                    self.assertNotIn(f'{i} / 3', texts)
                self.assertEqual(len([n for n in archive.namelist() if n.startswith('ppt/media/')]), 0)


if __name__ == '__main__':
    unittest.main()
