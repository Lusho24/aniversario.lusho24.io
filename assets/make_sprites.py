"""Sprites sencillos en estilo pixel art de cuento: una reina joven y su enamorado.

La reina lleva corona, cabello largo y vestido rosado. NO lleva aretes.
Ambos están dibujados mirando el uno hacia el otro en el juego.

Opcional para redibujar después de editar el código:
  python -m pip install Pillow
  python assets/make_sprites.py
  python assets/make_cover.py
Para jugar NO hace falta Python.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(__file__).parent
W, H = 48, 72

# Paleta pastel, con contornos limpios, detalles grandes y legibles en celular.
INK = '#382c45'
INK_LITE = '#5b3c60'
WHITE = '#fffaf2'
SKIN = '#f6ba9b'
SKIN_BRIGHT = '#ffdac1'
SKIN_SHADOW = '#e39782'
BLUSH = '#f093a4'
CARAMEL = '#af5e6e'
HAIR = '#30283c'
HAIR_MID = '#4a3649'
HAIR_GLOW = '#745163'
PINK_DARK = '#bb5b84'
PINK = '#f28eac'
PINK_LIGHT = '#ffc1d1'
PINK_PALE = '#ffe0e5'
GOLD_SHADOW = '#b97d48'
GOLD = '#f4bf60'
GOLD_LIGHT = '#ffe5a1'
EMERALD = '#7bb6ac'


def rect(d, coords, color):
    d.rectangle(coords, fill=color)


def poly(d, coords, color):
    d.polygon(coords, fill=color)


def boy(step=0):
    """Chico estilo chibi mirando a la derecha; sudadera clara y sonrisa juvenil."""
    im = Image.new('RGBA', (W, H))
    d = ImageDraw.Draw(im)

    # Zapatos y pasos de caminata (3 cuadros)
    if step == 0:
        pant = [(14, 54, 23, 65), (27, 54, 35, 65)]
        shoes = [(11, 64, 25, 69), (25, 64, 42, 69)]
    elif step == 1:
        pant = [(13, 54, 22, 63), (27, 53, 35, 62)]
        shoes = [(8, 62, 23, 67), (29, 61, 44, 66)]
    else:
        pant = [(17, 54, 25, 62), (27, 54, 35, 65)]
        shoes = [(15, 60, 30, 65), (24, 64, 41, 69)]
    for x0, y0, x1, y1 in pant:
        rect(d, (x0-1,y0-1,x1+1,y1+1), INK)
        rect(d, (x0,y0,x1,y1), '#67708b')
        rect(d, (x0+1,y0,x0+3,y1-2), '#8993ab')
    for x0, y0, x1, y1 in shoes:
        rect(d, (x0,y0,x1,y1), INK)
        rect(d, (x0+1,y0+1,x1-1,y1-2), WHITE)
        rect(d, (x0+2,y0+1,x0+5,y0+2), '#cfd9dc')
        rect(d, (x0+1,y1-1,x1,y1), '#8b7790')

    # Sudadera grande color crema, puños y mini corazón.
    poly(d, [(14,36),(31,36),(39,40),(42,49),(39,56),(9,56),(7,52),(8,43)], INK)
    poly(d, [(14,38),(31,38),(37,41),(39,49),(37,54),(11,54),(10,51),(10,43)], '#e7d8c7')
    poly(d, [(17,39),(30,39),(35,43),(35,53),(14,53),(13,44)], '#fff3df')
    rect(d, (13,50,34,53), '#e5d5be')
    d.line([(16,47),(17,50),(29,50),(30,47)], fill='#e3d0b9',width=1)
    poly(d, [(11,40),(16,39),(16,45),(14,51),(12,53),(8,51),(8,46)], '#f5e9d6')
    poly(d, [(34,40),(38,41),(42,48),(40,52),(36,50),(34,44)], '#f7ebd7')
    rect(d, (9,50,13,53), '#d6c4ab')
    rect(d, (37,49,41,52), '#d6c4ab')
    rect(d, (39,51,42,54), INK)
    rect(d, (40,51,42,53), SKIN)
    # Corazón minimalista (inspirado en regalo de aniversario).
    rect(d,(25,44,26,45),'#df7d9b')
    rect(d,(28,44,29,45),'#df7d9b')
    poly(d,[(24,46),(30,46),(27,50)],'#df7d9b')

    # Cuello, cuello de sudadera.
    rect(d,(21,32,30,40),INK)
    rect(d,(23,33,29,39),SKIN_SHADOW)
    rect(d,(24,33,28,38),SKIN)
    poly(d,[(18,37),(22,39),(30,39),(33,37),(32,41),(20,43)],WHITE)

    # Cabeza chibi redonda y simpática, nariz pequeñita hacia la derecha.
    poly(d,[(14,16),(21,12),(32,13),(39,19),(40,24),(41,26),
             (44,28),(42,31),(40,33),(38,37),(30,40),(20,38),
             (14,32),(12,24)], INK)
    poly(d,[(15,18),(22,15),(31,15),(37,20),(38,26),(40,27),
             (42,29),(39,30),(38,33),(35,36),(29,38),(21,36),
             (16,31),(14,25)], SKIN)
    poly(d,[(19,18),(30,17),(35,22),(36,28),(34,32),(29,34),
             (19,31),(16,25)],SKIN_BRIGHT)
    rect(d,(16,26,18,28),SKIN_SHADOW)
    rect(d,(17,25,19,27),SKIN)
    # Pelo oscuro con mechones suaves, sin barba: aspecto juvenil.
    poly(d,[(12,25),(10,19),(11,14),(9,13),(13,9),(17,10),
             (20,6),(24,9),(29,6),(33,9),(36,8),(40,13),
             (39,21),(36,24),(33,20),(29,19),(27,22),(23,19),
             (19,22),(16,27)],HAIR)
    poly(d,[(12,17),(16,12),(22,12),(24,9),(27,13),(31,10),
             (36,13),(37,18),(31,16),(26,18),(22,16),(17,20)],HAIR_MID)
    rect(d,(15,13,19,14),HAIR_GLOW)
    rect(d,(24,11,28,12),HAIR_GLOW)
    rect(d,(32,13,35,14),'#6a4b5b')
    # Ojo brillante en dirección derecha, mejilla y sonrisa.
    rect(d,(33,25,36,28),INK)
    rect(d,(34,25,35,26),WHITE)
    rect(d,(27,31,30,32),BLUSH)
    d.line([(35,32),(37,33),(39,32)], fill=CARAMEL, width=1)
    return im


def girl(wave=False):
    """Reina joven de cuento mirando a la izquierda: corona + vestido rosa, SIN aretes."""
    im = Image.new('RGBA',(W,H))
    d = ImageDraw.Draw(im)

    # Cabello largo en ondas detrás del vestido, desciende hasta la falda.
    poly(d,[(20,14),(30,10),(37,14),(41,22),(40,35),
            (43,44),(42,51),(45,57),(43,62),(38,61),(36,66),
            (30,64),(29,50),(30,29)], INK)
    poly(d,[(25,14),(31,12),(36,16),(39,23),(38,36),(40,44),
            (39,51),(42,58),(40,60),(36,58),(34,63),
            (31,56),(32,30)],HAIR)
    poly(d,[(33,18),(37,23),(36,35),(38,45),(37,54),(35,50),(34,36)],HAIR_MID)
    d.line([(39,42),(39,47),(40,52)],fill=HAIR_GLOW,width=1)

    # Falda amplia de princesa, dibujada antes del torso y brazos.
    poly(d,[(18,47),(31,46),(37,52),(42,60),(45,68),(43,71),
            (7,71),(6,68),(9,59),(14,51)], INK)
    poly(d,[(18,49),(31,49),(35,53),(40,61),(42,69),
            (9,69),(11,61),(15,53)], PINK_DARK)
    poly(d,[(18,51),(31,50),(35,55),(38,62),(40,68),
            (11,68),(14,59)], PINK)
    poly(d,[(18,52),(23,51),(23,67),(14,67),(17,56)], PINK_LIGHT)
    poly(d,[(28,52),(33,55),(37,66),(32,67),(29,60)],'#ffa7c0')
    d.line([(23,55),(21,65)],fill='#ffe0df',width=1)
    d.line([(32,58),(35,66)],fill='#e573a0',width=2)
    rect(d,(12,68,39,69),PINK_PALE)
    rect(d,(18,67,25,67),'#fff2ee')
    rect(d,(32,67,36,67),'#fff2ee')

    # Torso rosa con pequeña cintura, mangas bonitas y collar dorado.
    poly(d,[(17,37),(31,37),(37,42),(37,51),(33,55),
            (14,55),(11,50),(12,43)], INK)
    poly(d,[(18,39),(31,39),(35,43),(34,50),(31,53),
            (16,53),(14,50),(14,44)],PINK)
    poly(d,[(18,39),(22,42),(22,51),(17,51),(15,45)],PINK_LIGHT)
    poly(d,[(30,39),(34,43),(34,48),(31,52),(28,52)],'#ec719e')
    poly(d,[(21,40),(25,43),(29,40),(29,46),(25,49),(20,46)],WHITE)
    poly(d,[(22,41),(25,43),(28,41),(26,45),(24,45)],PINK_PALE)
    rect(d,(19,51,31,53),GOLD)
    rect(d,(23,52,27,53),GOLD_LIGHT)
    rect(d,(24,49,26,51),'#ffeff5')
    # Manga abombada derecha.
    poly(d,[(31,39),(37,40),(41,44),(39,49),(35,51),(32,48)],INK)
    poly(d,[(32,41),(37,42),(39,45),(37,49),(34,48)],PINK_LIGHT)
    rect(d,(35,49,39,51),SKIN)

    if wave:
        # Saluda levantando su mano hacia la flor/el protagonista.
        poly(d,[(16,39),(12,38),(7,34),(6,27),(9,25),(13,31),
                (19,36),(21,42)], INK)
        poly(d,[(16,40),(11,36),(8,33),(9,30),(13,34),(18,38)],PINK_LIGHT)
        rect(d,(6,23,10,30),SKIN)
        rect(d,(7,20,8,27),SKIN_BRIGHT)
        rect(d,(10,22,11,26),SKIN_BRIGHT)
        rect(d,(8,28,10,31),SKIN_SHADOW)
    else:
        poly(d,[(17,39),(12,40),(9,45),(10,50),(13,53),
                (17,51),(19,46)], INK)
        poly(d,[(16,41),(13,42),(11,46),(12,50),(15,50),(18,44)],PINK_LIGHT)
        rect(d,(11,50,14,53),SKIN)
        rect(d,(11,50,12,51),SKIN_BRIGHT)

    # Cuello y cabeza redondeada: perfil izquierdo / mirada cariñosa.
    rect(d,(22,33,29,41),INK)
    rect(d,(23,33,28,40),SKIN_SHADOW)
    rect(d,(24,34,28,39),SKIN)
    poly(d,[(20,39),(24,42),(29,39),(30,41),(24,44)],WHITE)

    poly(d,[(18,15),(28,13),(35,17),(37,22),(36,30),(33,35),
            (27,38),(17,37),(13,34),(10,32),(8,30),(10,27),
            (11,21)],INK)
    poly(d,[(18,17),(28,15),(34,19),(34,29),(31,34),
            (26,36),(18,35),(14,32),(11,30),(10,29),(13,27),(13,22)],SKIN)
    poly(d,[(16,21),(24,18),(32,20),(32,28),(29,32),
            (20,33),(15,29)],SKIN_BRIGHT)
    # Ojo grande, pestaña suave, sonrojo juvenil y pequeña sonrisa.
    rect(d,(16,24,19,28),INK)
    rect(d,(16,24,17,25),WHITE)
    rect(d,(15,24,15,25),INK)
    rect(d,(20,29,23,30),BLUSH)
    rect(d,(12,32,14,32),CARAMEL)
    rect(d,(14,33,16,33),'#dc7995')

    # Flequillo redondo barrido a un lado, y cabellera sin orejas dibujadas.
    poly(d,[(11,23),(10,18),(14,14),(18,11),(25,11),
            (31,13),(36,18),(37,24),(35,28),(33,24),
            (30,21),(25,19),(23,22),(19,21),(16,25),(14,28)],HAIR)
    poly(d,[(13,19),(18,14),(23,14),(30,16),(28,18),
            (23,17),(20,20),(16,20)],HAIR_MID)
    rect(d,(17,15,21,16),HAIR_GLOW)
    rect(d,(27,16,29,16),HAIR_GLOW)
    rect(d,(33,25,36,29),HAIR)
    d.line([(33,31),(33,42),(35,49)],fill=HAIR_MID,width=2)
    # Corona real, clara incluso cuando el sprite se reduce a ~35px.
    poly(d,[(17,15),(15,7),(20,10),(23,4),(27,9),(31,3),
            (34,11),(37,8),(35,16)],INK)
    poly(d,[(18,13),(17,9),(21,11),(23,7),(27,11),
            (31,6),(33,13),(35,11),(34,15)],GOLD)
    rect(d,(19,13,34,15),GOLD_SHADOW)
    rect(d,(21,12,32,13),GOLD_LIGHT)
    rect(d,(25,9,27,11),'#f883a3')
    rect(d,(26,9,26,9),WHITE)
    rect(d,(19,8,20,9),GOLD_LIGHT)
    rect(d,(30,7,31,8),GOLD_LIGHT)
    # Una joyita pequeña en el cinturón, no en la oreja.
    rect(d,(24,51,27,54),'#fff3d1')
    rect(d,(25,51,26,52),'#ff9bb9')
    return im


if __name__ == '__main__':
    for i in range(3):
        boy(i).save(ASSETS/f'chico_{i}.png',optimize=True)
    girl(False).save(ASSETS/'chica.png',optimize=True)
    girl(True).save(ASSETS/'chica_saluda.png',optimize=True)
    print('Generados: 3 sprites del chico y 2 de la reina, sin aretes.')
