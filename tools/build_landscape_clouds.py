"""Independent wide Overcast compositions; portrait artwork remains unchanged."""
from pathlib import Path
from urllib.parse import quote
import re
from build_cloud_textures import PUFF
ROOT = Path(__file__).resolve().parents[1]
# A wide bank with round puffs, staggered in three overlapping rows.
# Uniform puff scaling avoids the flattened portrait-to-landscape appearance.
STACK = [(-80,45,2.2,-8),(230,40,2.5,4),(570,30,2.4,-5),(915,55,2.5,6),(1270,25,2.6,-3),(1620,50,2.3,8),
         (50,235,2.5,5),(405,220,2.6,-5),(780,230,2.7,3),(1160,215,2.6,-4),(1530,235,2.7,5),
         (-100,440,2.6,-4),(255,425,2.7,5),(650,445,2.8,-5),(1050,430,2.7,4),(1445,435,2.8,-6),(1795,430,2.5,5)]
def texture(paper=False):
    fill,outline,bg=('#f6f2e9','#716b66','#eee9de') if paper else ('#e5edf2','#a9bcca','#bac8d3')
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500" viewBox="0 0 1600 500">',f'<rect width="1600" height="500" fill="{bg}"/>']
    for x,y,size,angle in STACK:
        out.append(f'<g transform="translate({x} {y}) rotate({angle}) scale({size})"><path d="{PUFF}" fill="{fill}" stroke="{outline}" stroke-width=".65"/>')
        if paper:
            out.append('<path d="M-70 0C-84-20-66-37-48-30M-42-38C-31-59-8-58 6-39M-42 26l13-13m-5 22 14-18m-2 24 14-18m39-37 13-12" fill="none" stroke="#958d85" stroke-width=".45" stroke-linecap="round"/>')
        else:
            out.append('<path d="M-48-6Q-29-29-7-13M17 14Q39-4 58 12" fill="none" stroke="#f8fbfd" stroke-width="1.6" stroke-linecap="round" opacity=".65"/>')
        out.append('</g>')
    return ''.join(out)+'</svg>'
def embed():
    css='/* Independent landscape clouds: preserve proportions, crop edges when needed. */\n'
    for paper,name in [(False,'clouds-landscape'),(True,'clouds-landscape-handwriting')]:
        svg=texture(paper)
        (ROOT/f'assets/{name}.svg').write_text(svg)
        selector=':root[data-device="large"]'+('[data-handwriting="true"]' if paper else '')+' .overcast-cloud'
        css+=selector+'{background-image:url("data:image/svg+xml,'+quote(svg,safe=" /:=,;()'-._")+'");background-size:cover;background-position:center}\n'
    css+='/* End independent landscape clouds. */\n'
    path=ROOT/'src/index.html'; source=path.read_text()
    source=re.sub(r'/\* Independent landscape clouds:[\s\S]*?/\* End independent landscape clouds\. \*/\n','',source)
    source=source.replace('</style>',css+'</style>',1)
    path.write_text(source)
if __name__=='__main__':embed()
