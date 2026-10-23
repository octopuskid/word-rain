"""Losslessly repack embedded artwork; run before tools/build-web.cjs."""
from pathlib import Path
from collections import Counter
from urllib.parse import quote, unquote
import base64
import re

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'src/index.html'
html = source.read_text()

def compact_svg(match):
    svg = unquote(match[1])
    # Reuse exact paths. Do not round geometry, change transforms or drop strokes.
    paths = Counter(re.findall(r'<path d="([^"]+)"', svg))
    definitions = []
    for i, (path, count) in enumerate(paths.items()):
        if count < 2:
            continue
        identifier = f'p{i}'
        definitions.append(f'<path id="{identifier}" d="{path}"/>')
        svg = svg.replace(f'<path d="{path}"', f'<use href="#{identifier}"')
    if definitions:
        end = svg.index('>') + 1
        svg = svg[:end] + '<defs>' + ''.join(definitions) + '</defs>' + svg[end:]
    # Only URI/CSS-sensitive bytes need escaping inside this double-quoted URL.
    return 'data:image/svg+xml,' + quote(svg, safe=" /:=,;()'-._")

html = re.sub(r'data:image/svg\+xml,([^\"]+)', compact_svg, html)
font = base64.b64encode((ROOT / 'assets/word-rain-hand.woff2').read_bytes()).decode()
html = re.sub(r'data:font/woff(?:2)?;base64,[A-Za-z0-9+/=]+',
              'data:font/woff2;base64,' + font, html)
html = html.replace("format('woff')", "format('woff2')")
html = html.replace('v1.6.3 · NO UMBRELLA REQUIRED',
                    'v1.6.3.1 DEV · NO UMBRELLA REQUIRED')
source.write_text(html)
