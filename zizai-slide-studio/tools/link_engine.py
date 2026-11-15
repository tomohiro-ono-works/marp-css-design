"""One-time editable stdlib-only import registration for Python / virtualenv.

Run with the Python interpreter which should be able to import zizai_slides.
This writes a .pth text file pointing to the current engine folder. No pip.
"""
from __future__ import annotations
from pathlib import Path
import argparse
import site
import sysconfig

ROOT = Path(__file__).resolve().parents[1]


def install(*, user=False, remove=False):
    package = ROOT / 'zizai_slides' / '__init__.py'
    if not package.is_file():
        raise RuntimeError(f'Python package not found: {package}')
    site_dir = Path(site.getusersitepackages() if user else sysconfig.get_path('purelib'))
    site_dir.mkdir(parents=True, exist_ok=True)
    location = site_dir / 'zizai_slide_studio_engine.pth'
    if remove:
        if location.is_file():
            location.unlink()
            print(f'Removed {location}')
        else:
            print(f'No file to remove: {location}')
    else:
        if '\n' in str(ROOT) or '\r' in str(ROOT):
            raise ValueError('Engine folder path must not contain a newline.')
        location.write_text(str(ROOT) + '\n', encoding='utf-8')
        print(f'Registered engine at {ROOT} via {location}')
        print('Restart Python processes to apply the new import path.')
    return location

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description='Make the engine importable from any working directory, without pip.')
    parser.add_argument('--user', action='store_true', help='Install in user site-packages (not active venv).')
    parser.add_argument('--remove', action='store_true', help='Remove current Python environment registration.')
    args=parser.parse_args()
    install(user=args.user, remove=args.remove)
