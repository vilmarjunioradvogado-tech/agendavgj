# -*- coding: utf-8 -*-
"""
PROTOCOLO EMERGENCIAL DE SAÚDE — VERSÃO DEFINITIVA
Dossiê de posicionamento & tráfego do escritório Vilmar Guimarães Júnior.
Mantém a estrutura "Processo Nº" do material original, upgradada com:
plano privado + SUS, públicos criança/melhor idade, reposicionamento
financeiro, conformidade OAB/LGPD. Sem qualquer referência externa.
Paleta quente VGJ (creme / café / dourado / terracota).
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
OUT = os.path.join(HERE, "Protocolo_Emergencial_de_Saude_DEFINITIVO.pdf")

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
    nb = "\u00a0"
    return (nb * 3).join(nb.join(w) for w in txt.split())

def stl(name, **kw):
    base = dict(fontName=SANS, fontSize=10, leading=15, textColor=INK, alignment=TA_LEFT)
    base.update(kw); return ParagraphStyle(name, **base)

ST = {
    "label": stl("label", fontName=SANB, fontSize=8, leading=11, textColor=GOLD),
    "kickw": stl("kickw", fontName=SANB, fontSize=8, leading=12, textColor=GOLD_L),
    "disp":  stl("disp", fontName=SERB, fontSize=25, leading=28, textColor=ESP, spaceAfter=9),
    "disp2": stl("disp2", fontName=SERB, fontSize=21, leading=24, textColor=ESP),
    "body":  stl("body", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9),
    "bodyj": stl("bodyj", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9, alignment=TA_JUSTIFY),
    "small": stl("small", fontSize=8.6, leading=12.5, textColor=GRAY),
    "cap":   stl("cap", fontSize=8, leading=11, textColor=GRAY, alignment=TA_CENTER),
    "cardk": stl("cardk", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "cardh": stl("cardh", fontName=SERB, fontSize=13, leading=17, textColor=ESP),
    "cardb": stl("cardb", fontSize=9.2, leading=13.5, textColor=INK),
    "th":    stl("th", fontName=SANB, fontSize=7.6, leading=11, textColor=GOLD),
    "td":    stl("td", fontSize=8.6, leading=12.5, textColor=INK),
    "cov_k": stl("cov_k", fontName=SANB, fontSize=9, leading=13, textColor=GOLD_L),
    "cov_t": stl("cov_t", fontName=SERB, fontSize=34, leading=38, textColor=WHITE),
    "cov_s": stl("cov_s", fontName=SERI, fontSize=13, leading=19, textColor=CREAMW),
    "cov_m": stl("cov_m", fontSize=9, leading=15, textColor=HexColor("#B4A892")),
    "quote": stl("quote", fontName=SERI, fontSize=13, leading=18.5, textColor=WHITE),
    "good":  stl("good", fontSize=9.2, leading=14, textColor=INK),
    "bad":   stl("bad", fontSize=9.2, leading=14, textColor=INK),
    "dk_h":  stl("dk_h", fontName=SERB, fontSize=22, leading=26, textColor=WHITE),
    "dk_b":  stl("dk_b", fontSize=10.2, leading=16, textColor=CREAMW, spaceAfter=7),
}

# ================================================================ helpers (drawing)
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

def ic_person(c, cx, cy, s, col=ESP, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy+s*0.55, s*0.32, stroke=1, fill=0)
    c.arc(cx-s*0.55, cy-s*0.9, cx+s*0.55, cy+s*0.35, 20, 140)
def ic_child(c, cx, cy, s, col=ESP, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy+s*0.5, s*0.28, stroke=1, fill=0)
    c.arc(cx-s*0.42, cy-s*0.75, cx+s*0.42, cy+s*0.2, 20, 140)
def ic_building(c, x, y, w, h, col=ESP, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.rect(x, y, w, h, stroke=1, fill=0)
    for i in range(3):
        for j in range(4):
            c.rect(x+w*(0.18+0.32*i), y+h*(0.15+0.21*j), w*0.14, h*0.1, stroke=0, fill=1)
def ic_plus(c, cx, cy, s, col=GOLD):
    c.setFillColor(col); c.rect(cx-s*0.18, cy-s*0.5, s*0.36, s, stroke=0, fill=1)
    c.rect(cx-s*0.5, cy-s*0.18, s, s*0.36, stroke=0, fill=1)
def ic_card(c, x, y, w, h, col=ESP, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.roundRect(x, y, w, h, 3, stroke=1, fill=0)
    c.setFillColor(col); c.rect(x, y+h*0.62, w, h*0.16, stroke=0, fill=1)
    c.setLineWidth(1.3); c.line(x+w*0.12, y+h*0.32, x+w*0.6, y+h*0.32)
    c.line(x+w*0.12, y+h*0.18, x+w*0.45, y+h*0.18)
def ic_check(c, cx, cy, s, col=SAGE, lw=2.8):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    c.line(cx-s*0.5, cy, cx-s*0.1, cy-s*0.45); c.line(cx-s*0.1, cy-s*0.45, cx+s*0.6, cy+s*0.5)
    c.setLineCap(0)
def ic_x(c, cx, cy, s, col=CLAY, lw=2.8):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    c.line(cx-s*0.4, cy-s*0.4, cx+s*0.4, cy+s*0.4); c.line(cx-s*0.4, cy+s*0.4, cx+s*0.4, cy-s*0.4)
    c.setLineCap(0)

# ---------------------------------------------------------------- illustrations
def art_reframe(c, w, h):
    cy = h * 0.52
    cw, ch = 46, 30; lx = w * 0.05
    _card(c, lx, cy - ch/2, cw, ch, fill=HexColor("#EFE9DE"), stroke=LINE2, r=4)
    ic_card(c, lx+6, cy-ch/2+5, cw-12, ch-10, col=HexColor("#B4A98F"), lw=1.6)
    c.setStrokeColor(CLAY); c.setLineWidth(3); c.setLineCap(1)
    c.line(lx+4, cy-ch/2+3, lx+cw-4, cy+ch/2-3); c.setLineCap(0)
    _t(c, lx+cw/2, cy-ch/2-11, "o plano que nega", SANS, 8, GRAY, "c")
    _t(c, lx+cw/2, cy-ch/2-21, "(ou a fila do SUS)", SANS, 7.5, GRAY, "c")
    ax = lx+cw+14
    c.setStrokeColor(GOLD); c.setLineWidth(2.4); c.setLineCap(1)
    c.line(ax, cy, ax+22, cy)
    c.line(ax+22, cy, ax+16, cy+5); c.line(ax+22, cy, ax+16, cy-5); c.setLineCap(0)
    bx = ax+40
    c.setFillColor(ESP); c.circle(bx, cy+3, 18, stroke=0, fill=1)
    try:
        c.drawImage(A("vgj_mono_white.png"), bx-8.5, cy-6, width=17, height=18,
                    preserveAspectRatio=True, mask='auto')
    except Exception: pass
    _t(c, bx, cy-26, "você", SANB, 8.5, ESP, "c")
    _t(c, bx, cy-36, "o advogado", SANS, 7.5, GRAY, "c")
    ex = bx+30
    c.setStrokeColor(LINE2); c.setLineWidth(2.4)
    c.line(ex, cy+3, ex+12, cy+3); c.line(ex, cy-3, ex+12, cy-3)
    rx = ex+44
    c.setFillColor(HexColor("#F0E7D6")); c.circle(rx, cy, 22, stroke=0, fill=1)
    ic_plus(c, rx, cy+2, 15, col=GOLD)
    _t(c, rx, cy-30, "tratamento", SANB, 8.5, ESP, "c")
    _t(c, rx, cy-40, "que acontece", SANS, 7.5, GRAY, "c")

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

def front_block(kick, title, intro, treatments, hook, icon, acc=GOLD):
    def draw_icon(c, w, h):
        c.setFillColor(ESP); c.roundRect(0,0,w,h,8,stroke=0,fill=1)
        cx,cy=w/2,h/2
        if icon=="child": ic_child(c, cx, cy-3, 19, col=WHITE, lw=2.4)
        else: ic_person(c, cx, cy-3, 23, col=WHITE, lw=2.4)
        ic_plus(c, cx+14, cy+13, 8, col=acc)
    left=art(draw_icon, 70, w=60)
    tt=Table([[Paragraph("<b>O que costuma ser negado:</b> "+treatments, ST["cardb"])]],
             colWidths=[FW-60-10])
    tt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),CARD2),
        ("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    right=[Paragraph(sp(kick), ST["cardk"]), Spacer(1,2), Paragraph(title, ST["cardh"]),
           Spacer(1,3), Paragraph(intro, ST["cardb"]), Spacer(1,5), tt, Spacer(1,5),
           Paragraph("<i>"+hook+"</i>", ST["small"])]
    t=Table([[left, right]], colWidths=[60, FW-60])
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
    steps=[("ANÚNCIO","post ou reel de texto, sem rosto",GOLD),
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
        _t(c, midx+maxw/2+14, y+bh/2+1, s, SANS, 8, GRAY, "l")
        c.setStrokeColor(LINE2); c.setLineWidth(0.7)
        c.line(midx+wt/2, y+bh/2, midx+maxw/2+10, y+bh/2)

def art_timeline(c, w, h):
    phases = [
        ("SEMANA 1–2", "Fundação",
         ["Bio, foto e OAB visível", "3 posts fixados", "Frente: plano privado",
          "Copy revisada e ética"]),
        ("SEMANA 3–6", "No ar",
         ["Campanha R$ 500 no ar", "Formulário + WhatsApp prontos", "Resposta em até 1h útil",
          "Leitura de custo por lead"]),
        ("MÊS 2–3", "Amplia",
         ["Abre a frente SUS", "Nichos criança e melhor idade", "Dobra no que converteu",
          "Decide com número na mão"]),
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
        _t(c, cx, liney - 30, title, SANB, 11, ESP, "c")
        yy = liney - 48
        for it in items:
            c.setFillColor(GOLD); c.circle(seg * i + 20, yy + 3, 1.8, stroke=0, fill=1)
            _t(c, seg * i + 26, yy, it, SANS, 8, INK, "l"); yy -= 15

def quote(txt):
    inner=Table([[Paragraph(txt, ST["quote"])]], colWidths=[FW])
    inner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),ESP),
        ("LEFTPADDING",(0,0),(-1,-1),16),("RIGHTPADDING",(0,0),(-1,-1),16),
        ("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),
        ("LINEBEFORE",(0,0),(0,-1),3,GOLD)]))
    return inner

def note(title, body, accent=GOLD, bg=CARD2):
    inner=Table([[Paragraph("<b>"+title+"</b>  "+body, ST["small"])]], colWidths=[FW])
    inner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),
        ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
        ("LINEBEFORE",(0,0),(0,-1),2.5,accent)]))
    return inner

def rule_table(header, rows, widths):
    data=[[Paragraph(sp(h2), ST["th"]) for h2 in header]]
    for r in rows: data.append([Paragraph(cc, ST["td"]) for cc in r])
    t=Table(data, colWidths=widths, repeatRows=1)
    s=[("LINEBELOW",(0,0),(-1,0),1,GOLD),("LINEBELOW",(0,1),(-1,-1),0.5,LINE),
       ("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),
       ("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),6),
       ("BOTTOMPADDING",(0,0),(-1,-1),6)]
    t.setStyle(TableStyle(s)); return t

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
    _t(c, W-Rm, Hh-14.5*mm, "PROTOCOLO EMERGENCIAL DE SAÚDE", SANB, 7, GOLD, "r")
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
    c.setFillColor(ESP); c.rect(0,0,W,Hh,stroke=0,fill=1)
    c.setFillColor(GOLD); c.rect(0,Hh-6*mm,W,6*mm,stroke=0,fill=1)
    try: c.drawImage(A("vgj_mono_faintw.png"), W-70*mm, 12*mm, width=78*mm, height=82*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass
    try: c.drawImage(A("vgj_white.png"), L, Hh-40*mm, width=46*mm, height=13.3*mm,
                     preserveAspectRatio=True, mask='auto')
    except Exception: pass
    c.setStrokeColor(HexColor("#4A4234")); c.setLineWidth(0.75)
    c.circle(W-38*mm, 44*mm, 21*mm, stroke=1, fill=0)
    _t(c, W-38*mm, 48*mm, "PROTOCOLO EMERGENCIAL", SANB, 6.6, GOLD_L, "c")
    _t(c, W-38*mm, 42*mm, "Nº 001 · SAÚDE SUPLEMENTAR", SANB, 6.6, GOLD_L, "c")
    _t(c, W-38*mm, 36*mm, "PLANO PRIVADO + SUS", SANB, 6.6, GOLD_L, "c")

doc=BaseDocTemplate(OUT, pagesize=A4, leftMargin=L, rightMargin=Rm,
                    topMargin=24*mm, bottomMargin=BOT,
                    title="Protocolo Emergencial de Saúde",
                    author="Vilmar Guimarães Júnior Advocacia")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(L,26*mm,FW,Hh-70*mm,id="cov")], onPage=bg_cover),
    PageTemplate(id="content", frames=[Frame(L,BOT,FW,Hh-24*mm-BOT,id="c")], onPage=bg_paper),
    PageTemplate(id="dark", frames=[Frame(L,16*mm,FW,Hh-32*mm,id="d")], onPage=bg_dark),
])

def sec(num, name, title):
    return [Paragraph(sp(f"PROCESSO Nº {num} — {name}"), ST["label"]), Spacer(1,2),
            Paragraph(title, ST["disp"]), Spacer(1,4)]

E=[]

# ---------------------------------------------------------------- CAPA
E += [
    Spacer(1,4*mm),
    Paragraph(sp("DOSSIÊ DE POSICIONAMENTO & TRÁFEGO"), ST["cov_k"]),
    Spacer(1,14*mm),
    Paragraph("Protocolo<br/>Emergencial<br/>de Saúde", ST["cov_t"]),
    Spacer(1,8*mm),
    Paragraph("Enquanto o plano nega e a fila do SUS não anda, alguém precisa correr "
              "contra o tempo. Esse alguém é você.", ST["cov_s"]),
    Spacer(1,14*mm),
    Paragraph("Cliente — Vilmar Guimarães Júnior · Advocacia em Direito à Saúde<br/>"
              "Escopo — Posicionamento de Instagram + Estratégia de Tráfego<br/>"
              "Frentes — Plano privado e SUS · Públicos — Criança e melhor idade<br/>"
              "Investimento inicial — R$ 500,00<br/>"
              "Julho de 2026", ST["cov_m"]),
    NextPageTemplate("content"), PageBreak(),
]

# ---------------------------------------------------------------- 01 DIAGNÓSTICO
E += sec("01", "DIAGNÓSTICO", "O problema não é a negativa.<br/>É o tempo.")
E += [
    Paragraph("Todo paciente que tem um procedimento, exame ou medicamento de alto "
              "custo negado passa pela mesma sequência: liga pra operadora, abre "
              "reclamação na ANS, espera. Quem depende do SUS enfrenta a mesma espera "
              "numa fila que não anda. Nos dois casos, o tratamento não acontece "
              "enquanto a resposta não vem.", ST["bodyj"]),
    Spacer(1,2*mm),
    Table([[
        Table([[Paragraph(sp("PROBLEMA CENTRAL"), ST["cardk"])],
               [Paragraph("A negativa", ST["cardh"])],
               [Paragraph("Muitas negativas de plano e recusas do SUS podem ser "
                          "ilegais — e existe caminho jurídico pra buscar reversão "
                          "com agilidade, quando presentes os requisitos legais.",
                          ST["cardb"])]],
              colWidths=[(FW-6*mm)/2]),
        Table([[Paragraph(sp("PROBLEMA SOFISTICADO"), ST["cardk"])],
               [Paragraph("O tempo perdido", ST["cardh"])],
               [Paragraph("Mesmo quem procura ajuda cai em canais lentos (ANS, "
                          "ouvidoria do SUS) ou advogado generalista que não domina "
                          "o pedido de urgência. O quadro de saúde piora enquanto o "
                          "processo tramita.", ST["cardb"])]],
              colWidths=[(FW-6*mm)/2]),
    ]], colWidths=[(FW-6*mm)/2+3*mm, (FW-6*mm)/2+3*mm]),
    Spacer(1,4*mm),
    Paragraph("<b>Por que isso muda o posicionamento:</b> o mercado de advocacia em "
              "saúde compete em conhecimento jurídico. O escritório compete em "
              "<b>velocidade e método</b> — e em mirar as duas frentes onde a negativa "
              "acontece, não só uma.", ST["body"]),
    Spacer(1,2*mm),
    quote("“Direito à saúde não tem fila de espera administrativa. Tem prazo legal, "
          "e ele é curto.”"),
    PageBreak(),
]

# fix table style for the two-box problem row above (apply after creation is awkward;
# instead wrap with common style via nested tables' own default look is fine)

# ---------------------------------------------------------------- 02 POSICIONAMENTO
E += sec("02", "POSICIONAMENTO", "O discurso que atrai<br/>quem já está frustrado")
E += [
    rule_table(["Nº","ELEMENTO","DEFINIÇÃO"],
        [["01","<b>Público</b>","Pessoas com procedimento, cirurgia, exame ou "
               "medicamento de alto custo negado por plano de saúde — ou represado "
               "na fila do SUS. Já tentaram resolver sozinhas e não conseguiram."],
         ["02","<b>Quem decide</b>","Quase nunca o próprio paciente. É a família: a "
               "mãe da criança, a filha do idoso, o cônjuge. É com quem cuida que a "
               "comunicação fala."],
         ["03","<b>Efeito colateral em comum</b>","Tempo perdido, saúde agravando, "
               "dinheiro saindo do bolso, sensação de estar sozinho contra o sistema "
               "— privado ou público."]],
        [10*mm, 40*mm, FW-10*mm-40*mm]),
    Spacer(1,4*mm),
    Table([[Paragraph(sp("NOME DO MÉTODO"), ST["cardk"])],
           [Paragraph("Protocolo Emergencial de Saúde", ST["cardh"])],
           [Paragraph("Comunica exatamente o que o cliente precisa sentir: urgência "
                      "e procedimento. Não é “mais um advogado”, é um protocolo a "
                      "ser seguido quando o tempo é curto — e vale tanto pra quem "
                      "tem plano quanto pra quem depende do SUS.", ST["cardb"])]],
          colWidths=[FW]),
    Spacer(1,4*mm),
    Table([[Paragraph(sp("PROMESSA"), ST["cardk"])],
           [Paragraph("<b>“Oriento quem teve procedimento ou medicamento negado — "
                      "pelo plano de saúde ou pelo SUS — a buscar, com agilidade e "
                      "dentro da lei, a resposta jurídica adequada ao seu caso.”</b>",
                      ST["cardb"])],
           [Paragraph("Promessa de processo e competência — nunca de resultado. Sem "
                      "projeção de desfecho, sem valores, sem “consulta grátis” como "
                      "isca, conforme o Código de Ética da OAB e o Provimento "
                      "205/2021.", ST["cardb"])]],
          colWidths=[FW]),
    PageBreak(),
]

# ---------------------------------------------------------------- 03 IDENTIDADE
E += sec("03", "NOVA IDENTIDADE", "O que muda no perfil")
E += [
    Table([[Paragraph(sp("BIO"), ST["cardk"])],
           [Paragraph("“Advocacia em Direito à Saúde · Negativas de cirurgia, exame "
                      "e medicamento de alto custo · Plano privado e SUS · Casos "
                      "urgentes com prioridade de análise · OAB/BA nº ____”",
                      ST["cardh"])],
           [Paragraph("O número da OAB entra na bio e nos criativos — sinal de "
                      "seriedade e requisito de identificação da publicidade "
                      "profissional.", ST["cardb"])]],
          colWidths=[FW]),
    Spacer(1,4*mm),
    Table([[
        Table([[Paragraph(sp("FOTO DE PERFIL"), ST["cardk"])],
               [Paragraph("Autoridade e discrição", ST["cardh"])],
               [Paragraph("Retrato único, sério, fundo neutro. É a única aparição "
                          "pessoal — o resto da comunicação roda sem rosto, o que "
                          "combina com o estilo reservado do escritório.",
                          ST["cardb"])]], colWidths=[(FW-6*mm)/2]),
        Table([[Paragraph(sp("DESTAQUES"), ST["cardk"])],
               [Paragraph("“Comece aqui” + “Seus direitos”", ST["cardh"])],
               [Paragraph("O primeiro explica o método em 3 passos. O segundo reúne "
                          "conteúdo educativo sobre a lei — autoridade sem depender "
                          "de depoimento de cliente.", ST["cardb"])]],
              colWidths=[(FW-6*mm)/2]),
    ]], colWidths=[(FW-6*mm)/2+3*mm, (FW-6*mm)/2+3*mm]),
    Spacer(1,4*mm),
    Paragraph("<b>Regra de consistência:</b> tudo no perfil fala de uma coisa só — o "
              "Protocolo Emergencial de Saúde. Bio, destaques e os 3 primeiros posts "
              "fixados repetem a mesma mensagem de formas diferentes.", ST["body"]),
    PageBreak(),
]

# ---------------------------------------------------------------- 04 DUAS FRENTES
E += sec("04", "ONDE A BRIGA ACONTECE", "Plano privado e SUS —<br/>duas frentes, não uma")
E += [
    Paragraph("Cerca de <b>7 em cada 10 brasileiros não têm plano de saúde</b> e "
              "dependem do SUS — que nega ou represa igual (medicamento de alto "
              "custo, cirurgia, vaga de UTI, terapia “fora da tabela”). Mirar só a "
              "operadora deixa metade do mercado de fora.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_twofronts, 150),
    Spacer(1,3*mm),
    Paragraph("Contra o Estado, a base é o <b>art. 196 da Constituição</b> (saúde é "
              "direito de todos e dever do Estado). Contra o plano, a Lei 9.656/98 e "
              "o CDC. A ferramenta que destrava os dois é a mesma: a <b>tutela de "
              "urgência do art. 300 do CPC</b>.", ST["bodyj"]),
    Spacer(1,3*mm),
    stat_row([("≈ 7 em 10","brasileiros dependem do SUS, não de plano"),
              ("Art. 196","a Constituição obriga o Estado a dar saúde"),
              ("Art. 300","a mesma liminar vale nas duas frentes")]),
    PageBreak(),
]

# ---------------------------------------------------------------- 05 PÚBLICOS
E += sec("05", "OS DOIS PÚBLICOS QUE MAIS CONVERTEM", "A criança e a melhor idade")
E += [
    Paragraph("Dentro da lógica de que quem decide é a família, dois públicos são os "
              "mais recorrentes e emocionais — vale concentrar conteúdo e criativo "
              "neles.", ST["body"]),
    Spacer(1,3*mm),
    front_block("PÚBLICO 01 · A CRIANÇA", "A criança que precisa de terapia",
        "Autismo (TEA) é hoje uma das maiores demandas de saúde do país. Plano e SUS "
        "negam ou cortam a carga horária de terapia que o médico pediu, e cada mês "
        "perdido é desenvolvimento que não volta. A mãe vira a melhor propaganda no "
        "grupo de outras mães.",
        "terapia ABA, fonoaudiologia, terapia ocupacional, psicopedagogia, "
        "acompanhante terapêutico na escola, horas de terapia negadas.",
        "Recorrente, emocional, com boca a boca fortíssimo entre mães.", "child",
        acc=CLAY),
    Spacer(1,5*mm),
    front_block("PÚBLICO 02 · A MELHOR IDADE", "O idoso que o sistema deixa esperando",
        "A família não aceita ver o pai ou a mãe na fila enquanto a saúde piora. A "
        "urgência é literal, e o Estatuto do Idoso ainda dá prioridade na "
        "tramitação — a liminar sai mais rápido.",
        "home care e internação domiciliar, medicamento oncológico e de alto custo, "
        "cirurgia negada “por idade”, fisioterapia, insumos.",
        "Decisão movida por amor de filho, com prioridade legal de quem já tem "
        "idade.", "elder"),
    PageBreak(),
]

# ---------------------------------------------------------------- 06 REPOSICIONAMENTO
E += sec("06", "O PULO DO GATO É NO DINHEIRO", "O advogado como plano de saúde")
E += [
    Paragraph("A maior objeção nunca é o valor do honorário. É o medo: <i>“e se eu "
              "pagar e não der certo?”</i>. Com o público do SUS, esse medo cai "
              "sozinho — quem depende do SUS <b>já não paga plano nenhum</b>. O "
              "dinheiro que iria pra uma mensalidade que nega está livre. O "
              "honorário se reposiciona como o melhor investimento em saúde que essa "
              "família pode fazer.", ST["bodyj"]),
    Spacer(1,2*mm),
    art(art_reframe, 92),
    Spacer(1,2*mm),
    Paragraph("Da esquerda pra direita: o plano que nega (ou a fila do SUS) sai de "
              "cena; entra o advogado; e o que o cliente leva pra casa é o "
              "tratamento liberado. É essa a promessa — de processo e de presença, "
              "nunca de resultado garantido.", ST["cap"]),
    Spacer(1,4*mm),
    art(art_scale, 158),
    Spacer(1,3*mm),
    note("Sobre a ética:",
         "isso é reposicionamento de valor percebido, não promessa de ganho. Nada de "
         "“recupero seu dinheiro” ou “ganho garantido”. Vende-se presença, rapidez e "
         "método — o desfecho é sempre da Justiça.", accent=CLAY,
         bg=HexColor("#F6ECE5")),
    PageBreak(),
]

# ---------------------------------------------------------------- 07 CONTEÚDO
E += sec("07", "CONTEÚDO", "Fase 1: 9 posts<br/>pra construir posicionamento")
E += [
    Paragraph("Três posts fixados carregam o peso da mensagem. Os demais sustentam e "
              "repetem sob ângulos diferentes, cobrindo as duas frentes e os dois "
              "públicos.", ST["body"]),
    Spacer(1,2*mm),
    rule_table(["Nº","POST","FRENTE / PÚBLICO"],
        [["F1","O que é o Protocolo Emergencial de Saúde — fixado","Todos"],
         ["F2","A vida depois da liminar, sem prometer desfecho — fixado","Todos"],
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
         "publicidade da OAB veda. Autoridade se constrói citando a lei, não "
         "expondo caso. Casos são sempre “ilustrativos e anonimizados”."),
    PageBreak(),
]

# ---------------------------------------------------------------- Post 3/3 roteiro
E += sec("07", "PEÇA-CHAVE", "Post fixado 3/3 — Roteiro completo")
cards = [
    ("CARD 1", "Enquanto você espera a ANS ou a fila do SUS resolver seu problema, "
               "você fica cada vez mais sem tempo pro seu tratamento. O sistema não "
               "tem prazo pra te salvar. Tem prazo pra protocolar."),
    ("CARD 2", "Reclamação na ANS ou na ouvidoria não é ação judicial. Não obriga "
               "ninguém a liberar nada. Você abre um processo administrativo que "
               "pode levar semanas. Enquanto isso, sua cirurgia, exame ou remédio "
               "continua negado."),
    ("CARD 3", "Existe uma ferramenta prevista em lei — a tutela de urgência (art. "
               "300 do CPC), a chamada liminar. Quando o caso preenche os "
               "requisitos legais, o juiz pode determinar que o plano ou o Estado "
               "cumpra em prazo curto. E ela precisa ser pedida do jeito certo, no "
               "momento certo."),
    ("CARD 4", "O Protocolo Emergencial de Saúde nasceu pra isso. Análise do seu "
               "caso, verificação de possível ilegalidade na negativa e, quando "
               "cabível, pedido de urgência direto na Justiça — no plano ou contra "
               "o Estado."),
    ("CARD 5", "Não é reclamação. Não é mediação. É pedido de decisão judicial. "
               "Cada caso é único e depende de análise — mas quem age no tempo "
               "certo, com a documentação certa, disputa em outras condições."),
    ("CARD 6", "O que está em jogo não é dinheiro. É tempo de tratamento que não "
               "volta. Cada semana de espera é uma semana a menos de recuperação, "
               "de qualidade de vida, de tranquilidade."),
    ("CARD 7", "Direito à saúde não tem fila de espera administrativa. Tem prazo "
               "legal, e ele é curto."),
    ("CARD 8 · CTA", "Se seu plano negou ou o SUS represou cirurgia, exame ou "
               "medicamento de alto custo, guarde a negativa por escrito e não "
               "espere sem prazo. Envie a palavra PROTOCOLO no Direct."),
]
card_rows=[[Paragraph(sp(tag), ST["cardk"]), Paragraph(txt, ST["td"])] for tag,txt in cards]
tcards=Table(card_rows, colWidths=[30*mm, FW-30*mm])
tcards.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-2),0.5,LINE),
    ("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),
    ("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),6),
    ("BOTTOMPADDING",(0,0),(-1,-1),6)]))
E += [
    tcards,
    Spacer(1,4*mm),
    say_dont([
        ("Quando o caso preenche os requisitos, dá pra pedir uma liminar com urgência.",
         "Garanto a liminar / ganho garantido."),
        ("Analiso seu caso e, se cabível, entro com o pedido de urgência.",
         "Meus clientes já têm data marcada pro procedimento."),
    ]),
    PageBreak(),
]

# ---------------------------------------------------------------- 08 TRÁFEGO
E += sec("08", "TRÁFEGO", "Orçamento enxuto, fechamento rápido")
E += [
    Paragraph("<b>R$ 500 de investimento inicial · 100% em campanha de mensagem · "
              "foco em primeiros fechamentos.</b> Orçamento baixo não sustenta "
              "testar várias campanhas ao mesmo tempo — toda a verba vai pra gerar "
              "conversa qualificada no WhatsApp o mais rápido possível.",
              ST["body"]),
    Spacer(1,2*mm),
    art(art_funnel, 190),
    Spacer(1,3*mm),
    note("Formulário e LGPD:",
         "o formulário pergunta sobre saúde — dado sensível (art. 11 da LGPD). "
         "Precisa de aviso curto de consentimento, e as respostas ficam em "
         "ambiente restrito, não em planilha aberta."),
    Spacer(1,3*mm),
    note("Resposta em até 1h útil:",
         "se o posicionamento é velocidade, o atendimento é a prova. Mensagem "
         "automática confirma recebimento; resposta pessoal em até 1h útil pede "
         "negativa por escrito e laudo, e já oferece dois horários de reunião.",
         accent=CLAY, bg=HexColor("#F6ECE5")),
    PageBreak(),
]

# ---------------------------------------------------------------- 09 MÉTRICAS & CONFORMIDADE
E += sec("09", "MÉTRICAS & CONFORMIDADE", "Como saber se está funcionando")
E += [
    rule_table(["MÉTRICA","META FASE 1","SE ESTIVER FORA"],
        [["Custo por conversa iniciada","Até R$ 40",
          "Trocar criativo primeiro, público depois — nunca os dois ao mesmo tempo"],
         ["Taxa de qualificação","Acima de 50%",
          "Ajustar as perguntas do formulário ou o texto do anúncio"],
         ["Comparecimento em reunião","Acima de 60%",
          "Encurtar o tempo entre contato e reunião"],
         ["Fechamentos no mês","1 a 2",
          "Se as métricas acima batem e não fecha, o problema é a condução da "
          "reunião — não o tráfego"]],
        [46*mm, 30*mm, FW-46*mm-30*mm]),
    Spacer(1,4*mm),
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

# ---------------------------------------------------------------- 10 PRÓXIMOS PASSOS (dark)
E += [NextPageTemplate("dark"), PageBreak()]
E += [
    Spacer(1,6*mm),
    Paragraph(sp("PROCESSO Nº 10 — PRÓXIMOS PASSOS"), ST["kickw"]), Spacer(1,3),
    Paragraph("O que acontece a partir daqui", ST["dk_h"]),
    Spacer(1,6*mm),
    art(art_timeline, 150),
    Spacer(1,6*mm),
    Paragraph("O objetivo da Fase 1 não é escalar. É <b>provar</b>, com o menor "
              "investimento possível, que o protocolo funciona nas duas frentes e "
              "nos dois públicos — e então saber, com número na mão, onde vale a "
              "pena colocar mais verba.", ST["dk_b"]),
    Spacer(1,5*mm),
    Paragraph("Nenhuma peça vai ao ar sem validação prévia: na OAB, quem responde "
              "pela publicidade é o advogado.", ST["dk_b"]),
]

doc.build(E)
print("OK:", OUT)
