"""CSS-defined absolute objects remain native editable PowerPoint shapes.

Uses only Python standard library, no browsers/VSCode/Marp/external packages.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from zizai_slides import compile, convert, render_html

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / 'samples' / 'multiproduct-faithful.slide.md'
CSS = ROOT / 'samples' / 'multiproduct-faithful.slide.css'


class FreeformCSSIntegration(TestCase):
    def test_freeform_compiles_content_and_css_without_ui(self):
        result = compile(MD.read_text('utf-8'), CSS)
        self.assertEqual(result['count'], 1)
        layout = result['slides'][0]['layout']
        self.assertFalse(layout['warnings'], layout['warnings'])
        self.assertTrue(any(x['name'] == 'headline' and x['fontSize'] == 25.3 for x in layout['texts']))
        self.assertTrue(any(x['name'] == 'brand' and x['fill'] == 'BC0029' for x in layout['shapes']))
        self.assertFalse(any(x['name'] == 'Progress' for x in layout['shapes']))
        self.assertFalse(any(x['name'] == 'Corner mark' for x in layout['shapes']))
        self.assertEqual([t['text'] for t in layout['texts'] if t['name'] == 'Page number'], ['43'])

    def test_css_controls_position_color_and_font_for_export(self):
        with TemporaryDirectory() as tmp:
            modified = CSS.read_text('utf-8')
            modified = modified.replace('left: 1094px;', 'left: 1020px;', 1)
            modified = modified.replace('background-color: #BC0029;', 'background-color: #00786F;', 1)
            modified = modified.replace('font-size: 25.3px;', 'font-size: 30px;', 1)
            css = Path(tmp) / 'different.css'
            css.write_text(modified, 'utf-8')
            doc = MD.read_text('utf-8')
            baseline = compile(doc, CSS)['slides'][0]['layout']
            updated = compile(doc, css)['slides'][0]['layout']
            b = next(x for x in baseline['shapes'] if x['name'] == 'brand')
            u = next(x for x in updated['shapes'] if x['name'] == 'brand')
            self.assertEqual((b['x'], b['fill']), (1094, 'BC0029'))
            self.assertEqual((u['x'], u['fill']), (1020, '00786F'))
            self.assertEqual(next(t for t in updated['texts'] if t['name']=='headline')['fontSize'], 30)
            target=Path(tmp)/'updated.pptx'
            convert(MD,target,style_path=css)
            with ZipFile(target) as z:
                presentation=z.read('ppt/slides/slide1.xml')
                self.assertIn(b'00786F',presentation)
                self.assertIn(b'Multi-Product',presentation)
                self.assertNotIn(b'<p:pic>',presentation)
            html = render_html(doc, style_path=css)
            self.assertIn('left:1020.0px',html)
            self.assertIn('background:#00786F',html)

    def test_source_to_pptx_contains_editable_objects_and_no_embedded_figures(self):
        with TemporaryDirectory() as tmp:
            pptx=Path(tmp)/'original.pptx'
            convert(MD,pptx,style_path=CSS)
            with ZipFile(pptx) as z:
                self.assertIsNone(z.testzip())
                doc=z.read('ppt/slides/slide1.xml')
                self.assertGreater(doc.count(b'<p:sp>'),50)
                self.assertNotIn(b'<p:pic>',doc)
                self.assertNotIn(b'<a:blip',doc)
                self.assertIn('マルチチャネル'.encode(),doc)
                ET.fromstring(doc)

    def test_missing_object_css_fails_explicitly(self):
        source='---\npaginate: false\n---\n\n<!-- _class: freeform -->\n::: text nonexistent\nabc\n:::'
        with self.assertRaisesRegex(ValueError,'zs-nonexistent'):
            compile(source,CSS)

    def test_invalid_object_property_is_not_ignored(self):
        with TemporaryDirectory() as tmp:
            p=Path(tmp)/'invalid.css'
            p.write_text('.slide .zs-mycard {left:2px;top:3px;width:200px;height:30px;perspective:500px;}','utf-8')
            with self.assertRaisesRegex(ValueError,'未対応'):
                compile('::: text mycard\nabc\n:::', p)
