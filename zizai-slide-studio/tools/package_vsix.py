"""Package the *UI-only* VSIX with the Python standard library.

The Python engine is deliberately excluded and must be configured externally.
"""
from __future__ import annotations
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT.parent / 'zizai-slide-studio-0.6.1.vsix'
ASSETS = [
    'package.json', 'extension.js', 'runtime/engine_bridge.js',
    'media/ui.css', 'media/webview.js',
    'samples/starter.slide.md', 'samples/header-body.slide.md',
    'samples/quickstart.slide.md', 'samples/quickstart.slide.css', 'docs/INITIAL_SETUP.md',
    'README.md', 'LICENSE',
]
CONTENT_TYPES = '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="json" ContentType="application/json"/>
 <Default Extension="js" ContentType="application/javascript"/>
 <Default Extension="css" ContentType="text/css"/>
 <Default Extension="md" ContentType="text/markdown"/>
 <Default Extension="txt" ContentType="text/plain"/>
 <Default Extension="vsixmanifest" ContentType="text/xml"/>
</Types>'''

def manifest(pkg):
    name = escape(pkg['displayName'])
    description = escape(pkg['description'])
    attributes = { 'Id': pkg['name'], 'Version': pkg['version'],
                   'Publisher': pkg['publisher'], 'Language':'ja-JP' }
    attrs = ' '.join(f'{key}="{escape(val)}"' for key,val in attributes.items())
    return f'''<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
 <Metadata>
  <Identity {attrs} />
  <DisplayName>{name}</DisplayName>
  <Description xml:space="preserve">{description}</Description>
  <Categories>Other</Categories>
  <Properties>
   <Property Id="Microsoft.VisualStudio.Code.Engine" Value="{escape(pkg['engines']['vscode'])}" />
   <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace" />
  </Properties>
 </Metadata>
 <Installation><InstallationTarget Id="Microsoft.VisualStudio.Code" /></Installation>
 <Dependencies />
 <Assets><Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" /></Assets>
</PackageManifest>'''

def main():
    pkg=json.loads((ROOT/'package.json').read_text(encoding='utf-8'))
    xml=manifest(pkg)
    ET.fromstring(xml)
    ET.fromstring(CONTENT_TYPES)
    with ZipFile(OUTPUT,'w',compression=ZIP_DEFLATED,compresslevel=9) as zipped:
        zipped.writestr('[Content_Types].xml', CONTENT_TYPES)
        zipped.writestr('extension.vsixmanifest', xml)
        for filename in ASSETS:
            full=ROOT/filename
            if not full.is_file():raise FileNotFoundError(full)
            zipped.write(full, 'extension/'+filename)
    with ZipFile(OUTPUT) as zipped:
        assert zipped.testzip() is None
        names=zipped.namelist()
        assert 'extension/extension.js' in names
        assert 'extension/runtime/engine_bridge.js' in names
        assert not any(name.startswith('extension/zizai_slides/') for name in names)
        assert not any(name=='extension/media/slide.css' for name in names)
    print(f'Created UI-only VSIX {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')

if __name__=='__main__':main()
