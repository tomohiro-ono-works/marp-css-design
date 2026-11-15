"""Python-only v0.4 regression suite. No VSCode, no Node, no pip."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from zizai_slides import compile, convert, convert_text, render_html
from zizai_slides.export_pptx import EMU, NS_P, NS_A

SAMPLE = '''---
footer: 'Zizai'
---
# 売上分析の結果

対象期間の主要KPIを比較します。

:::: h

::: card turquoise-light hover

**売上高**

[達成]{.coral-dark} 125%

:::

::: card yellow-light

**客数**

前週比 110%

:::

::::

---

# 縦横の入れ子

::::: v

:::: h

::: card coral-light
左側
:::

::: card aqua-light
右側
:::

::::

:::::
'''

class IndependentLibraryTests(unittest.TestCase):
    def test_python_only_compile(self):
        d=compile(SAMPLE)
        self.assertEqual(d['count'],2)
        self.assertEqual(len(d['slides']),2)
        self.assertTrue(all('layout' in s for s in d['slides']))

    def test_palette_and_independent_chip(self):
        first=compile(SAMPLE)['slides'][0]['layout']
        backgrounds=[s['fill'] for s in first['shapes']]
        self.assertIn('EDFDFC',backgrounds)
        self.assertIn('B53E3D',backgrounds)
        self.assertIn('FAF8E0',backgrounds)
        self.assertTrue(any(t['text']=='達成' and t['color']=='FFFFFF' for t in first['texts']))

    def test_nested_shapes_and_no_overflow(self):
        for slide in compile(SAMPLE)['slides']:
            l=slide['layout']
            self.assertEqual(l['warnings'],[])
            self.assertTrue(all(s['x'] >= 0 and s['y'] >= 0 for s in l['shapes']))

    def test_python_editable_pptx_has_native_shapes(self):
        with tempfile.TemporaryDirectory() as tmp:
            pptx=Path(tmp)/'output.pptx'
            convert_text(SAMPLE,pptx)
            self.assertGreater(pptx.stat().st_size, 5000)
            with ZipFile(pptx) as z:
                self.assertIsNone(z.testzip())
                self.assertFalse(any(f.startswith('ppt/media/') for f in z.namelist()))
                self.assertTrue(all(f'ppt/slides/slide{i}.xml' in z.namelist() for i in (1,2)))
                tree=ET.fromstring(z.read('ppt/slides/slide1.xml'))
                elements=list(tree.iter('{'+NS_P+'}sp'))
                texts=[x.text for x in tree.iter('{'+NS_A+'}t')]
                self.assertGreater(len(elements), 12)
                self.assertIn('達成',texts)
                self.assertIn('売上高',texts)

    def test_pptx_positions_use_python_canonical_layout(self):
        layout=compile(SAMPLE)['slides'][0]['layout']
        first_title=next(t for t in layout['texts'] if t['name']=='h1')
        with tempfile.TemporaryDirectory() as tmp:
            pptx=Path(tmp)/'output.pptx'
            convert_text(SAMPLE,pptx)
            with ZipFile(pptx) as z:
                doc=ET.fromstring(z.read('ppt/slides/slide1.xml'))
                coords={(int(n.get('x',0)),int(n.get('y',0))) for n in doc.iter('{'+NS_A+'}off')}
            self.assertIn((round(first_title['x']*EMU),round(first_title['y']*EMU)),coords)

    def test_cli_independent_from_vscode(self):
        with tempfile.TemporaryDirectory() as tmp:
            md=Path(tmp)/'sample.md';md.write_text(SAMPLE,encoding='utf-8')
            pptx=Path(tmp)/'output.pptx'
            call=subprocess.run([sys.executable,'-m','zizai_slides',str(md),str(pptx)],cwd=ROOT,text=True,capture_output=True)
            self.assertEqual(call.returncode,0,call.stderr)
            self.assertTrue(pptx.is_file())

    def test_worker_isolated_no_external_packages(self):
        input_data=json.dumps({'action':'convert','mode':'editable','text':SAMPLE,'output':str(ROOT/'invalid_parent'/'foo.pptx')})
        run=subprocess.run([sys.executable,'-I','-S',str(ROOT/'zizai_slides'/'worker.py')],input=input_data,capture_output=True,text=True)
        self.assertEqual(run.returncode,0)
        result=json.loads(run.stdout)
        self.assertFalse(result['ok'])

    def test_html_uses_identical_coordinates(self):
        deck=compile(SAMPLE)
        html=render_html(SAMPLE)
        shape=next(s for s in deck['slides'][0]['layout']['shapes'] if s['name']=='Card')
        self.assertIn('left:'+str(shape['x'])+'px;',html)
        self.assertIn('top:'+str(shape['y'])+'px;',html)

    def test_bad_modifiers_fail(self):
        with self.assertRaisesRegex(ValueError,'修飾子'):
            compile('::: card unknown\ntext\n:::')

if __name__=='__main__':unittest.main()
