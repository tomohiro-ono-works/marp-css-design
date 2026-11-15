"""Create editable standalone engine ZIP (Python stdlib only)."""
from __future__ import annotations
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT.parent/'zizai-slides-engine-0.6.1.zip'
BASE='zizai-slides-engine-0.6.1'
ASSETS=[
    'zizai_slides/__init__.py', 'zizai_slides/__main__.py',
    'zizai_slides/slide_engine.py', 'zizai_slides/layout.py',
    'zizai_slides/style.py', 'zizai_slides/export_pdf.py',
    'zizai_slides/export_pptx.py', 'zizai_slides/worker.py',
    'zizai_slides/assets/slide.css','zizai_slides/assets/print.css',
    'tools/link_engine.py', 'ENGINE-README.md', 'LICENSE', 'docs/INITIAL_SETUP.md',
    'samples/starter.slide.md', 'samples/header-body.slide.md', 'samples/custom-slide.css',
    'samples/quickstart.slide.md', 'samples/quickstart.slide.css',
    'samples/multiproduct-faithful.slide.md', 'samples/multiproduct-faithful.slide.css',
]

def main():
    with ZipFile(OUTPUT, 'w', compression=ZIP_DEFLATED, compresslevel=9) as zipped:
        for rel in ASSETS:
            full=ROOT/rel
            if not full.is_file():raise FileNotFoundError(full)
            zipped.write(full,f'{BASE}/{rel}')
    with ZipFile(OUTPUT) as zipped:
        assert zipped.testzip() is None
        assert f'{BASE}/zizai_slides/worker.py' in zipped.namelist()
        assert not any(name.endswith('/extension.js') for name in zipped.namelist())
    print(f'Created independent Python engine {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')

if __name__=='__main__':main()
