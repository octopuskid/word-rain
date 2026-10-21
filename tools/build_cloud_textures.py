"""Embed one large irregular cloud bank in regular and pencil styles."""
from pathlib import Path
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parents[1]
W, H = 1200, 600
# Restore the original rounded puff, now in staggered back-to-front stacks.
PUFF = 'M-78 5C-94-20-72-45-48-38C-40-66-4-70 10-46C36-65 66-46 62-20C92-17 98 14 76 29C66 52 35 58 17 43C-7 63-43 53-46 36C-68 43-88 28-78 5Z'
STACK = [(35,100,3.3,2.1,-8),(420,85,3.8,2.4,3),(900,105,4.2,2.2,-4),(1255,100,3.1,2.4,8),(-110,290,3.4,2.6,4),(240,285,3.8,2.8,-5),(735,280,4.1,2.9,5),(1200,310,3.4,2.5,-5),(-30,475,3.8,2.6,-4),(460,480,4.3,2.5,6),(1000,485,4.1,2.7,-6),(1360,475,3.3,2.6,2)]

def texture(paper=False):
    fill = '#f6f2e9' if paper else '#e5edf2'
    outline = '#716b66' if paper else '#a9bcca'
    elements = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="none">', '<rect width="1200" height="600" fill="'+('#eee9de' if paper else '#bac8d3')+'"/>']
    for cx,cy,sx,sy,angle in STACK:
        elements.append(f'<g transform="translate({cx} {cy}) rotate({angle}) scale({sx} {sy})"><path d="{PUFF}" fill="{fill}" stroke="{outline}" stroke-width="{.65 if paper else .6}"/>')
        if paper:
            elements.append('<path d="M-70 0C-84-20-66-37-48-30M-42-38C-31-59-8-58 6-39M-42 26l13-13m-5 22 14-18m-2 24 14-18m39-37 13-12" fill="none" stroke="#958d85" stroke-width=".45" stroke-linecap="round"/>')
        else:
            elements.append('<path d="M-48-6Q-29-29-7-13M17 14Q39-4 58 12" fill="none" stroke="#f8fbfd" stroke-width="1.6" stroke-linecap="round" opacity=".65"/>')
        elements.append('</g>')
    elements.append('</svg>')
    return ''.join(elements)

def embed():
    css = '''/* Seamless Overcast texture; explicit stacking keeps pause/dialog controls on top. */
.overcast-cloud{position:absolute;left:0;right:0;top:25%;height:50%;z-index:2;pointer-events:none;background-color:transparent;background-image:url("REGULAR");background-repeat:no-repeat;background-size:100% 100%}
.overcast-cloud[hidden]{display:none}
:root[data-theme="dark"] .overcast-cloud{filter:brightness(.76)}
:root[data-handwriting="true"] .overcast-cloud{filter:none;background-color:transparent;background-image:url("PAPER");background-blend-mode:normal}
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
