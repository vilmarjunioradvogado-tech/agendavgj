# -*- coding: utf-8 -*-
"""
VGJ · Advocacia em Saúde — O PLANO
Método próprio, em três pilares, pensado pro escritório do Vilmar —
não uma fórmula genérica revendida pra qualquer advogado.
Paleta quente (creme / café / dourado / terracota). Marca VGJ preservada.
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
from reportlab.pdfbase.pdfmetrics import stringWidth

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), "proposta_vgj", "assets")
A = lambda n: os.path.join(ASSETS, n)
OUT = os.path.join(HERE, "VGJ_O_Plano.pdf")

# ---------------------------------------------------------------- paleta quente
ESP    = HexColor("#2B2620")
ESP2   = HexColor("#3B342B")
INK    = HexColor("#38332B")
GRAY   = HexColor("#847B6C")
GOLD   = HexColor("#B0894F")
GOLD_L = HexColor("#CBAA6E")
CLAY   = HexColor("#B4653F")
CLAY_L = HexColor("#C98A64")
SAGE   = HexColor("#7E8666")
PAPER  = HexColor("#FAF6EF")
CARD   = HexColor("#FFFDF8")
CARD2  = HexColor("#F3ECDD")
LINE   = HexColor("#E7DECC")
LINE2  = HexColor("#DCCFB6")
WHITE  = HexColor("#FFFFFF")
CREAMW = HexColor("#ECE3D2")

W, Hh = A4
L, Rm, TOP, BOT = 20 * mm, 20 * mm, 20 * mm, 18 * mm
FW = W - L - Rm

SER, SERB, SERI = "Times-Roman", "Times-Bold", "Times-Italic"
SANS, SANB, SANI = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"

def sp(txt):
    nb = " "
    return (nb * 3).join(nb.join(w) for w in txt.split())

def stl(name, **kw):
    base = dict(fontName=SANS, fontSize=10, leading=15, textColor=INK, alignment=TA_LEFT)
    base.update(kw); return ParagraphStyle(name, **base)

ST = {
    "kick":  stl("kick", fontName=SANB, fontSize=8, leading=12, textColor=GOLD),
    "kickw": stl("kickw", fontName=SANB, fontSize=8, leading=12, textColor=GOLD_L),
    "disp":  stl("disp", fontName=SERB, fontSize=27, leading=30, textColor=ESP, spaceAfter=9),
    "disp2": stl("disp2", fontName=SERB, fontSize=21, leading=24, textColor=ESP),
    "body":  stl("body", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9),
    "bodyj": stl("bodyj", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9, alignment=TA_JUSTIFY),
    "lead":  stl("lead", fontName=SERI, fontSize=13, leading=19, textColor=ESP, spaceAfter=10),
    "small": stl("small", fontSize=8.6, leading=12.5, textColor=GRAY),
    "cap":   stl("cap", fontSize=8, leading=11, textColor=GRAY, alignment=TA_CENTER),
    "cardk": stl("cardk", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "cardh": stl("cardh", fontName=SERB, fontSize=13.5, leading=17, textColor=ESP),
    "cardb": stl("cardb", fontSize=9.4, leading=14, textColor=INK),
    "th":    stl("th", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "td":    stl("td", fontSize=8.8, leading=13, textColor=INK),
    "cov_k": stl("cov_k", fontName=SANB, fontSize=9, leading=13, textColor=GOLD_L),
    "cov_t": stl("cov_t", fontName=SERB, fontSize=38, leading=42, textColor=WHITE),
    "cov_s": stl("cov_s", fontName=SERI, fontSize=13.5, leading=20, textColor=CREAMW),
    "cov_m": stl("cov_m", fontSize=9, leading=15, textColor=HexColor("#B4A892")),
    "dk_h":  stl("dk_h", fontName=SERB, fontSize=24, leading=28, textColor=WHITE),
    "dk_b":  stl("dk_b", fontSize=10.2, leading=16, textColor=CREAMW, spaceAfter=7),
    "dk_s":  stl("dk_s", fontName=SANB, fontSize=8, leading=13, textColor=GOLD_L),
    "pullw": stl("pullw", fontName=SERI, fontSize=16, leading=23, textColor=WHITE),
    "sig":   stl("sig", fontName=SERI, fontSize=17, leading=20, textColor=ESP),
    "good":  stl("good", fontSize=9.2, leading=14, textColor=INK),
    "bad":   stl("bad", fontSize=9.2, leading=14, textColor=INK),
    "pilarnum": stl("pilarnum", fontName=SERB, fontSize=30, leading=32, textColor=GOLD_L),
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

# ---------------------------------------------------------------- pictograms
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
def ic_spark(c, cx, cy, s, col=WHITE):
    c.setFillColor(col)
    p=c.beginPath()
    p.moveTo(cx, cy+s); p.lineTo(cx+s*0.22, cy+s*0.22); p.lineTo(cx+s, cy)
    p.lineTo(cx+s*0.22, cy-s*0.22); p.lineTo(cx, cy-s)
    p.lineTo(cx-s*0.22, cy-s*0.22); p.lineTo(cx-s, cy)
    p.lineTo(cx-s*0.22, cy+s*0.22); p.close()
    c.drawPath(p, stroke=0, fill=1)
def ic_target(c, cx, cy, s, col=WHITE, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy, s, stroke=1, fill=0)
    c.circle(cx, cy, s*0.6, stroke=1, fill=0)
    c.setFillColor(col); c.circle(cx, cy, s*0.18, stroke=0, fill=1)
def ic_chat(c, cx, cy, s, col=WHITE, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.roundRect(cx-s, cy-s*0.65, s*2, s*1.3, 5, stroke=1, fill=0)
    p=c.beginPath(); p.moveTo(cx-s*0.35, cy-s*0.65); p.lineTo(cx-s*0.55, cy-s*1.15)
    p.lineTo(cx+s*0.05, cy-s*0.65); p.close()
    c.setFillColor(col); c.drawPath(p, stroke=0, fill=1)
    c.setLineWidth(1.6)
    c.line(cx-s*0.55, cy+s*0.15, cx+s*0.55, cy+s*0.15)
    c.line(cx-s*0.55, cy-s*0.15, cx+s*0.2, cy-s*0.15)

# ---------------------------------------------------------------- ILLUSTRATIONS
def art_pilares(c, w, h):
    items = [("01", "CRIATIVO", "ic_spark", "que atrai sem prometer"),
             ("02", "ANÚNCIO", "ic_target", "que mira quem já sofre"),
             ("03", "ATENDIMENTO", "ic_chat", "que filtra sem desgastar")]
    cw = w/3
    for i,(n,title,ic,sub) in enumerate(items):
        x = cw*i
        _card(c, x+6, 6, cw-12, h-12, fill=ESP, stroke=None, r=10)
        _t(c, x+cw/2, h-30, n, SERB, 22, GOLD_L, "c")
        cy = h*0.52
        if ic=="ic_spark": ic_spark(c, x+cw/2, cy, 15, col=GOLD_L)
        elif ic=="ic_target": ic_target(c, x+cw/2, cy, 15, col=GOLD_L, lw=2)
        else: ic_chat(c, x+cw/2, cy, 15, col=GOLD_L, lw=2)
        _t(c, x+cw/2, h*0.24, title, SANB, 10, WHITE, "c")
        _t(c, x+cw/2, h*0.15, sub, SANS, 7.6, HexColor("#C9BFA8"), "c")

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
    _t(c, midx, h*0.06, "a fórmula genérica não sabe que essa frente existe", SERI, 9.5, GRAY, "c")

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
    steps=[("CRIATIVO","post ou reel de texto, sem rosto",GOLD),
           ("ANÚNCIO","R$ 500, campanha de mensagem",GOLD),
           ("FORMULÁRIO","qualifica + aviso LGPD",CLAY),
           ("WHATSAPP","atendimento filtra, você fecha",CLAY),
           ("CLIENTE","honorário, dentro do prazo legal",SAGE)]
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
        _t(c, midx+maxw/2+14, y+bh/2+1, s, SANS, 8, GRAY, "l")
        c.setStrokeColor(LINE2); c.setLineWidth(0.7)
        c.line(midx+wt/2, y+bh/2, midx+maxw/2+10, y+bh/2)

def art_timeline(c, w, h):
    phases = [
        ("SEMANA 1","Fundação",
         ["Bio, foto e OAB visível","3 posts fixados","Frente: plano privado",
          "Copy revisada e ética"]),
        ("SEMANA 2–4","No ar",
         ["Campanha R$ 500 no ar","Formulário + WhatsApp prontos","Resposta em até 1h útil",
          "Leitura de custo por lead"]),
        ("MÊS 2–3","Amplia",
         ["Abre a frente SUS","Nichos criança e melhor idade","Dobra no que converteu",
          "Decide com número, não achismo"]),
    ]
    n = len(phases); seg = w / n; liney = h - 30
    c.setStrokeColor(LINE2); c.setLineWidth(2)
    c.line(seg * 0.5, liney, seg * (n - 0.5), liney)
    for i, (tag, title, items) in enumerate(phases):
        cx = seg * i + seg * 0.5
        c.setFillColor(GOLD); c.circle(cx, liney, 6, stroke=0, fill=1)
        c.setFillColor(PAPER); c.circle(cx, liney, 2.4, stroke=0, fill=1)
        _t(c, cx, liney + 12, tag, SANB, 8, GOLD, "c")
        _card(c, seg * i + 8, 6, seg - 16, liney - 22, fill=CARD, stroke=LINE, r=6)
        _t(c, cx, liney - 30, title, SERB if False else SANB, 11, ESP, "c")
        yy = liney - 48
        for it in items:
            c.setFillColor(GOLD); c.circle(seg * i + 20, yy + 3, 1.8, stroke=0, fill=1)
            _t(c, seg * i + 26, yy, it, SANS, 8, INK, "l"); yy -= 15

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

def rule_table(header, rows, widths):
    data=[[Paragraph(sp(h2), ST["th"]) for h2 in header]]
    for r in rows: data.append([Paragraph(cc, ST["td"]) for cc in r])
    t=Table(data, colWidths=widths, repeatRows=1)
    s=[("LINEBELOW",(0,0),(-1,0),1,GOLD),("LINEBELOW",(0,1),(-1,-1),0.5,LINE),
       ("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),
       ("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),6),
       ("BOTTOMPADDING",(0,0),(-1,-1),6)]
    t.setStyle(TableStyle(s)); return t

def checklist(title, items, accent=GOLD, mark="check"):
    def draw(c, w, h):
        _card(c, 0, 0, w, h, fill=CARD2, stroke=None, accent=accent, r=7)
        _t(c, 14, h-18, sp(title), SANB, 8, accent if accent!=GOLD else GOLD)
        yy=h-38
        for it in items:
            if mark=="check": ic_check(c, 20, yy+3, 6, col=SAGE, lw=2.4)
            else: ic_x(c, 20, yy+2, 6, col=CLAY, lw=2.4)
            c.setFillColor(INK); c.setFont(SANS, 9)
            words=it.split(); line=""; xx=34; maxw=w-44
            for wd in words:
                test=(line+" "+wd).strip()
                if stringWidth(test, SANS, 9) > maxw:
                    c.drawString(xx, yy, line); yy-=12; line=wd
                else: line=test
            c.drawString(xx, yy, line); yy-=17
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

def stat_row(items):
    cw=(FW-(len(items)-1)*5*mm)/len(items); cells=[]
    for big,lbl in items:
        inner=Table([[Paragraph(big, ST["disp2"])],[Paragraph(lbl, ST["small"])]], colWidths=[cw])
        inner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),CARD),
            ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),
            ("TOPPADDING",(0,0),(-1,0),11),("BOTTOMPADDING",(0,0),(-1,0),1),
            ("TOPPADDING",(0,1),(-1,1),0),("BOTTOMPADDING",(0,1),(-1,1),12),
            ("LINEBEFORE",(0,0),(0,-1),2.5,GOLD)]))
        cells.append(inner)
    t=Table([cells], colWidths=[cw+5*mm if i<len(cells)-1 else cw for i in range(len(cells))])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-2,-1),5*mm),
        ("RIGHTPADDING",(-1,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),0),
        ("BOTTOMPADDING",(0,0),(-1,-1),0)]))
    return t

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
    _t(c, W-Rm, Hh-14.5*mm, "O PLANO", SANB, 7, GOLD, "r")
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
                    title="VGJ · O Plano", author="Vilmar Guimarães Júnior Advocacia")
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
    Paragraph("O Plano", ST["cov_t"]),
    Spacer(1,10*mm),
    Paragraph("Três pilares pra gerar honorário pelo digital — só que pensados pro seu "
              "direito da saúde, não vendidos de forma genérica pra qualquer advogado do "
              "Brasil. Sem curso. Sem fórmula pronta. Sem risco com a OAB.", ST["cov_s"]),
    Spacer(1,20*mm),
    Paragraph("ESCRITO PARA VILMAR &nbsp;·&nbsp; JULHO DE 2026 &nbsp;·&nbsp; "
              "DOCUMENTO INTERNO E CONFIDENCIAL", ST["cov_m"]),
    NextPageTemplate("content"), PageBreak(),
]

# ---------------------------------------------------------------- CARTA
E += [
    Spacer(1,4*mm),
    Paragraph(sp("ANTES DE TUDO"), ST["kick"]), Spacer(1,2),
    Paragraph("Vilmar,", ST["disp"]),
    Paragraph("Vi a página que te mandaram. É uma boa página de vendas — vídeo que "
              "precisa ser assistido até o fim pra “liberar acesso”, depoimento com "
              "número redondo, três passos, garantia de 7 dias. O problema não é o "
              "método que ele descreve. É que criativo, anúncio e atendimento são a "
              "base de qualquer estratégia digital — não é segredo de ninguém, e "
              "certamente não vale um curso vendido igual pra advogado previdenciário, "
              "de direito canábico e de imobiliária.", ST["bodyj"]),
    Paragraph("Então resolvi fazer o que a gente já vinha fazendo, só que organizado do "
              "jeito que ele organizou a oferta dele: três pilares, claros, com plano "
              "de execução. A diferença é que o nosso não é genérico — é pensado pro "
              "seu escritório, pro seu jeito reservado de atuar, e pra ética da OAB que "
              "uma fórmula de curso nunca vai levar em conta.", ST["bodyj"]),
    Paragraph("Não precisa comprar nada. Já está tudo aqui.", ST["bodyj"]),
    Spacer(1,4*mm),
    Paragraph("A gente resolve isso juntos.", ST["sig"]),
    PageBreak(),
]

# ---------------------------------------------------------------- OS TRÊS PILARES
E += sec("O MÉTODO VGJ", "Três pilares.<br/>Pensados pra você, não pra qualquer um.")
E += [
    Paragraph("Todo método digital sério se resume a isso: um criativo que para o "
              "polegar, um anúncio que entrega esse criativo pra quem precisa, e um "
              "atendimento que separa quem está pronto de quem só quer saber. A "
              "diferença nunca está nos três nomes — está em como cada um é construído "
              "pro seu caso.", ST["bodyj"]),
    Spacer(1,3*mm),
    art(art_pilares, 130),
    Spacer(1,4*mm),
    Paragraph("Nas próximas três páginas, cada pilar — do jeito que funciona pro "
              "direito da saúde, com a discrição que é o seu estilo e dentro da régua "
              "que protege o seu registro.", ST["body"]),
    PageBreak(),
]

# ---------------------------------------------------------------- PILAR 1
E += [
    Paragraph(sp("PILAR 01"), ST["kick"]), Spacer(1,2),
    Paragraph("Criativo", ST["disp"]),
    Paragraph("Não precisa de vídeo profissional, nem de você aparecendo. Precisa de "
              "uma frase que reconhece a dor de quem já teve um tratamento negado, e de "
              "uma promessa de <b>processo</b> — nunca de resultado.", ST["lead"]),
    Paragraph("Reels de texto sem rosto, fundo neutro, uma frase de impacto na tela. É "
              "o formato mais rápido de produzir, mais barato de escalar, e o que mais "
              "combina com um advogado que não curte se expor. A autoridade vem da "
              "clareza do método e da base legal citada — não da sua cara na tela.",
              ST["body"]),
    Spacer(1,2*mm),
    say_dont([
        ("Muitas negativas podem ser ilegais. Vale entender o seu caso.",
         "Sua negativa é ilegal, você vai ganhar."),
        ("Quando o caso preenche os requisitos, dá pra pedir uma liminar com urgência.",
         "Garanto a liminar em dias."),
    ]),
    Spacer(1,3*mm),
    note("Diferença pro genérico:",
         "o criativo de curso ensina a fórmula da frase de impacto. O nosso já vem com "
         "o assunto certo pro seu nicho — negativa de plano, fila do SUS, terapia de "
         "criança negada — e a régua ética que impede a peça de virar problema com a "
         "OAB."),
    PageBreak(),
]

# ---------------------------------------------------------------- PILAR 2
E += [
    Paragraph(sp("PILAR 02"), ST["kick"]), Spacer(1,2),
    Paragraph("Anúncio", ST["disp"]),
    Paragraph("Nada de pixel, CPC ou termo técnico agora. Com orçamento enxuto, a "
              "única missão é impulsionar o criativo certo pro público certo — e isso "
              "já basta pra começar.", ST["lead"]),
    Paragraph("<b>R$ 500 de investimento inicial, 100% em campanha de mensagem.</b> "
              "Orçamento baixo não sustenta testar várias campanhas ao mesmo tempo — "
              "toda a verba vai pra um único objetivo: gerar conversa qualificada no "
              "WhatsApp o mais rápido possível. O funil é curto de propósito: quanto "
              "menos etapa, menos gente se perde no meio do caminho.", ST["body"]),
    Spacer(1,2*mm),
    stat_row([("R$ 500", "investimento inicial, sem agência"),
              ("100%", "em campanha de mensagem, foco único"),
              ("1 a 2", "fechamentos já pagam a operação inteira")]),
    Spacer(1,4*mm),
    note("Diferença pro genérico:",
         "o curso te ensina a subir qualquer anúncio. O nosso já sabe pra quem — a "
         "família de quem cuida, não o paciente — e em qual das duas frentes (plano ou "
         "SUS) cada real rende mais, porque isso está na página 8."),
    PageBreak(),
]

# ---------------------------------------------------------------- PILAR 3
E += [
    Paragraph(sp("PILAR 03"), ST["kick"]), Spacer(1,2),
    Paragraph("Atendimento", ST["disp"]),
    Paragraph("Conversar com trinta pessoas por dia desgasta qualquer operação — ainda "
              "mais uma de uma pessoa só. O atendimento automático filtra quem só quer "
              "tirar dúvida de quem está pronto. Você entra só na hora de negociar.",
              ST["lead"]),
    Paragraph("<b>Formulário de qualificação</b> — procedimento negado, negativa por "
              "escrito, urgência médica, contato — chega junto com o lead no WhatsApp. "
              "<b>Resposta em até 1h útil</b>, porque se o posicionamento é velocidade, "
              "o atendimento é a prova disso.", ST["body"]),
    Spacer(1,2*mm),
    art(art_funnel, 190),
    Spacer(1,3*mm),
    note("Diferença pro genérico:",
         "o formulário pergunta sobre saúde — dado sensível pela LGPD (art. 11). O "
         "curso não fala nisso. O nosso já nasce com aviso de consentimento e regra de "
         "onde guardar a resposta."),
    PageBreak(),
]

# ---------------------------------------------------------------- O QUE SÓ NÓS TEMOS — frentes
E += sec("O QUE A FÓRMULA PRONTA NÃO TEM", "Duas frentes, não uma")
E += [
    Paragraph("Um método vendido pra qualquer advogado mira só a operadora de plano. "
              "Só que cerca de <b>7 em cada 10 brasileiros não têm plano</b> e dependem "
              "do SUS — que nega igual (medicamento de alto custo, cirurgia, UTI, "
              "terapia “fora da tabela”). Isso dobra o mercado sem gastar um real a "
              "mais.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_twofronts, 150),
    Spacer(1,3*mm),
    Paragraph("Contra o Estado, a base é o <b>art. 196 da Constituição</b>. Contra o "
              "plano, a Lei 9.656/98 e o CDC. A ferramenta que destrava os dois é a "
              "mesma: a <b>tutela de urgência do art. 300 do CPC</b> — a mesma "
              "competência que você já tem, mirando o dobro de gente.", ST["bodyj"]),
    PageBreak(),
]

# ---------------------------------------------------------------- NICHOS
E += sec("OS DOIS PÚBLICOS QUE MAIS CONVERTEM", "A criança e a melhor idade")
E += [
    Paragraph("Quem procura, decide e paga quase nunca é o paciente — é a família. "
              "Dois nichos dentro dela são os mais recorrentes e emocionais que "
              "existem, e nenhum curso genérico fala neles.", ST["body"]),
    Spacer(1,3*mm),
    front_block("NICHO 01 · A CRIANÇA", "A criança que precisa de terapia",
        "Autismo (TEA) é hoje uma das maiores demandas de saúde do país. Plano e SUS "
        "cortam a carga horária de terapia que o médico pediu, e cada mês perdido é "
        "desenvolvimento que não volta. A mãe vira sua melhor propaganda no grupo de "
        "outras mães.",
        "terapia ABA, fonoaudiologia, terapia ocupacional, acompanhante terapêutico na "
        "escola, horas de terapia negadas.",
        "Recorrente, emocional, com boca a boca fortíssimo.", "child", acc=CLAY),
    Spacer(1,5*mm),
    front_block("NICHO 02 · A MELHOR IDADE", "O idoso que o sistema deixa esperando",
        "A família não aceita ver o pai ou a mãe na fila enquanto a saúde piora. A "
        "urgência é literal, e o Estatuto do Idoso ainda dá prioridade na tramitação.",
        "home care, medicamento oncológico e de alto custo, cirurgia negada “por "
        "idade”, fisioterapia, insumos.",
        "Decisão movida por amor de filho, com prioridade legal de quem já tem idade.",
        "elder"),
    PageBreak(),
]

# ---------------------------------------------------------------- FINANCEIRO
E += sec("O ÂNGULO QUE NENHUM CURSO ENSINA", "O advogado como plano de saúde")
E += [
    Paragraph("Quem depende do SUS <b>já não paga plano nenhum</b> — o dinheiro que "
              "iria pra uma mensalidade que nega está livre. O honorário se reposiciona "
              "como o melhor investimento em saúde da família: mais barato que um ano "
              "de plano, e esse aqui entrega.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_scale, 168),
    Spacer(1,3*mm),
    note("Ética (sempre):",
         "isso é reposicionamento de valor percebido — não promessa de ganho. Nada de "
         "“recupero seu dinheiro”. O desfecho é sempre da Justiça; cada peça passa pelo "
         "seu ok.", accent=CLAY, bg=HexColor("#F6ECE5")),
    PageBreak(),
]

# ---------------------------------------------------------------- CRONOGRAMA
E += sec("O CAMINHO", "90 dias, sem pular etapa")
E += [
    Paragraph("Nada de virar tudo de uma vez. O plano prova o modelo em fases, com os "
              "mesmos R$ 500, abrindo uma frente nova a cada mês.", ST["body"]),
    Spacer(1,2*mm),
    art(art_timeline, 150),
    Spacer(1,4*mm),
    Paragraph("O objetivo dos 90 dias não é escalar. É <b>provar</b>, com o menor "
              "investimento possível, que o método funciona nas duas frentes e nos dois "
              "nichos — e então saber, com número na mão, onde vale a pena colocar mais "
              "verba.", ST["body"]),
    PageBreak(),
]

# ---------------------------------------------------------------- GUARDRAILS
E += sec("A RÉGUA QUE O CURSO NÃO TEM", "Ética como vantagem, não como freio")
E += [
    Paragraph("Um método genérico vendido pra qualquer advogado não pode saber o que a "
              "OAB permite pro seu registro. O nosso sabe — e é isso que te protege "
              "enquanto os criativos escalam.", ST["body"]),
    Spacer(1,2*mm),
    checklist("PODE — TODA PEÇA PRECISA TER", [
        "Caráter informativo ou educativo predominante",
        "Identificação: nome do advogado + número da OAB",
        "Base legal citada quando fizer afirmação jurídica",
    ], accent=SAGE, mark="check"),
    Spacer(1,3*mm),
    checklist("NÃO PODE — REPROVA NA HORA", [
        "Promessa de resultado (“reverto”, “garanto”, “em X dias”)",
        "Valores de honorário ou de causa",
        "Depoimento de cliente ou print de decisão como propaganda",
        "“Consulta grátis” como isca de captação",
    ], accent=CLAY, mark="x"),
    PageBreak(),
]

# ---------------------------------------------------------------- FECHAMENTO (dark)
E += [NextPageTemplate("dark"), PageBreak()]
E += [
    Spacer(1,8*mm),
    Paragraph(sp("PRA COMEÇAR"), ST["kickw"]), Spacer(1,3),
    Paragraph("Três pilares. Sem curso.", ST["dk_h"]),
    Spacer(1,6*mm),
    Paragraph("Criativo, anúncio e atendimento não são segredo de ninguém — é o que "
              "qualquer método digital sério usa. A diferença nunca esteve nos três "
              "nomes. Esteve em pensar pro seu escritório: as duas frentes, os dois "
              "nichos, o reposicionamento financeiro e a régua da OAB que nenhuma "
              "fórmula genérica carrega.", ST["dk_b"]),
    Spacer(1,4*mm),
    Paragraph("O que eu preciso de você:", ST["dk_b"]),
    Paragraph("<b>1.</b>&nbsp;&nbsp;Seu número da OAB, pra estampar em perfil e criativos.", ST["dk_b"]),
    Paragraph("<b>2.</b>&nbsp;&nbsp;Três casos antigos, anonimizados, pra alimentar o criativo.", ST["dk_b"]),
    Paragraph("<b>3.</b>&nbsp;&nbsp;Meia hora sua pra alinhar o tom. O resto eu toco e trago pronto.", ST["dk_b"]),
    Spacer(1,7*mm),
    Paragraph("Não precisa comprar método de ninguém. O seu já está aqui — feito pra "
              "você, não revendido pra qualquer advogado do Brasil.", ST["pullw"]),
    Spacer(1,8*mm),
    Paragraph("Bora?", ST["dk_h"]),
]

doc.build(E)
print("OK:", OUT)
