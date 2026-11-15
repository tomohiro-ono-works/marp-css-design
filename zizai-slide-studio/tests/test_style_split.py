import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from zizai_slides import compile, convert, render_html
from zizai_slides.style import SlideStyle

SAMPLE = '''---
marp: true
---
# デザイン確認

:::: h
::: card turquoise-light
**左カード**
:::
::: card coral-light
**右カード**
:::
::::
'''


class SlideCSSSeparationTests(unittest.TestCase):
    def test_theme_tokens_are_read_into_python(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'my-slide.css'
            path.write_text('.slide{ --zs-background:#123456; --zs-card-turquoise-light-bg:#AB12CD; --zs-canvas-padding-x:60px; --zs-layout-gap:30px; }', encoding='utf-8')
            base = compile(SAMPLE)['slides'][0]['layout']
            themed = compile(SAMPLE, style_path=path)['slides'][0]['layout']
            self.assertEqual(themed['shapes'][0]['fill'], '123456')
            self.assertIn('AB12CD', [i['fill'] for i in themed['shapes']])
            self.assertNotEqual(base['texts'][0]['x'], themed['texts'][0]['x'])
            self.assertIn('--zs-layout-gap:30px', render_html(SAMPLE, style_path=path))

    def test_custom_slide_css_changes_editable_pptx(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            src = root / 'slides.md'
            css = root / 'my-slide.css'
            ppt = root / 'custom.pptx'
            src.write_text(SAMPLE, encoding='utf-8')
            css.write_text('.slide {--zs-card-turquoise-light-bg:#AB12CD;}', encoding='utf-8')
            convert(src, ppt, mode='editable', style_path=css)
            with ZipFile(ppt) as z:
                self.assertIn('AB12CD', z.read('ppt/slides/slide1.xml').decode('utf-8'))

    def test_ui_styles_are_not_part_of_export(self):
        doc = render_html(SAMPLE)
        self.assertNotIn('toolbar button', doc)
        self.assertNotIn('vscode-editor-background', doc)
        self.assertIn('.slide-card', doc)
        self.assertIn('@media print', doc)

    def test_invalid_css_token_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'bad.css'
            path.write_text('.slide{--zs-background:red;}', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'RRGGBB'):
                compile(SAMPLE, style_path=path)


if __name__ == '__main__':
    unittest.main()
