"""Embed seamless cloud patterns. Edge copies match across both repeat axes."""
from pathlib import Path
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parents[1]
W, H = 320, 180
# A rounded, closed puff; no straight bottoms or tile-shaped backplates.
PUFF = 'M-78 5C-94-20-72-45-48-38C-40-66-4-70 10-46C36-65 66-46 62-20C92-17 98 14 76 29C66 52 35 58 17 43C-7 63-43 53-46 36C-68 43-88 28-78 5Z'

def texture(paper=False):
    bg = '#eee9de' if paper else '#bac8d3'
    elements = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', f'<rect width="{W}" height="{H}" fill="{bg}"/>']
    for cx, cy, scale in [(18,31,.98),(175,36,1.10),(91,136,1.03),(282,134,.97)]:
        for dx in (-W,0,W):
            for dy in (-H,0,H):
                if cx+dx+100*scale<0 or cx+dx-100*scale>W or cy+dy+75*scale<0 or cy+dy-75*scale>H:
                    continue
                fill = '#f6f2e9' if paper else '#e5edf2'
                outline = 'stroke="#716b66" stroke-width="1.3"' if paper else 'stroke="#a9bcca" stroke-width="1.2"'
                elements.append(f'<g transform="translate({cx+dx} {cy+dy}) scale({scale})"><path d="{PUFF}" fill="{fill}" {outline}/>')
                if paper:
                    elements.append('<path d="M-70 0C-84-20-66-37-48-30M-42-38C-31-59-8-58 6-39M-42 26l13-13m-5 22 14-18m-2 24 14-18m39-37 13-12" fill="none" stroke="#958d85" stroke-width=".8" stroke-linecap="round"/>')
                else:
                    elements.append('<path d="M-48-6Q-29-29-7-13M17 14Q39-4 58 12" fill="none" stroke="#f8fbfd" stroke-width="3" stroke-linecap="round" opacity=".65"/>')
                elements.append('</g>')
    elements.append('</svg>')
    return ''.join(elements)

def embed():
    css = '''/* Seamless Overcast texture; explicit stacking keeps pause/dialog controls on top. */
.overcast-cloud{position:absolute;left:0;right:0;top:25%;height:50%;z-index:2;pointer-events:none;background-color:#bac8d3;background-image:url("REGULAR");background-repeat:repeat;background-size:320px 180px}
.overcast-cloud[hidden]{display:none}
:root[data-theme="dark"] .overcast-cloud{background-color:#91a4b4;background-blend-mode:multiply}
:root[data-handwriting="true"] .overcast-cloud{background-color:#eee9de;background-image:url("PAPER");background-blend-mode:normal}
.arena .overlay{z-index:3}
'''.replace('REGULAR','data:image/svg+xml,'+quote(texture(),safe='')).replace('PAPER','data:image/svg+xml,'+quote(texture(True),safe=''))
    source=(ROOT/'index.html').read_text()
    source,n=re.subn(r'/\* (?:An opaque middle band masks drops but never intercepts movement input\.|Seamless Overcast texture; explicit stacking keeps pause/dialog controls on top\.) \*/[\s\S]*?\.overlay\{z-index:3\}\n',lambda _:css,source,count=1)
    assert n==1,'Expected 1.6.0 Overcast CSS marker'
    (ROOT/'index.html').write_text(source)
    for paper,name in [(False,'clouds'),(True,'clouds-handwriting')]:
        (ROOT/f'assets/{name}.svg').write_text(texture(paper))

if __name__=='__main__':
    embed()
