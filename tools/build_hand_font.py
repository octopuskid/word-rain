"""Original pen-stroke alphabet inspired by the creator's notebook sketches.
Build: python tools/build_hand_font.py (fontTools). MIT licensed.
The photos are references only and are not redistributed.
"""
from pathlib import Path
from math import hypot, sin, cos, pi
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import base64, re
# Center lines on a 60 x 100 grid; each slash lifts the pen.
paths={
'A':'2,0 25,99 32,101 59,0/12,38 47,40','B':'5,0 6,100 33,99 51,90 54,76 46,59 8,53 37,55 54,45 56,24 46,6 5,0',
'C':'57,85 46,98 23,100 8,87 3,60 6,25 20,5 41,2 57,14','D':'5,0 7,100 28,99 48,86 58,63 55,32 42,10 5,0',
'E':'56,100 7,98 5,2 57,4/7,53 48,54','F':'7,0 8,100 57,98/9,54 45,55','G':'56,85 43,99 20,98 6,78 4,47 10,15 30,3 54,14 56,48 35,48',
'H':'5,100 7,0/56,101 54,1/6,50 55,53','I':'11,99 51,100/31,98 28,2/10,2 49,2','J':'13,100 57,99/46,98 45,24 37,5 19,0 5,14',
'K':'6,0 7,101/58,99 8,48 58,1','L':'7,100 5,2 56,4','M':'3,0 7,100 30,51 54,100 58,0','N':'6,0 7,100 55,0 54,101',
'O':'29,101 10,94 3,73 4,30 14,7 34,1 53,14 59,44 54,81 41,99 29,101',
'P':'7,0 8,100 34,100 53,90 55,68 42,53 8,52','Q':'29,101 10,94 3,73 4,30 14,7 34,1 53,14 59,44 54,81 41,99 29,101/34,26 62,-10',
'R':'7,0 8,100 34,100 53,90 54,70 41,55 8,53/32,53 58,0','S':'55,87 42,100 21,98 6,83 8,66 24,54 44,43 55,27 50,11 32,2 12,6 4,15',
'T':'0,99 61,98/31,98 30,0','U':'5,100 6,28 13,8 31,0 49,10 55,32 57,100','V':'3,100 28,0 34,1 59,99',
'W':'0,100 14,1 31,58 46,1 62,100','X':'3,100 59,0/58,100 4,0','Y':'3,100 31,49 58,100/31,49 29,0','Z':'4,100 57,100 3,1 58,3',
'a':'47,58 35,68 18,65 6,48 6,22 18,6 35,8 47,28/48,68 47,4 58,3',
'b':'8,102 7,4/8,47 23,66 42,64 55,47 51,21 35,5 18,7 7,20',
'c':'53,58 37,68 19,62 7,43 8,22 24,6 43,8 55,19',
'd':'50,102 47,4/47,51 35,68 17,64 7,45 8,21 20,6 36,10 48,27',
'e':'8,35 52,41 49,58 33,68 17,61 7,43 9,20 26,6 45,10 54,20',
'f':'16,-22 18,78 28,100 46,102 56,93/4,63 47,65','g':'48,60 35,69 17,64 6,45 10,21 24,13 42,22 49,43/50,67 47,-13 35,-30 17,-32 5,-20',
'h':'8,102 6,1/8,42 25,64 40,67 50,53 50,0','i':'28,64 26,2/29,93 30,96','j':'38,65 35,-12 24,-30 8,-29/39,95 40,98',
'k':'8,102 7,1/52,67 9,30 54,2','l':'24,103 22,17 29,3 44,7','m':'3,0 4,66 8,44 21,65 31,63 32,0/32,43 46,64 57,58 59,1',
'n':'8,0 8,67 9,42 25,64 40,65 51,52 51,0','o':'29,68 12,61 6,39 12,15 29,6 47,16 54,40 47,62 29,68',
'p':'8,-33 9,66/9,48 24,66 42,63 53,45 48,23 32,13 10,23','q':'48,-32 49,66/47,51 33,67 16,62 7,43 12,22 28,12 47,27',
'r':'10,0 10,67 12,40 28,63 44,65 54,58','s':'51,58 36,68 20,64 10,51 17,37 42,28 50,16 37,5 18,7 6,17',
 't':'25,96 23,20 30,4 46,8/5,63 48,66','u':'8,66 8,22 17,5 34,10 48,31/49,67 49,4 58,4',
'v':'5,65 27,3 35,5 56,66','w':'1,67 13,3 29,39 44,3 60,68','x':'7,66 52,3/51,66 6,2',
'y':'5,67 27,8 49,66/49,66 30,-19 18,-32 4,-29','z':'7,65 52,65 7,4 54,6',
'0':'27,100 9,88 3,53 8,18 26,2 46,12 56,45 53,82 39,100 27,100/9,11 51,88','1':'12,80 31,100 29,2/12,2 48,3',
'2':'6,81 19,98 39,97 53,83 49,63 8,4 57,4','3':'6,94 30,101 51,87 48,66 31,51 49,43 55,24 42,6 22,2 5,13',
'4':'43,0 44,101/43,101 3,32 59,34','5':'55,100 12,99 7,55 31,62 49,51 55,31 46,11 28,2 7,9','6':'51,94 36,102 16,82 6,50 7,20 22,4 42,6 53,25 50,44 35,55 9,41',
'7':'4,99 58,100 21,0','8':'28,54 10,68 9,87 25,101 44,95 52,79 45,61 28,54 8,39 7,19 23,1 43,4 55,23 50,43 28,54',
'9':'48,57 29,47 11,56 6,75 17,96 35,100 51,86 53,52 44,19 26,2',
'.':'29,3 30,5',',':'30,3 24,-15',':':'28,60 29,62/27,3 28,5',';':'28,60 29,62/28,3 23,-15',
'!':'28,100 26,28/27,3 28,5','?':'5,83 18,99 39,96 51,79 42,60 26,47 25,29/25,3 26,5',
'-':'7,43 54,45','—':'0,43 64,45','–':'7,43 54,45','/':'3,-8 55,107','+':'7,47 53,48/31,75 29,20','=':'7,58 52,59/6,35 52,37',
'(':'41,105 20,83 13,48 20,11 42,-12',')':'15,105 36,83 43,48 36,11 14,-12',
'\u0027':'29,100 25,82','\u0022':'19,100 17,82/40,100 38,82','’':'29,100 25,82','&':'55,9 13,67 13,85 27,99 41,90 39,73 9,41 6,20 20,4 40,8 57,36','%':'5,0 56,100/12,98 3,87 9,73 22,81 20,94 12,98/45,28 36,17 42,3 55,11 53,24 45,28',
'×':'8,75 52,24/51,75 9,25','←':'57,49 4,48 24,71/4,48 23,25','→':'3,49 56,48 36,71/56,48 37,25',
'♥':'30,0 4,39 2,65 12,83 25,86 31,75 42,87 57,81 61,60 55,39 30,0',
'♡':'30,0 4,39 2,65 12,83 25,86 31,75 42,87 57,81 61,60 55,39 30,0','✦':'30,91 40,59 61,48 40,37 30,6 20,37 0,48 20,59 30,91',
'·':'28,48 29,50','|':'29,102 28,-10','_':'2,-3 59,-2',
}
# Build stroke outlines as consistently oriented rectangles with round joins/caps.
def polygon(pen,points):
 pen.moveTo(points[0])
 for pt in points[1:]:pen.lineTo(pt)
 pen.closePath()
def roundcap(pen,x,y,r):
 polygon(pen,[(round(x+r*cos(2*pi*i/10)),round(y+r*sin(2*pi*i/10))) for i in range(10)])
def glyph(ch):
 pen=TTGlyphPen(None)
 if ch=='♥':
  polygon(pen,[(round(float(pt.split(',')[0])*8+40),round(float(pt.split(',')[1])*7)) for pt in paths[ch].split()]);return pen.glyph()
 for stroke in paths.get(ch,paths['?']).split('/'):
  pts=[tuple(float(v) for v in p.split(',')) for p in stroke.split()]
  pts=[(x*8+40+sin((i+1)*1.7+ord(ch))*2.8,y*7) for i,(x,y) in enumerate(pts)]
  radius=22 if ch not in '.:,;\u0027\u0022’·' else 15
  for (x,y),(u,v) in zip(pts,pts[1:]):
   length=hypot(u-x,v-y) or 1;nx=-(v-y)/length*radius;ny=(u-x)/length*radius
   polygon(pen,[(round(x-nx),round(y-ny)),(round(u-nx),round(v-ny)),(round(u+nx),round(v+ny)),(round(x+nx),round(y+ny))])
  for x,y in pts:roundcap(pen,x,y,radius)
 return pen.glyph()
root=Path(__file__).resolve().parents[1]
fb=FontBuilder(1000,isTTF=True);order=['.notdef','space']+['g'+str(ord(c)) for c in paths]
fb.setupGlyphOrder(order);fb.setupCharacterMap({32:'space',**{ord(c):'g'+str(ord(c)) for c in paths}})
glyphs={'.notdef':glyph('?'),'space':TTGlyphPen(None).glyph(),**{'g'+str(ord(c)):glyph(c) for c in paths}}
fb.setupGlyf(glyphs)
metrics={n:(570 if n!='space' else 280,0) for n in order}
# Narrow lowercase strokes need symmetric side bearings within the fixed cell.
# Matching xMin to the left side bearing also keeps outline and metric origins aligned.
for ch in 'il':
 name='g'+str(ord(ch));g=glyphs[name];advance=metrics[name][0]
 left=(advance-(g.xMax-g.xMin))//2
 g.coordinates.translate((left-g.xMin,0));g.recalcBounds(glyphs)
 metrics[name]=(advance,left)
fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=860,descent=-280)
fb.setupNameTable({'familyName':'Word Rain Hand','styleName':'Regular','uniqueFontIdentifier':'WordRainHand-1.3.3','fullName':'Word Rain Hand','psName':'WordRainHand','version':'Version 1.3.3','copyright':'Original notebook-inspired lettering. MIT license; Word Rain contributors.'})
fb.setupOS2(sTypoAscender=860,sTypoDescender=-280,usWinAscent=860,usWinDescent=280);fb.setupPost();fb.setupMaxp()
fb.font['head'].created=fb.font['head'].modified=3854044800
fb.font.flavor='woff';out=root/'assets/word-rain-hand.woff';fb.save(out)
css="@font-face{font-family:'Word Rain Hand';src:url(data:font/woff;base64,"+base64.b64encode(out.read_bytes()).decode()+") format('woff');font-display:swap}"
html=root/'index.html';s=html.read_text();s=re.sub(r'/\* HAND FONT START \*/.*?/\* HAND FONT END \*/','',s,flags=re.S)
s=s.replace('</style>','/* HAND FONT START */'+css+'/* HAND FONT END */\n</style>',1);html.write_text(s)
print('Built original hand font:',out.stat().st_size,'bytes')
