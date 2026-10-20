"""Embed one large irregular cloud bank in regular and pencil styles."""
from pathlib import Path
from urllib.parse import quote
import re

ROOT = Path(__file__).resolve().parents[1]
W, H = 1200, 600
# One composition for the entire band, rather than a repeating row of stamps.
# Each layer has its own broad silhouette and extends beyond the side edges.
LAYERS = [
 'M-50 150C-5 65 35 95 83 119C110 136 131 59 171 91C219 133 224 76 265 104C305 139 329 44 375 70C408 96 421 65 448 89C477 112 499 35 533 55C565 74 568 4 606 23C654 7 662 83 699 60C763 22 771 101 802 80C854 46 870 116 903 86C944 64 940 114 974 101C1027 60 1060 93 1082 71C1136 42 1172 87 1250 46L1250 600L-50 600Z',
 'M-50 267C-2 215 22 195 61 226C101 263 110 184 161 216C191 241 199 203 237 239C264 282 282 190 316 214C369 250 372 157 426 185C464 191 492 249 524 221C563 159 599 176 639 224C680 272 687 185 728 197C770 198 782 249 821 213C862 182 885 149 923 175C964 204 998 177 1035 205C1081 243 1112 197 1148 227C1190 257 1228 184 1250 201L1250 600L-50 600Z',
 'M-50 405C-7 365 20 394 40 348C77 274 123 326 160 365C195 400 231 298 283 326C328 290 376 339 407 387C446 341 487 367 514 325C550 289 578 383 610 361C671 350 702 305 749 327C807 296 850 355 887 403C932 357 952 333 997 346C1042 364 1082 324 1123 339C1181 310 1207 357 1250 325L1250 600L-50 600Z'
]

def texture(paper=False):
    colors = ['#eeebe4','#f4f0e7','#faf6ed'] if paper else ['#adbdca','#cad7e1','#e7eef4']
    outline = '#615b58' if paper else '#8da4b5'
    elements = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="none">', '<defs><clipPath id="bank"><path d="M0 80C55 25 89 112 135 73C182 19 202 103 250 67C299 24 322 103 368 65C411 18 448 96 485 57C540 8 570 75 612 40C662 2 695 90 741 50C792 12 823 101 871 63C924 20 950 98 991 62C1041 16 1080 107 1129 64C1161 32 1180 69 1200 52L1200 536C1150 575 1101 517 1057 562C1002 600 973 522 924 560C869 602 837 525 790 558C738 595 706 524 658 563C606 600 571 519 521 560C469 596 433 522 385 566C328 602 299 517 248 557C192 593 162 521 113 560C65 596 30 535 0 555Z"/></clipPath></defs><g clip-path="url(#bank)"><rect width="1200" height="600" fill="'+colors[0]+'"/>']
    for n,d in enumerate(LAYERS):
        elements.append(f'<path d="{d}" fill="{colors[n]}" stroke="{outline}" stroke-width="{2.6 if paper else 1.8}" stroke-linejoin="round"/>')
    # Short partial contours describe overlapping masses, without closed cookie shapes.
    details = 'M83 119Q69 170 78 212M448 89Q474 123 465 153M802 80Q820 116 805 148M237 239Q222 279 234 318M639 224Q668 254 655 280M1035 205Q1059 244 1040 283M407 387Q433 415 419 446M887 403Q919 434 903 468'
    elements.append(f'<path d="{details}" fill="none" stroke="{outline}" stroke-width="{2.4 if paper else 1.8}" stroke-linecap="round"/>')
    if paper:
        elements.append('<path d="M134 157l15-17m-4 29 16-19M569 117l18-19m-8 29 17-18M323 266l16-18m-6 28 16-18M728 269l17-19m-6 29 17-19M161 458l18-21m-7 31 17-20M670 454l19-22m-7 31 18-21M1070 439l19-23" fill="none" stroke="#aca197" stroke-width="1.2" stroke-linecap="round"/>')
    else:
        elements.append('<path d="M188 157Q221 133 247 160M554 126Q587 93 616 119M862 271Q891 241 919 261M467 467Q501 432 532 461M1006 465Q1039 437 1070 453" fill="none" stroke="#f8fbff" stroke-width="5" stroke-linecap="round" opacity=".5"/>')
    elements.append('</g></svg>')
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
