"""Render the sketch-inspired launcher as a scalable vector and 1024px PNG."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ANDROID = 'http://schemas.android.com/apk/res/android'
ET.register_namespace('android', ANDROID)

def create():
    # Rounded letter/wildcard tiles and an open basket, redrawn from the user's sketch.
    parts = [
        ('#faf8f2', None, 0, 'M0 0H1024V1024H0Z'),
        ('#fffdf8', '#161616', 20, 'M155 162Q290 115 386 160Q421 180 423 234L419 389Q416 432 366 441L205 446Q151 438 148 390L146 210Q145 180 155 162Z'),
        ('#fffdf8', '#161616', 20, 'M608 388Q711 365 824 403Q866 422 865 467L852 639Q850 678 802 686L631 679Q587 675 582 631L588 467Q590 416 608 388Z'),
    ]
    hatch = [
        ('#f2cd39', 'M175 291L247 174 M173 360L297 166 M186 422L351 171 M250 432L394 229 M319 430L403 303 M379 414L404 370'),
        ('#ba5be4', 'M609 485L674 398 M604 550L735 398 M603 615L794 408 M630 666L838 429 M696 669L848 494 M765 672L842 562 M820 656L837 618'),
    ]
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">']
    vector = ET.Element('vector', {f'{{{ANDROID}}}width':'108dp', f'{{{ANDROID}}}height':'108dp', f'{{{ANDROID}}}viewportWidth':'1024', f'{{{ANDROID}}}viewportHeight':'1024'})
    def path(fill, stroke, width, data):
        attrs = {f'{{{ANDROID}}}fillColor':fill, f'{{{ANDROID}}}pathData':data}
        style = f'fill="{fill}"'
        if stroke:
            attrs.update({f'{{{ANDROID}}}strokeColor':stroke, f'{{{ANDROID}}}strokeWidth':str(width), f'{{{ANDROID}}}strokeLineCap':'round', f'{{{ANDROID}}}strokeLineJoin':'round'})
            style += f' stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"'
        ET.SubElement(vector, 'path', attrs)
        svg.append(f'<path {style} d="{data}"/>')
    for part in parts: path(*part)
    for color, data in hatch: path('#00000000', color, 13, data)
    # The W is deliberately a single strong pen stroke, legible at launcher size.
    path('#00000000', '#141414', 37, 'M199 236Q209 333 238 381Q252 399 274 360L292 320Q315 374 337 381Q372 379 374 224')
    path('#141414', None, 0, 'M725 447Q727 521 801 542Q731 555 718 630Q705 561 642 548Q704 528 725 447Z')
    path('#00000000', '#161616', 24, 'M215 728Q248 793 279 855Q291 878 322 879L712 879Q741 877 761 853L841 744')
    svg.append('</svg>')
    # SVG uses transparent "none" rather than Android's ARGB transparent literal.
    source = '\n'.join(svg).replace('fill="#00000000"', 'fill="none"')
    (ROOT/'assets/launcher-icon.svg').write_text(source)
    ET.indent(vector)
    ET.ElementTree(vector).write(ROOT/'android/res/drawable/ic_launcher.xml', encoding='unicode')
    try:
        import cairosvg
        cairosvg.svg2png(bytestring=source.encode(), write_to=str(ROOT/'android/launcher-icon-1024.png'), output_width=1024, output_height=1024)
    except ImportError:
        print('Vector assets generated. Install cairosvg to export the optional 1024px PNG.')

if __name__ == '__main__':
    create()
