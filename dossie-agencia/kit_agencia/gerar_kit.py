# -*- coding: utf-8 -*-
"""
VGJ · Advocacia em Saúde — GUIA DE COLABORAÇÃO PARA A AGÊNCIA
PDF editorial ilustrado. Paleta quente (creme / café / dourado / terracota),
sem os grandes campos azul-marinho. Marca VGJ preservada.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, NextPageTemplate, PageBreak, Flowable,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "proposta_vgj", "assets")
A = lambda n: os.path.join(ASSETS, n)
OUT = os.path.join(HERE, "VGJ_Guia_Colaboracao_Agencia.pdf")

# ---------------------------------------------------------------- paleta quente
ESP    = HexColor("#2B2620")   # café/grafite escuro (campos escuros)
ESP2   = HexColor("#3B342B")
INK    = HexColor("#38332B")   # texto (grafite quente)
GRAY   = HexColor("#847B6C")
GOLD   = HexColor("#B0894F")   # dourado (marca)
GOLD_L = HexColor("#CBAA6E")
CLAY   = HexColor("#B4653F")   # terracota (acento secundário)
CLAY_L = HexColor("#C98A64")
SAGE   = HexColor("#7E8666")   # verde-oliva discreto (aprovado / positivo)
PAPER  = HexColor("#FAF6EF")   # papel
CARD   = HexColor("#FFFDF8")
CARD2  = HexColor("#F3ECDD")   # cartão destaque
LINE   = HexColor("#E7DECC")
LINE2  = HexColor("#DCCFB6")
WHITE  = HexColor("#FFFFFF")
CREAMW = HexColor("#ECE3D2")   # texto claro sobre café

W, Hh = A4
L, Rm, TOP, BOT = 20 * mm, 20 * mm, 20 * mm, 18 * mm
FW = W - L - Rm

SER, SERB, SERI = "Times-Roman", "Times-Bold", "Times-Italic"
SANS, SANB, SANI = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"

def sp(txt):
    nb = "\u00a0"
    return (nb * 3).join(nb.join(w) for w in txt.split())

def stl(name, **kw):
    base = dict(fontName=SANS, fontSize=10, leading=15, textColor=INK, alignment=TA_LEFT)
    base.update(kw); return ParagraphStyle(name, **base)

ST = {
    "kick":  stl("kick", fontName=SANB, fontSize=8, leading=12, textColor=GOLD),
    "kickw": stl("kickw", fontName=SANB, fontSize=8, leading=12, textColor=GOLD_L),
    "disp":  stl("disp", fontName=SERB, fontSize=26, leading=29, textColor=ESP, spaceAfter=9),
    "disp2": stl("disp2", fontName=SERB, fontSize=21, leading=24, textColor=ESP),
    "body":  stl("body", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9),
    "bodyj": stl("bodyj", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9, alignment=TA_JUSTIFY),
    "small": stl("small", fontSize=8.6, leading=12.5, textColor=GRAY),
    "cap":   stl("cap", fontSize=8, leading=11, textColor=GRAY, alignment=TA_CENTER),
    "cardk": stl("cardk", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "cardh": stl("cardh", fontName=SERB, fontSize=13.5, leading=17, textColor=ESP),
    "cardb": stl("cardb", fontSize=9.4, leading=14, textColor=INK),
    "th":    stl("th", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "td":    stl("td", fontSize=8.8, leading=13, textColor=INK),
    "tdb":   stl("tdb", fontName=SANB, fontSize=8.8, leading=13, textColor=ESP),
    "cov_k": stl("cov_k", fontName=SANB, fontSize=9, leading=13, textColor=GOLD_L),
    "cov_t": stl("cov_t", fontName=SERB, fontSize=39, leading=43, textColor=WHITE),
    "cov_s": stl("cov_s", fontName=SERI, fontSize=13.5, leading=20, textColor=CREAMW),
    "cov_m": stl("cov_m", fontSize=9, leading=15, textColor=HexColor("#B4A892")),
    "dk_h":  stl("dk_h", fontName=SERB, fontSize=24, leading=28, textColor=WHITE),
    "dk_b":  stl("dk_b", fontSize=10.2, leading=16, textColor=CREAMW, spaceAfter=7),
    "dk_s":  stl("dk_s", fontName=SANB, fontSize=8, leading=13, textColor=GOLD_L),
    "pullw": stl("pullw", fontName=SERI, fontSize=16, leading=23, textColor=WHITE),
    "good":  stl("good", fontSize=9.2, leading=14, textColor=INK),
    "bad":   stl("bad", fontSize=9.2, leading=14, textColor=INK),
}

# ================================================================ drawing helpers
class Art(Flowable):
    def __init__(self, w, h, fn): super().__init__(); self._w=w; self._h=h; self.fn=fn
    def wrap(self,*a): return self._w, self._h
    def draw(self): self.fn(self.canv, self._w, self._h)
def art(fn, h, w=FW): return Art(w, h, fn)

def _card(c, x, y, w, h, fill=CARD, stroke=LINE, lw=1, r=7, accent=None, aw=3):
    if fill is not None:
        c.setFillColor(fill); c.roundRect(x, y, w, h, r, stroke=0, fill=1)
    if accent is not None:
        c.setFillColor(accent); c.roundRect(x, y, aw, h, aw, stroke=0, fill=1)
        c.setFillColor(fill if fill else CARD); c.rect(x+aw, y, aw, h, stroke=0, fill=1)
    if stroke is not None:
        c.setStrokeColor(stroke); c.setLineWidth(lw); c.roundRect(x, y, w, h, r, stroke=1, fill=0)

def _t(c, x, y, s, font=SANS, size=9, color=INK, align="l"):
    c.setFillColor(color); c.setFont(font, size)
    (c.drawCentredString if align=="c" else c.drawRightString if align=="r" else c.drawString)(x, y, s)

# pictograms
def ic_person(c, cx, cy, s, col=ESP, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy+s*0.55, s*0.32, stroke=1, fill=0)
    c.arc(cx-s*0.55, cy-s*0.9, cx+s*0.55, cy+s*0.35, 20, 140)
def ic_child(c, cx, cy, s, col=ESP, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy+s*0.5, s*0.28, stroke=1, fill=0)
    c.arc(cx-s*0.42, cy-s*0.75, cx+s*0.42, cy+s*0.2, 20, 140)
def ic_shield(c, cx, cy, s, col=ESP, lw=2.2, fill=None):
    p=c.beginPath(); p.moveTo(cx, cy+s); p.lineTo(cx+s*0.8, cy+s*0.55)
    p.lineTo(cx+s*0.8, cy-s*0.2)
    p.curveTo(cx+s*0.8, cy-s*0.7, cx+s*0.4, cy-s*0.95, cx, cy-s*1.05)
    p.curveTo(cx-s*0.4, cy-s*0.95, cx-s*0.8, cy-s*0.7, cx-s*0.8, cy-s*0.2)
    p.lineTo(cx-s*0.8, cy+s*0.55); p.close()
    if fill is not None: c.setFillColor(fill); c.drawPath(p, stroke=0, fill=1)
    c.setStrokeColor(col); c.setLineWidth(lw); c.drawPath(p, stroke=1, fill=0)
def ic_building(c, x, y, w, h, col=ESP, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.rect(x, y, w, h, stroke=1, fill=0)
    for i in range(3):
        for j in range(4):
            c.rect(x+w*(0.18+0.32*i), y+h*(0.15+0.21*j), w*0.14, h*0.1, stroke=0, fill=1)
def ic_card(c, x, y, w, h, col=ESP, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.roundRect(x, y, w, h, 3, stroke=1, fill=0)
    c.setFillColor(col); c.rect(x, y+h*0.62, w, h*0.16, stroke=0, fill=1)
    c.setLineWidth(1.3); c.line(x+w*0.12, y+h*0.32, x+w*0.6, y+h*0.32)
    c.line(x+w*0.12, y+h*0.18, x+w*0.45, y+h*0.18)
def ic_plus(c, cx, cy, s, col=GOLD):
    c.setFillColor(col); c.rect(cx-s*0.18, cy-s*0.5, s*0.36, s, stroke=0, fill=1)
    c.rect(cx-s*0.5, cy-s*0.18, s, s*0.36, stroke=0, fill=1)
def ic_gavel(c, cx, cy, s, col=ESP, lw=2.4):
    c.saveState(); c.translate(cx, cy); c.rotate(-38)
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.roundRect(-s*0.55, s*0.28, s*1.1, s*0.42, 3, stroke=0, fill=1)
    c.setLineWidth(lw); c.line(0, s*0.28, 0, -s*0.75); c.restoreState()
    c.setLineWidth(2); c.setStrokeColor(col); c.line(cx-s*0.7, cy-s*0.9, cx+s*0.7, cy-s*0.9)
def ic_check(c, cx, cy, s, col=SAGE, lw=2.8):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    c.line(cx-s*0.5, cy, cx-s*0.1, cy-s*0.45); c.line(cx-s*0.1, cy-s*0.45, cx+s*0.6, cy+s*0.5)
    c.setLineCap(0)
def ic_x(c, cx, cy, s, col=CLAY, lw=2.8):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    c.line(cx-s*0.4, cy-s*0.4, cx+s*0.4, cy+s*0.4); c.line(cx-s*0.4, cy+s*0.4, cx+s*0.4, cy-s*0.4)
    c.setLineCap(0)

# ---------------------------------------------------------------- ILLUSTRATIONS
def art_shifts(c, w, h):
    items = [("01", "Falar com a FAMÍLIA,\nnão com o doente", "person2"),
             ("02", "Mirar PLANO e SUS,\nnão só plano", "two"),
             ("03", "Vender PRESENÇA,\nnunca resultado", "shield")]
    cw = w/3
    for i,(n,txt,ic) in enumerate(items):
        x = cw*i; cx = x+cw/2
        _card(c, x+6, 8, cw-12, h-16, fill=CARD, stroke=LINE, accent=GOLD, r=8)
        _t(c, x+18, h-26, n, SERB, 20, GOLD_L, "l")
        cy = h*0.60
        if ic=="person2":
            ic_person(c, cx-10, cy, 15, col=ESP); ic_person(c, cx+12, cy-3, 12, col=CLAY_L)
        elif ic=="two":
            ic_building(c, cx-26, cy-6, 20, 22, col=ESP, lw=1.6)
            ic_building(c, cx+6, cy-6, 20, 22, col=GOLD, lw=1.6)
        else:
            ic_shield(c, cx, cy+4, 15, col=ESP, lw=2.2); ic_plus(c, cx, cy+2, 9, col=GOLD)
        for k,line in enumerate(txt.split("\n")):
            _t(c, cx, h*0.30 - k*11, line, SANB, 9, ESP, "c")

def art_twofronts(c, w, h):
    midx=w/2
    ic_person(c, midx, h*0.5, 22, col=ESP)
    _t(c, midx, h*0.5-26, "o paciente", SANB, 8.5, ESP, "c")
    _t(c, midx, h*0.5-36, "com tratamento negado", SANS, 7.5, GRAY, "c")
    colw=80; lx=w*0.05; rx=w-w*0.05-colw
    for x,title,sub,base,acc in [
        (lx,"PLANO PRIVADO","operadora que nega","Lei 9.656/98  ·  CDC", GOLD),
        (rx,"SUS / ESTADO","fila que não anda","Art. 196 da Constituição", CLAY)]:
        _card(c, x, h*0.27, colw, h*0.52, fill=CARD, stroke=LINE, accent=acc, r=6)
        ic_building(c, x+colw/2-13, h*0.56, 26, h*0.16, col=ESP, lw=1.8)
        _t(c, x+colw/2, h*0.48, title, SANB, 8.5, ESP, "c")
        _t(c, x+colw/2, h*0.40, sub, SANS, 7.8, GRAY, "c")
        _t(c, x+colw/2, h*0.31, base, SANS, 7, acc, "c")
        c.setStrokeColor(GOLD); c.setLineWidth(1.6); c.setDash(2,2)
        c.line(midx+(30 if x>midx else -30), h*0.5, x+colw/2, h*0.54); c.setDash()
    _t(c, midx, h*0.15, "mesma dor  ·  mesma urgência  ·  mesma liminar (art. 300, CPC)", SANB, 8, ESP, "c")
    _t(c, midx, h*0.06, "só muda quem está do outro lado do balcão", SERI, 9.5, GRAY, "c")

def art_persona(c, w, h):
    cols=[("MÃE","criança com TEA","child"),("FILHO / FILHA","pai ou mãe idosos","elder"),
          ("CÔNJUGE","adulto em tratamento","adult")]
    cw=w/3
    for i,(who,care,kind) in enumerate(cols):
        cx=cw*i+cw/2
        c.setFillColor(CARD2); c.circle(cx+13, h*0.62, 12, stroke=0, fill=1)
        if kind=="child": ic_child(c, cx+13, h*0.55, 15, col=CLAY_L)
        else: ic_person(c, cx+13, h*0.5, 15, col=CLAY_L)
        ic_person(c, cx-8, h*0.5, 20, col=ESP)
        _t(c, cx, h*0.24, who, SANB, 8.5, ESP, "c")
        _t(c, cx, h*0.15, "cuida de "+care, SANS, 7.8, GRAY, "c")
        if i<2:
            c.setStrokeColor(LINE); c.setLineWidth(1); c.line(cw*(i+1), h*0.15, cw*(i+1), h*0.8)

def art_scale(c, w, h):
    midx=w/2; topy=h*0.90; base_y=h*0.34
    c.setStrokeColor(ESP); c.setLineWidth(3); c.line(midx, base_y, midx, topy)
    c.setLineWidth(2); c.line(midx-20, base_y, midx+20, base_y)
    c.setFillColor(ESP); c.circle(midx, topy, 4, stroke=0, fill=1)
    half=w*0.30; tilt=8
    lxp,lyp=midx-half, topy-2+tilt; rxp,ryp=midx+half, topy-2-tilt
    c.setLineWidth(3); c.line(lxp, lyp, rxp, ryp)
    labely=min(lyp,ryp)-42
    def pan(px,py,tone,title,lines):
        c.setStrokeColor(ESP); c.setLineWidth(1.3)
        c.line(px,py,px-18,py-22); c.line(px,py,px+18,py-22)
        c.setStrokeColor(tone); c.setLineWidth(2.6); c.arc(px-20,py-34,px+20,py-14,200,140)
        _t(c, px, labely, title, SANB, 8.5, ESP, "c")
        yy=labely-12
        for ln in lines: _t(c, px, yy, ln, SANS, 7.6, GRAY, "c"); yy-=10
    pan(lxp,lyp,CLAY_L,"MENSALIDADE DO PLANO",["todo mês, pra sempre","e ainda pode negar"])
    pan(rxp,ryp,GOLD,"HONORÁRIO",["uma vez, quando precisa","e obriga a entregar"])
    _t(c, midx, h*0.03, "o cliente não compra uma petição — compra a certeza do tratamento", SERI, 9.5, ESP2, "c")

def art_funnel(c, w, h):
    steps=[("ANÚNCIO","post ou reel de texto",GOLD),
           ("FORMULÁRIO","qualifica + aviso LGPD",GOLD),
           ("WHATSAPP","resposta em até 1h útil",CLAY),
           ("REUNIÃO","horário já oferecido",GOLD),
           ("CLIENTE","tratamento em curso",SAGE)]
    n=len(steps); top=h-6; bh=(h-14)/n
    maxw=w*0.62; minw=w*0.26; midx=w*0.34
    for i,(t,s,acc) in enumerate(steps):
        y=top-(i+1)*bh
        wt=maxw-(maxw-minw)*i/(n-1); wb=maxw-(maxw-minw)*(i+1)/(n-1)
        p=c.beginPath()
        p.moveTo(midx-wt/2, y+bh); p.lineTo(midx+wt/2, y+bh)
        p.lineTo(midx+wb/2, y); p.lineTo(midx-wb/2, y); p.close()
        c.setFillColor(CARD if i%2 else CARD2); c.drawPath(p, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.setLineWidth(0.8); c.drawPath(p, stroke=1, fill=0)
        c.setFillColor(acc); c.circle(midx, y+bh/2, 3, stroke=0, fill=1)
        _t(c, midx, y+bh/2+2, t, SANB, 9, ESP, "c")
        # side label
        _t(c, midx+maxw/2+14, y+bh/2+1, s, SANS, 8, GRAY, "l")
        c.setStrokeColor(LINE2); c.setLineWidth(0.7)
        c.line(midx+wt/2, y+bh/2, midx+maxw/2+10, y+bh/2)

def art_socialrow(c, w, h):
    items=[("sem rosto","person"),("base legal","gavel"),("uma mensagem só","shield"),("seu ok em tudo","check")]
    cw=w/4
    for i,(lbl,ic) in enumerate(items):
        cx=cw*i+cw/2; cy=h*0.62
        c.setFillColor(CARD2); c.circle(cx, cy, 20, stroke=0, fill=1)
        if ic=="person": ic_person(c, cx, cy-4, 13, col=ESP, lw=2)
        elif ic=="gavel": ic_gavel(c, cx, cy, 12, col=ESP, lw=2)
        elif ic=="shield": ic_shield(c, cx, cy+6, 12, col=ESP, lw=2)
        else: ic_check(c, cx, cy, 12, col=SAGE, lw=3)
        _t(c, cx, h*0.14, lbl, SANB, 8.5, ESP, "c")

# ---------------------------------------------------------------- blocks
def front_block(kick, title, intro, treatments, hook, icon, acc=GOLD):
    def draw_icon(c, w, h):
        c.setFillColor(ESP); c.roundRect(0,0,w,h,8,stroke=0,fill=1)
        cx,cy=w/2,h/2
        if icon=="child": ic_child(c, cx, cy-3, 20, col=WHITE, lw=2.4)
        else: ic_person(c, cx, cy-3, 24, col=WHITE, lw=2.4)
        ic_plus(c, cx+15, cy+14, 8, col=acc)
    left=art(draw_icon, 74, w=64)
    tt=Table([[Paragraph("<b>O que costuma ser negado:</b> "+treatments, ST["cardb"])]],
             colWidths=[FW-64-10])
    tt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),CARD2),
        ("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    right=[Paragraph(sp(kick), ST["cardk"]), Spacer(1,2), Paragraph(title, ST["cardh"]),
           Spacer(1,3), Paragraph(intro, ST["cardb"]), Spacer(1,5), tt, Spacer(1,5),
           Paragraph("<i>"+hook+"</i>", ST["small"])]
    t=Table([[left, right]], colWidths=[64, FW-64])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,0),"TOP"),
        ("LEFTPADDING",(0,0),(0,0),0),("RIGHTPADDING",(0,0),(0,0),10),
        ("LEFTPADDING",(1,0),(1,0),0),("RIGHTPADDING",(1,0),(1,0),0),
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
    return t

def say_dont(pairs):
    head=[Paragraph("DIGA ASSIM", ST["th"]), Paragraph("EVITE", ST["th"])]
    rows=[head]
    for good,bad in pairs:
        rows.append([Paragraph("“"+good+"”", ST["good"]), Paragraph("“"+bad+"”", ST["bad"])])
    t=Table(rows, colWidths=[FW*0.5, FW*0.5])
    style=[("VALIGN",(0,0),(-1,-1),"TOP"),
           ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
           ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
           ("BACKGROUND",(0,1),(0,-1),HexColor("#F0F1E9")),
           ("BACKGROUND",(1,1),(1,-1),HexColor("#F6ECE5")),
           ("LINEBEFORE",(0,1),(0,-1),2.5,SAGE),
           ("LINEBEFORE",(1,1),(1,-1),2.5,CLAY),
           ("LINEBELOW",(0,0),(-1,0),0.6,LINE),
           ("LINEBELOW",(0,1),(-1,-2),4,PAPER),
           ("TOPPADDING",(0,0),(-1,0),0),("BOTTOMPADDING",(0,0),(-1,0),4)]
    t.setStyle(TableStyle(style)); return t

def rule_table(header, rows, widths, accents=None):
    data=[[Paragraph(sp(h2), ST["th"]) for h2 in header]]
    for r in rows: data.append([Paragraph(cc, ST["td"]) for cc in r])
    t=Table(data, colWidths=widths, repeatRows=1)
    s=[("LINEBELOW",(0,0),(-1,0),1,GOLD),("LINEBELOW",(0,1),(-1,-1),0.5,LINE),
       ("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),
       ("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),6),
       ("BOTTOMPADDING",(0,0),(-1,-1),6)]
    t.setStyle(TableStyle(s)); return t

def checklist(title, items, accent=GOLD, mark="check"):
    rows=[[Paragraph("<b>"+title+"</b>", ST["cardk"])]]
    body=[]
    for it in items:
        body.append(it)
    # build as a drawn flowable for crisp marks
    def draw(c, w, h):
        _card(c, 0, 0, w, h, fill=CARD2, stroke=None, accent=accent, r=7)
        _t(c, 14, h-18, sp(title), SANB, 8, accent if accent!=GOLD else GOLD)
        yy=h-38
        for it in items:
            if mark=="check": ic_check(c, 20, yy+3, 6, col=SAGE, lw=2.4)
            else: ic_x(c, 20, yy+2, 6, col=CLAY, lw=2.4)
            c.setFillColor(INK); c.setFont(SANS, 9)
            # wrap manually
            from reportlab.pdfbase.pdfmetrics import stringWidth
            words=it.split(); line=""; xx=34; maxw=w-44; first=True
            for wd in words:
                test=(line+" "+wd).strip()
                if stringWidth(test, SANS, 9) > maxw:
                    c.drawString(xx, yy, line); yy-=12; line=wd
                else: line=test
            c.drawString(xx, yy, line); yy-=17
    # estimate height
    h = 44 + len(items)*29
    return art(draw, h)

def pull_dark(txt):
    inner=Table([[Paragraph(txt, ST["pullw"])]], colWidths=[FW])
    inner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),ESP),
        ("LEFTPADDING",(0,0),(-1,-1),18),("RIGHTPADDING",(0,0),(-1,-1),18),
        ("TOPPADDING",(0,0),(-1,-1),14),("BOTTOMPADDING",(0,0),(-1,-1),14),
        ("LINEBEFORE",(0,0),(0,-1),3,GOLD)]))
    return inner

def note(title, body, accent=GOLD, bg=CARD2):
    inner=Table([[Paragraph("<b>"+title+"</b>  "+body, ST["small"])]], colWidths=[FW])
    inner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),
        ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
        ("LINEBEFORE",(0,0),(0,-1),2.5,accent)]))
    return inner

# ================================================================ page furniture
def bg_paper(c, doc):
    c.setFillColor(PAPER); c.rect(0,0,W,Hh,stroke=0,fill=1)
    try: c.drawImage(A("vgj_mono_faint.png"), W-62*mm, -8*mm, width=70*mm, height=73*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass
    try: c.drawImage(A("vgj_navy.png"), L, Hh-15*mm, width=34*mm, height=9.8*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass
    c.setStrokeColor(GOLD); c.setLineWidth(0.8); c.line(L, Hh-17*mm, W-Rm, Hh-17*mm)
    _t(c, W-Rm, Hh-14.5*mm, "GUIA DE COLABORAÇÃO", SANB, 7, GOLD, "r")
    c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(L, 13*mm, W-Rm, 13*mm)
    _t(c, L, 9*mm, "Vilmar Guimarães Júnior · Advocacia em Saúde", SANS, 7.2, GRAY, "l")
    _t(c, W-Rm, 9*mm, "%02d" % doc.page, SANB, 8, ESP, "r")

def bg_dark(c, doc):
    c.setFillColor(ESP); c.rect(0,0,W,Hh,stroke=0,fill=1)
    c.setFillColor(ESP2); c.rect(0,0,W,6*mm,stroke=0,fill=1)
    c.setFillColor(GOLD); c.rect(0,Hh-5*mm,W,5*mm,stroke=0,fill=1)
    try: c.drawImage(A("vgj_mono_faintw.png"), W-70*mm, 12*mm, width=78*mm, height=82*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass

def bg_cover(c, doc):
    bg_dark(c, doc)
    try: c.drawImage(A("vgj_white.png"), L, Hh-44*mm, width=52*mm, height=15*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass

doc=BaseDocTemplate(OUT, pagesize=A4, leftMargin=L, rightMargin=Rm,
                    topMargin=24*mm, bottomMargin=BOT,
                    title="VGJ · Guia de Colaboração com a Agência",
                    author="Vilmar Guimarães Júnior Advocacia")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(L,30*mm,FW,Hh-78*mm,id="cov")], onPage=bg_cover),
    PageTemplate(id="content", frames=[Frame(L,BOT,FW,Hh-24*mm-BOT,id="c")], onPage=bg_paper),
    PageTemplate(id="dark", frames=[Frame(L,16*mm,FW,Hh-32*mm,id="d")], onPage=bg_dark),
])

def sec(kick, title, s="disp"):
    return [Paragraph(sp(kick), ST["kick"]), Spacer(1,2), Paragraph(title, ST[s]), Spacer(1,4)]

E=[]

# ---------------------------------------------------------------- CAPA
E += [
    Spacer(1,6*mm),
    Paragraph(sp("VILMAR GUIMARÃES JÚNIOR · ADVOCACIA EM SAÚDE"), ST["cov_k"]),
    Spacer(1,16*mm),
    Paragraph("Guia de<br/>Colaboração", ST["cov_t"]),
    Spacer(1,10*mm),
    Paragraph("Posicionamento, público e conteúdo em saúde — o que produzir, como falar "
              "e o que nunca fazer. Um mapa pra gente trabalhar junto sem retrabalho e "
              "sem risco ético.", ST["cov_s"]),
    Spacer(1,20*mm),
    Paragraph("MATERIAL PARA A AGÊNCIA &nbsp;·&nbsp; JULHO DE 2026 &nbsp;·&nbsp; "
              "COMPLEMENTA O DOSSIÊ JÁ ENTREGUE", ST["cov_m"]),
    NextPageTemplate("content"), PageBreak(),
]

# ---------------------------------------------------------------- P2 O QUE MUDA
E += sec("COMO USAR ESTE GUIA", "O plano continua.<br/>A mira é que muda.")
E += [
    Paragraph("O material de vocês está aprovado na estratégia — competir em "
              "<b>velocidade</b>, e não em quem sabe mais direito, é o caminho certo. "
              "Este guia não substitui o de vocês: ele afina a pontaria em três frentes "
              "que ampliam o mercado e blindam o escritório na ética da OAB. Em cada "
              "página tem o que produzir e o que evitar.", ST["bodyj"]),
    Spacer(1,3*mm),
    art(art_shifts, 150),
    Spacer(1,4*mm),
    note("Regra que vale pra tudo:",
         "nada vai ao ar sem o ok do Dr. Vilmar. Na OAB, quem responde pela publicidade "
         "é o advogado — então a validação protege vocês também. Ele valida rápido, pelo "
         "WhatsApp; não trava o cronograma."),
    PageBreak(),
]

# ---------------------------------------------------------------- P3 PÚBLICO
E += sec("PÚBLICO — PRA QUEM FALAR", "Fale com quem cuida,<br/>não com quem está doente")
E += [
    Paragraph("A virada mais importante do público: na saúde, quem procura o advogado, "
              "decide e paga quase nunca é o paciente — é a <b>família</b>. É a mãe da "
              "criança, a filha do idoso, o cônjuge. Todo criativo deve falar com esse "
              "cuidador, no “você” dele.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_persona, 118),
    Spacer(1,3*mm),
    Paragraph("Por que isso importa pra vocês na hora de produzir: o cuidador com medo "
              "de perder alguém <b>não pesquisa preço — pesquisa quem resolve rápido</b>. "
              "A imagem e o texto devem mirar alívio e agilidade, não desconto.", ST["bodyj"]),
    Spacer(1,2*mm),
    pull_dark("“Quanto custa?” é a segunda pergunta de quem tem medo. A primeira é "
              "“você consegue resolver?”. O criativo responde a primeira."),
    PageBreak(),
]

# ---------------------------------------------------------------- P4 DUAS FRENTES
E += sec("ONDE A BRIGA ACONTECE", "Duas frentes, não uma")
E += [
    Paragraph("O dossiê mirava só a operadora de plano. Só que cerca de <b>7 em cada 10 "
              "brasileiros não têm plano</b> e dependem do SUS — que nega igual "
              "(medicamento de alto custo, cirurgia, UTI, terapia “fora da tabela”). "
              "A campanha deve ter criativo pras duas frentes.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_twofronts, 150),
    Spacer(1,4*mm),
    Paragraph("<b>Na prática, pra vocês:</b> a mensagem e o funil são os mesmos; muda o "
              "criativo de topo. Um conjunto fala “seu plano negou?”, outro fala “o SUS "
              "está te deixando na fila?”. A base legal citada muda (art. 196 da "
              "Constituição no SUS; Lei 9.656/98 e CDC no plano), mas a promessa de "
              "agilidade é idêntica.", ST["bodyj"]),
    PageBreak(),
]

# ---------------------------------------------------------------- P5 NICHOS
E += sec("OS DOIS PÚBLICOS QUE MAIS CONVERTEM", "A criança e a melhor idade")
E += [
    Paragraph("Dentro da lógica de família, dois nichos são os mais recorrentes e "
              "emocionais — e é onde vale concentrar criativo.", ST["bodyj"]),
    Spacer(1,3*mm),
    front_block("NICHO 01 · A CRIANÇA", "A criança que precisa de terapia",
        "Autismo (TEA) é hoje uma das maiores demandas de saúde do país. Plano e SUS "
        "cortam a carga horária de terapia que o médico pediu, e cada mês perdido é "
        "desenvolvimento que não volta. A mãe vira a melhor propaganda no grupo de mães.",
        "terapia ABA, fonoaudiologia, terapia ocupacional, psicopedagogia, acompanhante "
        "terapêutico na escola, canabidiol e as horas de terapia negadas.",
        "Recorrente, emocional e com boca a boca fortíssimo entre mães.", "child", acc=CLAY),
    Spacer(1,5*mm),
    front_block("NICHO 02 · A MELHOR IDADE", "O idoso que o sistema deixa esperando",
        "Do outro lado da vida, a mesma cena. A família não aceita ver o pai na fila "
        "enquanto a saúde piora. A urgência é literal, e o Estatuto do Idoso ainda dá "
        "prioridade na tramitação.",
        "home care e internação domiciliar, medicamento oncológico e de alto custo, "
        "cirurgia negada “por idade”, fisioterapia, fraldas e insumos, cuidador.",
        "Decisão movida por amor de filho, com prioridade legal de quem tem idade.", "elder"),
    PageBreak(),
]

# ---------------------------------------------------------------- P6 MENSAGEM / TOM
E += sec("MENSAGEM & TOM DE VOZ", "Como falar — e como não falar")
E += [
    Paragraph("Este é o ponto mais sensível: uma palavra errada vira promessa de "
              "resultado e expõe o escritório na OAB. A regra é simples — <b>vende-se "
              "presença, agilidade e método; nunca desfecho.</b> Use a tabela como "
              "referência ao escrever qualquer legenda ou anúncio.", ST["bodyj"]),
    Spacer(1,2*mm),
    say_dont([
        ("Te ajudo a buscar, com agilidade, a resposta jurídica adequada ao seu caso.",
         "Reverto a negativa do seu plano em dias."),
        ("Quando o caso preenche os requisitos, dá pra pedir uma liminar com urgência.",
         "Garanto a liminar / ganho garantido."),
        ("Muitas negativas podem ser ilegais. Vale entender o seu caso.",
         "Sua negativa é ilegal, você vai ganhar."),
        ("Analiso seu caso e, se cabível, entro com o pedido de urgência.",
         "Meus clientes já têm data marcada pro procedimento."),
    ]),
    Spacer(1,3*mm),
    Paragraph("<b>Tom de voz:</b> sério, acolhedor e direto. Fala de gente pra gente, "
              "sem juridiquês, mas sem gíria de vendedor. Frases curtas. A urgência "
              "aparece no tempo (“não espere sem prazo”), não no exagero.", ST["body"]),
    PageBreak(),
]

# ---------------------------------------------------------------- P7 REFRAME FINANCEIRO
E += sec("O ÂNGULO QUE VENDE", "O advogado como plano de saúde")
E += [
    Paragraph("Esse é o gancho mais forte pros criativos, principalmente no público do "
              "SUS. Quem depende do SUS <b>já não paga plano nenhum</b> — o dinheiro da "
              "mensalidade que nega está livre. O honorário se reposiciona como o melhor "
              "investimento em saúde da família: mais barato que um ano de plano, e esse "
              "aqui entrega.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_scale, 168),
    Spacer(1,3*mm),
    note("Ética (importante):",
         "isso é reposicionamento de valor percebido — não promessa de ganho. Nada de "
         "“recupero seu dinheiro”. O ângulo é sobre presença e agilidade; o desfecho é "
         "sempre da Justiça.", accent=CLAY, bg=HexColor("#F6ECE5")),
    PageBreak(),
]

# ---------------------------------------------------------------- P8 LINHA DE CONTEÚDO
E += sec("LINHA DE CONTEÚDO", "O que postar — e por quê")
E += [
    Paragraph("Base de 9 posts pra Fase 1. Os 3 primeiros ficam fixados e carregam a "
              "mensagem; os demais sustentam sob ângulos diferentes e alimentam o "
              "tráfego. Roteiros card-a-card completos vão no arquivo editável (.docx).",
              ST["body"]),
    Spacer(1,2*mm),
    rule_table(["Nº","POST","FRENTE / PÚBLICO"],
        [["F1","O que é o método (Protocolo) — fixado","Todos"],
         ["F2","A vida depois da liminar (sem prometer) — fixado","Todos"],
         ["F3","“Enquanto você espera a ANS/fila resolver…” — fixado","Todos"],
         ["04","Caso ilustrativo anonimizado: as etapas do método","Prova / credibilidade"],
         ["05","“3 sinais de que a negativa pode ser ilegal”","Educação rápida"],
         ["06","Terapia de criança com TEA negada: o que fazer","Nicho criança"],
         ["07","Idoso na fila do SUS: home care e alto custo","Nicho melhor idade"],
         ["08","SUS também se resolve na Justiça (art. 196)","Frente SUS"],
         ["09","“O que a lei diz” — CPC 300, 9.656/98, 14.454/22","Autoridade recorrente"]],
        [10*mm, FW-10*mm-42*mm, 42*mm]),
    Spacer(1,3*mm),
    note("Sobre prova social:",
         "nada de depoimento de cliente ou print de decisão como propaganda — a "
         "publicidade da OAB veda. Autoridade se constrói citando a lei, não expondo "
         "caso. Casos viram sempre “ilustrativos e anonimizados”."),
    PageBreak(),
]

# ---------------------------------------------------------------- P9 FUNIL
E += sec("O FUNIL", "Do anúncio ao tratamento")
E += [
    Paragraph("O material de vocês parava o lead no “chegou no WhatsApp”. Como o "
              "posicionamento é velocidade, o atendimento é a prova — e por isso o funil "
              "vai até a resposta rápida. O formulário e o script completos estão no "
              ".docx; aqui é a visão geral.", ST["body"]),
    Spacer(1,2*mm),
    art(art_funnel, 210),
    Spacer(1,3*mm),
    note("Dado sensível = LGPD:",
         "o formulário pergunta sobre saúde (dado sensível, art. 11 da LGPD). Ele precisa "
         "de aviso curto de consentimento, e as respostas ficam em ambiente restrito — "
         "não em planilha aberta. O texto do aviso está no arquivo editável."),
    PageBreak(),
]

# ---------------------------------------------------------------- P10 GUARDRAILS
E += sec("A RÉGUA", "Checklist antes de publicar")
E += [
    Paragraph("Cole isto na parede. Toda peça — post, reel, anúncio, story — passa por "
              "estas duas listas antes de ir pro ar. Na dúvida em qualquer item, "
              "não publica: manda pro Dr. Vilmar validar.", ST["body"]),
    Spacer(1,2*mm),
    checklist("PODE — TODA PEÇA PRECISA TER", [
        "Caráter informativo ou educativo predominante",
        "Identificação: nome do advogado + número da OAB",
        "Linguagem sóbria, sem gíria de vendedor",
        "Base legal citada quando fizer afirmação jurídica",
    ], accent=SAGE, mark="check"),
    Spacer(1,3*mm),
    checklist("NÃO PODE — REPROVA NA HORA", [
        "Promessa de resultado (“reverto”, “garanto”, “em X dias”)",
        "Valores de honorário ou de causa",
        "Depoimento de cliente ou print de decisão como propaganda",
        "“Consulta grátis” como isca de captação",
        "Comparação com outros advogados (“melhor”, “mais rápido que”)",
    ], accent=CLAY, mark="x"),
    PageBreak(),
]

# ---------------------------------------------------------------- P11 FORMATOS
E += sec("FORMATOS DE CRIATIVO", "A regra de ouro — e o perfil do cliente")
E += [
    Paragraph("O Dr. Vilmar é reservado e não aparece nas redes — e nesse nicho isso é "
              "vantagem. Quem está com um filho doente quer ver seriedade, não trend. "
              "Então o rosto dele entra uma vez só, sério, na foto de perfil; o resto "
              "da comunicação roda <b>sem rosto</b>.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_socialrow, 92),
    Spacer(1,3*mm),
    rule_table(["FORMATO","COMO PRODUZIR"],
        [["Reels de texto (principal)","Fundo neutro, frase de impacto na tela, sem rosto. Rápido de escalar."],
         ["Estáticos / carrossel","Quebra de padrão + método + base legal. Mesma linha visual dos fixados."],
         ["Posts do perfil como anúncio","Promover os próprios fixados mantém congruência com o feed."]],
        [46*mm, FW-46*mm]),
    Spacer(1,3*mm),
    note("Regra de ouro:",
         "nenhum criativo foge do Protocolo Emergencial de Saúde. Toda peça, em qualquer "
         "formato, repete a mesma mensagem central — é a repetição que barateia o custo "
         "por lead com o tempo."),
]

# ---------------------------------------------------------------- P12 FECHAMENTO (dark)
E += [NextPageTemplate("dark"), PageBreak()]
E += [
    Spacer(1,6*mm),
    Paragraph(sp("PRA COMEÇAR JUNTOS"), ST["kickw"]), Spacer(1,3),
    Paragraph("O que vem no pacote", ST["dk_h"]),
    Spacer(1,6*mm),
    Paragraph("Este guia anda junto com um segundo arquivo, <b>editável (.docx)</b>, "
              "pra vocês copiarem direto: roteiros card-a-card dos posts, textos de "
              "anúncio por público, o formulário de qualificação com o aviso de LGPD e "
              "o script de primeira resposta no WhatsApp.", ST["dk_b"]),
    Spacer(1,4*mm),
    Paragraph("Do lado do escritório, o combinado é simples:", ST["dk_b"]),
    Paragraph("<b>1.</b>&nbsp;&nbsp;Validação rápida de cada peça pelo WhatsApp, antes de publicar.", ST["dk_b"]),
    Paragraph("<b>2.</b>&nbsp;&nbsp;Número da OAB e casos ilustrativos anonimizados pra alimentar os criativos.", ST["dk_b"]),
    Paragraph("<b>3.</b>&nbsp;&nbsp;Leitura de números na 1ª semana: custo por conversa, qualificação e comparecimento.", ST["dk_b"]),
    Spacer(1,7*mm),
    Paragraph("A ideia é uma só: mesma mensagem, repetida com disciplina, nas duas "
              "frentes e nos dois nichos — até os números dizerem onde investir mais.",
              ST["pullw"]),
    Spacer(1,9*mm),
    Paragraph(sp("CONTATO"), ST["dk_s"]), Spacer(1,2),
    Paragraph("Avenida Olívia Flores, nº 28 — Candeias · Vitória da Conquista/BA · CEP 45.028-100<br/>"
              "Fone/Fax (77) 3421-2454 &nbsp;·&nbsp; WhatsApp (77) 99126-6355 &nbsp;·&nbsp; "
              "vilmarjunior.advogado@gmail.com", ST["dk_b"]),
]

doc.build(E)
print("OK:", OUT)
