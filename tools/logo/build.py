#!/usr/bin/env python3
"""Genera el sistema de logo de Casa Coro Coro (SVG puro, sin fuentes externas).
Uso: python3 tools/logo/build.py   -> escribe img/logo*.svg y favicon.svg"""
import math, os
INK, GOLD, SAND = "#0F3D3E", "#C9973F", "#F6F0E4"

# ---------- alfabeto monolinea (alto de caja = 1) ----------
GL = {
 "C": ("M.883,.179A.5,.5 0 1 0 .883,.821", .9),
 "O": ("M1,.5A.5,.5 0 1 1 0,.5A.5,.5 0 1 1 1,.5Z", 1.0),
 "R": ("M0,1L0,0L.3,0A.27,.27 0 0 1 .3,.54L0,.54M.3,.54L.6,1", .6),
 "A": ("M0,1L.42,0L.84,1M.155,.66L.685,.66", .84),
 "S": ("M.497,.125A.25,.25 0 1 0 .28,.5A.25,.25 0 1 1 .063,.875", .56),
 "L": ("M0,0L0,1L.5,1", .5),
 "Q": ("M1,.5A.5,.5 0 1 1 0,.5A.5,.5 0 1 1 1,.5ZM.62,.68L.96,1.04", 1.0),
 "U": ("M0,0L0,.64A.36,.36 0 0 0 .72,.64L.72,0", .72),
 "E": ("M.52,0L0,0L0,1L.52,1M0,.5L.44,.5", .52),
 " ": ("", .42),
}
def word(txt, h, track, sw, color=INK, x=0, y=0, anchor="middle"):
    adv = [GL[c][1]*h for c in txt]
    total = sum(adv) + track*h*(len(txt)-1)
    cx = x - total/2 if anchor == "middle" else x
    out = []
    for c, a in zip(txt, adv):
        d = GL[c][0]
        if d:
            out.append(f'<path transform="translate({cx:.2f},{y:.2f}) scale({h})" d="{d}"/>')
        cx += a + track*h
    return (f'<g fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" vector-effect="non-scaling-stroke">' +
            "".join(o.replace("<path", f'<path stroke-width="{sw/h:.4f}"') for o in out) + "</g>"), total

# ---------- el pez (corocoro), mirando a la derecha, centrado en 0,0 ----------
BODY = ("M118,2C100,-36 46,-58 -8,-50C-38,-45 -58,-24 -72,-9"
        "C-88,-20 -102,-36 -118,-46Q-100,0 -118,46C-102,36 -88,20 -72,9"
        "C-56,26 -30,44 2,46C50,48 100,34 118,2Z")
def bez(p0, p1, p2, p3, t):
    u = 1-t
    return (u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
            u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1])
TOP = ((118,2),(100,-36),(46,-58),(-8,-50))
def spines():
    out = []
    LEN = [22, 29, 27, 23, 18, 13]
    n = len(LEN)
    for i, L in enumerate(LEN):
        t = .46 + .50*i/(n-1)
        bx, by = bez(*TOP, t)
        ang = math.radians(98 + 6*i)           # se inclinan hacia la cola
        out.append(f"M{bx:.1f},{by-9:.1f}L{bx+L*math.cos(ang):.1f},{by-9-L*math.sin(ang):.1f}")
    return "".join(out)
def dots():
    out = []
    rows = [(-25, 62, -52, 7), (-7, 70, -58, 8), (11, 62, -50, 7), (27, 40, -30, 5)]
    for y, x1, x0, n in rows:
        for i in range(n):
            x = x1 + (x0-x1)*i/(n-1)
            k = (x-x0)/(x1-x0)                 # 1 cerca de la cabeza
            yy = y*(0.55+0.45*math.sin(math.pi*min(1,(x+72)/150)))
            if x > 60 and abs(yy+8) < 16: continue   # deja libre el ojo
            out.append(f'<circle cx="{x:.1f}" cy="{yy:.1f}" r="{2.0+1.5*k:.2f}"/>')
    return "".join(out)
def fish(ink=INK, gold=GOLD, sw=5):
    return (f'<g fill="none" stroke="{ink}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{BODY}"/><path d="{spines()}"/>'
            f'<circle cx="82" cy="-9" r="9.5"/></g>'
            f'<circle cx="84" cy="-9" r="3.6" fill="{ink}"/>'
            f'<g fill="{gold}">{dots()}</g>')

def svg(w, h, body, vb=None, bg=None):
    vb = vb or f"0 0 {w} {h}"
    r = f'<rect x="{vb.split()[0]}" y="{vb.split()[1]}" width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="Casa Coro Coro">{r}{body}</svg>\n'

def stacked(ink=INK, gold=GOLD):
    f = f'<g transform="translate(300,112)">{fish(ink,gold)}</g>'
    casa, _ = word("CASA", 15, .62, 2.2, ink, 300, 208)
    main, _ = word("CORO CORO", 54, .2, 5, ink, 300, 246)
    rule = f'<g stroke="{gold}" stroke-width="1.6" stroke-linecap="round"><path d="M118,346H196M404,346H482"/></g>'
    sub, _ = word("LOS ROQUES", 12, .7, 1.9, ink, 300, 340)
    return svg(600, 392, f + casa + main + rule + sub)
def horizontal(ink=INK, gold=GOLD):
    f = f'<g transform="translate(88,60) scale(.62)">{fish(ink,gold,sw=6)}</g>'
    main, tot = word("CORO CORO", 34, .22, 3.6, ink, 182, 34, anchor="start")
    casa, _ = word("CASA", 9, .7, 1.5, ink, 183, 14, anchor="start")
    return svg(190+tot, 120, f + casa + main, vb=f"0 0 {190+tot:.0f} 120")
def mark(ink=INK, gold=GOLD):
    return svg(260, 150, f'<g transform="translate(130,84)">{fish(ink,gold)}</g>')
def favicon():
    return svg(64, 64, f'<rect width="64" height="64" rx="14" fill="{INK}"/>'
               f'<g transform="translate(32,35) scale(.215)">{fish("#F6F0E4",GOLD,sw=9)}</g>')
def wordmark(ink=INK):
    main, tot = word("CORO CORO", 54, .2, 5, ink, 0, 4, anchor="start")
    return svg(tot+8, 62, f'<g transform="translate(4,0)">{main}</g>', vb=f"0 0 {tot+8:.0f} 62")

if __name__ == "__main__":
    os.makedirs("img", exist_ok=True)
    W = {"img/logo.svg": stacked(), "img/logo-claro.svg": stacked(SAND, "#E3B768"),
         "img/logo-horizontal.svg": horizontal(), "img/logo-horizontal-claro.svg": horizontal(SAND, "#E3B768"),
         "img/logo-pez.svg": mark(), "img/logo-pez-claro.svg": mark(SAND, "#E3B768"),
         "img/logo-texto.svg": wordmark(), "favicon.svg": favicon()}
    for p, s in W.items():
        open(p, "w").write(s)
    print("ok", len(W))
