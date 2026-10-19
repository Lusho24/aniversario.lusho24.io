from PIL import Image, ImageDraw
from pathlib import Path
import random, math
p=Path(__file__).parent
random.seed(2210)
w,h=480,250
im=Image.new('RGB',(w,h));d=ImageDraw.Draw(im)
# Solid-color stepped night sky for a pixel-perfect retro feel
bands=['#191426','#1f1a30','#29203b','#342647','#413050','#503954','#5c4359','#69505c']
for y in range(h):d.line((0,y,w,y),fill=bands[min(len(bands)-1,int(y/(h*.79)*len(bands)))])
for i in range(155):
 x=random.randrange(w);y=random.randrange(0,170);r=random.choice([1,1,1,2]);
 d.rectangle((x,y,x+r,y+r),fill=random.choice(['#ffdfc5','#cfacbd','#9f879f','#ecc8d5']))
# Moon
d.ellipse((392,24,441,73),fill='#bda8b5');d.ellipse((400,27,446,68),fill='#fce2c3');d.ellipse((425,31,441,57),fill='#f6d4af')
for x,y,r in [(414,38,3),(433,52,2),(402,56,2)]:d.rectangle((x,y,x+r,y+r), fill='#e8c59f')
# Far hills
d.polygon([(0,156),(35,144),(70,149),(118,131),(150,144),(179,133),(218,152),(250,137),(298,142),(326,123),(362,153),(412,130),(480,151),(480,225),(0,225)],fill='#403449')
d.polygon([(0,180),(45,160),(91,179),(135,152),(183,181),(218,158),(259,173),(306,155),(342,184),(381,159),(441,178),(480,158),(480,229),(0,229)],fill='#302a40')
# Bare branches
for x,y,k in [(42,192,1),(192,195,1),(270,187,1),(455,183,1)]:
 d.rectangle((x,y-32*k,x+3,y+8),fill='#241f31')
 d.line((x+1,y-26,x-11,y-41),fill='#241f31',width=3)
 d.line((x+2,y-15,x+15,y-36),fill='#241f31',width=3)
 d.line((x-9,y-39,x-15,y-44),fill='#241f31',width=2)
 d.line((x+14,y-35,x+18,y-40),fill='#241f31',width=2)
# Ground
d.rectangle((0,197,w,h),fill='#3b343f')
d.rectangle((0,202,w,210),fill='#484047')
d.rectangle((0,210,w,h),fill='#302a34')
for i in range(300):
 x=random.randrange(w);y=random.randrange(205,h)
 d.rectangle((x,y,x+random.randrange(1,5),y+1),fill=random.choice(['#52444d','#6c5453','#413540','#59464c']))
# wilted stems and bowed petals
for i in range(57):
 x=random.randrange(w);y=random.randrange(196,242);top=y-random.randint(10,28)
 if 271<x<451 and y<221:continue
 clr=random.choice(['#816a73','#967a75','#6d626b','#a2847a','#655863'])
 d.line((x,y,x-2,top+5,x-8,top), fill='#5f6860',width=2)
 d.rectangle((x-12,top-4,x-7,top-2),fill=clr)
 d.rectangle((x-11,top,x-6,top+3),fill=clr)
 d.rectangle((x-6,top+2,x-4,top+5),fill='#4e494f')
 d.line((x-1,y-9,x+4,y-13),fill='#697369',width=2)
# Golden speckled aura around rose
for i in range(45):
 ang=random.random()*math.tau;rad=random.uniform(11,42)
 x=int(362+math.cos(ang)*rad);y=int(175+math.sin(ang)*rad)
 if 0<x<w and 0<y<200:
  s=random.choice([1,1,2,3]);d.rectangle((x,y,x+s,y+s), fill=random.choice(['#f1c994','#ffa9c5','#d7bda2']))
# Couple behind flower
for fn,x,y,size in [('chico_0.png',291,142,(48,72)),('chica.png',397,119,(62,93))]:
 sp=Image.open(p/fn)
 sp=sp.resize(size,Image.Resampling.NEAREST)
 im.paste(sp,(x,y),sp)
# Pixeles brillantes cerca de la corona de nuestra reina.
for x,y,c in [(420,115,'#ffe5a1'),(461,132,'#ffb5cb'),(389,137,'#ffe2ac'),
              (445,110,'#f4bf60'),(464,158,'#f9aec9')]:
 d.rectangle((x,y,x+2,y+2),fill=c)
# Rose, lively and special
# stalk and leaves
d.line((370,207,366,171),fill='#3e644a',width=4)
d.line((367,194,357,188),fill='#4c8555',width=3)
d.line((366,192,379,184),fill='#4c8555',width=3)
d.polygon([(356,191),(348,185),(356,184),(363,189)],fill='#6aad65')
d.polygon([(373,191),(379,181),(383,182),(381,190)],fill='#79b768')
# petals pixel clusters
d.rectangle((357,158,374,178),fill='#a52f5d')
d.rectangle((353,161,378,174),fill='#db416e')
d.rectangle((360,154,371,181),fill='#ff8b9e')
d.rectangle((354,162,374,171),fill='#ff6586')
d.rectangle((360,159,370,174),fill='#ffd4c6')
d.rectangle((362,163,369,172),fill='#e93b71')
d.rectangle((363,165,366,170),fill='#a6215a')
# reflective pixel motes
for px,py in [(381,146),(345,154),(385,177),(355,137),(397,164)]:d.rectangle((px,py,px+2,py+2),fill='#ffe4b9')
im.resize((960,500),Image.Resampling.NEAREST).save(p/'portada.png',optimize=True)
