# -*- coding: utf-8 -*-
"""
VGJ · Advocacia em Saúde
Proposta de estratégia — documento editorial ilustrado, endereçado a Vilmar.
Padrão de marca: marinho #101322 + acento dourado, tipografia serifada editorial.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, NextPageTemplate, PageBreak, Flowable,
)

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda n: os.path.join(HERE, "assets", n)
OUT = os.path.join(HERE, "VGJ_Estrategia_Saude_Proposta.pdf")

# ---------------------------------------------------------------- brand palette
NAVY   = HexColor("#101322")   # marca VGJ
NAVY2  = HexColor("#1C2740")   # marinho secundário
GOLD   = HexColor("#B0894F")   # acento dourado sóbrio
GOLD_L = HexColor("#C9A96A")
CREAM  = HexColor("#F7F3EC")   # papel
CARD   = HexColor("#FBF9F4")   # cartão claro
INK    = HexColor("#2A2E38")   # texto
GRAY   = HexColor("#6E6A62")   # texto suave
LINE   = HexColor("#E3DBCD")   # linha fina
LINE2  = HexColor("#D8CDBA")
WHITE  = HexColor("#FFFFFF")
CREAMW = HexColor("#EDE6D8")   # creme sobre marinho

W, Hh = A4
L, R, TOP, BOT = 20 * mm, 20 * mm, 20 * mm, 18 * mm
FW = W - L - R

SER  = "Times-Roman"
SERB = "Times-Bold"
SERI = "Times-Italic"
SANS = "Helvetica"
SANB = "Helvetica-Bold"

def sp(txt, n=1):
    """letter-spacing simples para kickers, preservando o espaço entre palavras"""
    return "  ".join(" ".join(w) for w in txt.split())

def style(name, **kw):
    base = dict(fontName=SANS, fontSize=10, leading=15, textColor=INK,
                alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(name, **base)

ST = {
    "kick":   style("kick", fontName=SANB, fontSize=8, leading=12, textColor=GOLD),
    "kickw":  style("kickw", fontName=SANB, fontSize=8, leading=12, textColor=GOLD_L),
    "disp":   style("disp", fontName=SERB, fontSize=27, leading=30, textColor=NAVY,
                    spaceBefore=4, spaceAfter=10),
    "disp2":  style("disp2", fontName=SERB, fontSize=22, leading=25, textColor=NAVY),
    "body":   style("body", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9),
    "bodyj":  style("bodyj", fontSize=10.2, leading=16, textColor=INK, spaceAfter=9,
                    alignment=TA_JUSTIFY),
    "lead":   style("lead", fontName=SERI, fontSize=13, leading=19, textColor=NAVY2,
                    spaceAfter=10),
    "small":  style("small", fontSize=8.6, leading=12.5, textColor=GRAY),
    "cap":    style("cap", fontName=SANS, fontSize=8, leading=11, textColor=GRAY,
                    alignment=TA_CENTER),
    "cardk":  style("cardk", fontName=SANB, fontSize=8, leading=11, textColor=GOLD),
    "cardh":  style("cardh", fontName=SERB, fontSize=13.5, leading=17, textColor=NAVY),
    "cardb":  style("cardb", fontSize=9.4, leading=14, textColor=INK),
    "cardli": style("cardli", fontSize=9.2, leading=15, textColor=INK),
    # cover / dark
    "cov_k":  style("cov_k", fontName=SANB, fontSize=9, leading=13, textColor=GOLD_L),
    "cov_t":  style("cov_t", fontName=SERB, fontSize=40, leading=44, textColor=WHITE),
    "cov_s":  style("cov_s", fontName=SERI, fontSize=13.5, leading=20, textColor=CREAMW),
    "cov_m":  style("cov_m", fontName=SANS, fontSize=9, leading=15, textColor=HexColor("#9AA3B8")),
    "dk_h":   style("dk_h", fontName=SERB, fontSize=24, leading=28, textColor=WHITE),
    "dk_b":   style("dk_b", fontSize=10.2, leading=16, textColor=CREAMW, spaceAfter=7),
    "sig":    style("sig", fontName=SERI, fontSize=17, leading=20, textColor=NAVY),
    "pull":   style("pull", fontName=SERI, fontSize=15, leading=21, textColor=NAVY,
                    alignment=TA_LEFT),
    "pullw":  style("pullw", fontName=SERI, fontSize=16, leading=23, textColor=WHITE),
}

# ================================================================ drawing helpers
class Art(Flowable):
    def __init__(self, w, h, fn):
        super().__init__(); self._w = w; self._h = h; self.fn = fn
    def wrap(self, *a): return self._w, self._h
    def draw(self): self.fn(self.canv, self._w, self._h)

def art(fn, h, w=FW):
    return Art(w, h, fn)

def _card(c, x, y, w, h, fill=CARD, stroke=LINE, lw=1, r=7, accent=None, aw=3):
    if fill is not None:
        c.setFillColor(fill)
        c.roundRect(x, y, w, h, r, stroke=0, fill=1)
    if accent is not None:
        c.setFillColor(accent)
        c.roundRect(x, y, aw, h, aw, stroke=0, fill=1)
        c.setFillColor(fill if fill else CARD)
        c.rect(x + aw, y, aw, h, stroke=0, fill=1)
    if stroke is not None:
        c.setStrokeColor(stroke); c.setLineWidth(lw)
        c.roundRect(x, y, w, h, r, stroke=1, fill=0)

def _txt(c, x, y, s, font=SANS, size=9, color=INK, align="l"):
    c.setFillColor(color); c.setFont(font, size)
    if align == "c": c.drawCentredString(x, y, s)
    elif align == "r": c.drawRightString(x, y, s)
    else: c.drawString(x, y, s)

def _kick(c, x, y, s, color=GOLD, size=7.5):
    _txt(c, x, y, sp(s), SANB, size, color)

# --- small pictograms (flat line, navy+gold) ------------------------------------
def ic_person(c, cx, cy, s, col=NAVY, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.circle(cx, cy + s * 0.55, s * 0.32, stroke=1, fill=0)
    c.arc(cx - s * 0.55, cy - s * 0.9, cx + s * 0.55, cy + s * 0.35, 20, 140)

def ic_child(c, cx, cy, s, col=NAVY, lw=2.2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy + s * 0.5, s * 0.28, stroke=1, fill=0)
    c.arc(cx - s * 0.42, cy - s * 0.75, cx + s * 0.42, cy + s * 0.2, 20, 140)

def ic_shield(c, cx, cy, s, col=NAVY, lw=2.2, fill=None):
    p = c.beginPath()
    p.moveTo(cx, cy + s); p.lineTo(cx + s * 0.8, cy + s * 0.55)
    p.lineTo(cx + s * 0.8, cy - s * 0.2)
    p.curveTo(cx + s * 0.8, cy - s * 0.7, cx + s * 0.4, cy - s * 0.95, cx, cy - s * 1.05)
    p.curveTo(cx - s * 0.4, cy - s * 0.95, cx - s * 0.8, cy - s * 0.7, cx - s * 0.8, cy - s * 0.2)
    p.lineTo(cx - s * 0.8, cy + s * 0.55); p.close()
    if fill is not None:
        c.setFillColor(fill); c.drawPath(p, stroke=0, fill=1)
    c.setStrokeColor(col); c.setLineWidth(lw); c.drawPath(p, stroke=1, fill=0)

def ic_card(c, x, y, w, h, col=NAVY, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.roundRect(x, y, w, h, 3, stroke=1, fill=0)
    c.setFillColor(col)
    c.rect(x, y + h * 0.62, w, h * 0.16, stroke=0, fill=1)
    c.setLineWidth(1.3)
    c.line(x + w * 0.12, y + h * 0.32, x + w * 0.6, y + h * 0.32)
    c.line(x + w * 0.12, y + h * 0.18, x + w * 0.45, y + h * 0.18)

def ic_building(c, x, y, w, h, col=NAVY, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.rect(x, y, w, h, stroke=1, fill=0)
    for i in range(3):
        for j in range(4):
            wx = x + w * (0.18 + 0.32 * i); wy = y + h * (0.15 + 0.21 * j)
            c.rect(wx, wy, w * 0.14, h * 0.1, stroke=0, fill=1)

def ic_pluscross(c, cx, cy, s, col=GOLD, lw=0):
    c.setFillColor(col)
    c.rect(cx - s * 0.18, cy - s * 0.5, s * 0.36, s, stroke=0, fill=1)
    c.rect(cx - s * 0.5, cy - s * 0.18, s, s * 0.36, stroke=0, fill=1)

def ic_gavel(c, cx, cy, s, col=NAVY, lw=2.4):
    c.saveState(); c.translate(cx, cy); c.rotate(-38)
    c.setStrokeColor(col); c.setLineWidth(lw); c.setFillColor(col)
    c.roundRect(-s * 0.55, s * 0.28, s * 1.1, s * 0.42, 3, stroke=0, fill=1)  # head
    c.setLineWidth(lw); c.line(0, s * 0.28, 0, -s * 0.75)                      # handle
    c.restoreState()
    c.setLineWidth(2); c.setStrokeColor(col)
    c.line(cx - s * 0.7, cy - s * 0.9, cx + s * 0.7, cy - s * 0.9)             # base

def ic_clock(c, cx, cy, s, col=NAVY, lw=2):
    c.setStrokeColor(col); c.setLineWidth(lw)
    c.circle(cx, cy, s, stroke=1, fill=0)
    c.line(cx, cy, cx, cy + s * 0.55); c.line(cx, cy, cx + s * 0.4, cy)

def ic_check(c, cx, cy, s, col=GOLD, lw=2.6):
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    c.line(cx - s * 0.5, cy, cx - s * 0.1, cy - s * 0.45)
    c.line(cx - s * 0.1, cy - s * 0.45, cx + s * 0.6, cy + s * 0.5)
    c.setLineCap(0)

# ---------------------------------------------------------------- ILLUSTRATIONS
def art_reframe(c, w, h):
    """[carteirinha de plano ✕]  →  [VG / advogado]  =  tratamento liberado"""
    cy = h * 0.52
    # left: plano card, greyed / crossed
    cw, ch = 46, 30
    lx = w * 0.05
    _card(c, lx, cy - ch / 2, cw, ch, fill=HexColor("#EFE9DE"), stroke=LINE2, r=4)
    ic_card(c, lx + 6, cy - ch / 2 + 5, cw - 12, ch - 10, col=HexColor("#B4A98F"), lw=1.6)
    c.setStrokeColor(HexColor("#C0392B")); c.setLineWidth(3); c.setLineCap(1)
    c.line(lx + 4, cy - ch / 2 + 3, lx + cw - 4, cy + ch / 2 - 3)
    c.setLineCap(0)
    _txt(c, lx + cw / 2, cy - ch / 2 - 11, "o plano que nega", SANS, 8, GRAY, "c")
    _txt(c, lx + cw / 2, cy - ch / 2 - 21, "(ou que você nem tem)", SANS, 7.5, GRAY, "c")
    # arrow
    ax = lx + cw + 14
    c.setStrokeColor(GOLD); c.setLineWidth(2.4); c.setLineCap(1)
    c.line(ax, cy, ax + 22, cy)
    c.line(ax + 22, cy, ax + 16, cy + 5); c.line(ax + 22, cy, ax + 16, cy - 5)
    c.setLineCap(0)
    # center: VG badge
    bx = ax + 40
    ic_shield(c, bx, cy + 3, 18, col=NAVY, lw=2.2, fill=NAVY)
    try:
        c.drawImage(A("vgj_mono_white.png"), bx - 8.5, cy - 8, width=17, height=18,
                    preserveAspectRatio=True, mask='auto')
    except Exception:
        pass
    _txt(c, bx, cy - 26, "você", SANB, 8.5, NAVY, "c")
    _txt(c, bx, cy - 36, "o advogado", SANS, 7.5, GRAY, "c")
    # equals
    ex = bx + 30
    c.setStrokeColor(LINE2); c.setLineWidth(2.4)
    c.line(ex, cy + 3, ex + 12, cy + 3); c.line(ex, cy - 3, ex + 12, cy - 3)
    # result: heart+cross
    rx = ex + 44
    c.setFillColor(HexColor("#F0E7D6"))
    c.circle(rx, cy, 22, stroke=0, fill=1)
    ic_pluscross(c, rx, cy + 2, 15, col=GOLD)
    _txt(c, rx, cy - 30, "tratamento", SANB, 8.5, NAVY, "c")
    _txt(c, rx, cy - 40, "que acontece", SANS, 7.5, GRAY, "c")

def art_twofronts(c, w, h):
    """paciente no centro; duas colunas: PLANO PRIVADO e SUS / ESTADO"""
    midx = w / 2; topy = h - 14
    # center patient
    ic_person(c, midx, h * 0.5, 22, col=NAVY)
    _txt(c, midx, h * 0.5 - 26, "o paciente", SANB, 8.5, NAVY, "c")
    _txt(c, midx, h * 0.5 - 36, "com tratamento negado", SANS, 7.5, GRAY, "c")
    # two pillars
    colw = 78
    lx = w * 0.06; rx = w - w * 0.06 - colw
    for x, title, sub, base in [
        (lx, "PLANO PRIVADO", "operadora que nega", "Lei 9.656/98  ·  CDC"),
        (rx, "SUS / ESTADO", "fila que não anda", "Art. 196 da Constituição"),
    ]:
        _card(c, x, h * 0.28, colw, h * 0.5, fill=CARD, stroke=LINE, accent=GOLD, r=6)
        ic_building(c, x + colw / 2 - 13, h * 0.55, 26, h * 0.16, col=NAVY, lw=1.8)
        _txt(c, x + colw / 2, h * 0.48, title, SANB, 8.5, NAVY, "c")
        _txt(c, x + colw / 2, h * 0.40, sub, SANS, 7.8, GRAY, "c")
        _txt(c, x + colw / 2, h * 0.31, base, SANS, 7, GOLD, "c")
        # connector from patient
        cxp = x + colw / 2
        c.setStrokeColor(GOLD); c.setLineWidth(1.6); c.setDash(2, 2)
        c.line(midx + (28 if x > midx else -28), h * 0.5, cxp, h * 0.53)
        c.setDash()
    # bracket bottom
    _txt(c, midx, h * 0.15, "mesma dor  ·  mesma urgência  ·  mesma liminar (art. 300, CPC)",
         SANI if False else SANB, 8, NAVY, "c")
    _txt(c, midx, h * 0.06, "só muda quem está do outro lado do balcão", SERI, 9.5, GRAY, "c")

SANI = SANS

def art_persona(c, w, h):
    """três colunas: quem contrata é a família"""
    cols = [
        ("mãe", "criança com TEA", "child"),
        ("filho / filha", "pai ou mãe idosos", "elder"),
        ("cônjuge", "adulto em tratamento", "adult"),
    ]
    cw = w / 3
    for i, (who, care, kind) in enumerate(cols):
        cx = cw * i + cw / 2
        # decision-maker (front) + patient (behind, faded)
        c.setFillColor(HexColor("#E7DECB"))
        c.circle(cx + 13, h * 0.62, 12, stroke=0, fill=1)  # patient shadow head
        if kind == "child":
            ic_child(c, cx + 13, h * 0.55, 15, col=HexColor("#C7BCA2"))
        else:
            ic_person(c, cx + 13, h * 0.5, 15, col=HexColor("#C7BCA2"))
        ic_person(c, cx - 8, h * 0.5, 20, col=NAVY)   # decision maker
        _txt(c, cx, h * 0.24, who.upper(), SANB, 8.5, NAVY, "c")
        _txt(c, cx, h * 0.15, "cuida de " + care, SANS, 7.8, GRAY, "c")
        if i < 2:
            c.setStrokeColor(LINE); c.setLineWidth(1)
            c.line(cw * (i + 1), h * 0.15, cw * (i + 1), h * 0.8)

def art_scale(c, w, h):
    """balança: mensalidade do plano  vs  honorário que obriga a entregar"""
    midx = w / 2; topy = h * 0.90; base_y = h * 0.34
    # post + base
    c.setStrokeColor(NAVY); c.setLineWidth(3)
    c.line(midx, base_y, midx, topy)
    c.setLineWidth(2); c.line(midx - 20, base_y, midx + 20, base_y)
    c.setFillColor(NAVY); c.circle(midx, topy, 4, stroke=0, fill=1)
    # beam: right pan lower (honorário = mais valor)
    half = w * 0.30; tilt = 8
    lxp, lyp = midx - half, topy - 2 + tilt
    rxp, ryp = midx + half, topy - 2 - tilt
    c.setLineWidth(3); c.line(lxp, lyp, rxp, ryp)
    labely = min(lyp, ryp) - 42
    def pan(px, py, tone, title, lines):
        c.setStrokeColor(NAVY); c.setLineWidth(1.3)
        c.line(px, py, px - 18, py - 22); c.line(px, py, px + 18, py - 22)
        c.setStrokeColor(tone); c.setLineWidth(2.6)
        c.arc(px - 20, py - 34, px + 20, py - 14, 200, 140)
        _txt(c, px, labely, title, SANB, 8.5, NAVY, "c")
        yy = labely - 12
        for ln in lines:
            _txt(c, px, yy, ln, SANS, 7.6, GRAY, "c"); yy -= 10
    pan(lxp, lyp, HexColor("#B4A98F"), "MENSALIDADE DO PLANO",
        ["todo mês, pra sempre", "e ainda pode negar"])
    pan(rxp, ryp, GOLD, "HONORÁRIO",
        ["uma vez, quando precisa", "e obriga a entregar"])
    _txt(c, midx, h * 0.03,
         "o cliente não compra uma petição — compra a certeza do tratamento",
         SERI, 9.5, NAVY2, "c")

def art_timeline(c, w, h):
    phases = [
        ("DIAS 1–30", "Perfil no ar",
         ["Bio, foto e destaques", "3 posts fixados", "Frente: plano privado",
          "Copy ajustada e ética"]),
        ("DIAS 31–60", "Abre a frente SUS",
         ["Mesmo funil, criativo novo", "Campanha p/ mães (TEA)", "Primeiros números",
          "Gratuidade de justiça"]),
        ("DIAS 61–90", "Melhor idade + escala",
         ["Público idoso/família", "Dobrar no que converteu", "Ler custo por conversa",
          "Decidir onde investir"]),
    ]
    n = len(phases); seg = w / n; liney = h - 30
    c.setStrokeColor(LINE2); c.setLineWidth(2)
    c.line(seg * 0.5, liney, seg * (n - 0.5), liney)
    for i, (tag, title, items) in enumerate(phases):
        cx = seg * i + seg * 0.5
        c.setFillColor(GOLD); c.circle(cx, liney, 6, stroke=0, fill=1)
        c.setFillColor(CREAM); c.circle(cx, liney, 2.4, stroke=0, fill=1)
        _txt(c, cx, liney + 12, tag, SANB, 8, GOLD, "c")
        _card(c, seg * i + 8, 6, seg - 16, liney - 22, fill=CARD, stroke=LINE, r=6)
        _txt(c, cx, liney - 30, title, SERB, 12, NAVY, "c")
        yy = liney - 48
        for it in items:
            c.setFillColor(GOLD); c.circle(seg * i + 20, yy + 3, 1.8, stroke=0, fill=1)
            _txt(c, seg * i + 26, yy, it, SANS, 8.2, INK, "l"); yy -= 15

def art_socialrow(c, w, h):
    items = [("sem rosto", "ic_person"), ("base legal", "ic_gavel"),
             ("uma mensagem só", "ic_shield"), ("seu ok em tudo", "ic_check")]
    cw = w / 4
    for i, (lbl, ic) in enumerate(items):
        cx = cw * i + cw / 2; cy = h * 0.62
        c.setFillColor(HexColor("#F0E7D6")); c.circle(cx, cy, 20, stroke=0, fill=1)
        if ic == "ic_person": ic_person(c, cx, cy - 4, 13, col=NAVY, lw=2)
        elif ic == "ic_gavel": ic_gavel(c, cx, cy, 12, col=NAVY, lw=2)
        elif ic == "ic_shield": ic_shield(c, cx, cy + 6, 12, col=NAVY, lw=2)
        else: ic_check(c, cx, cy, 12, col=GOLD, lw=3)
        _txt(c, cx, h * 0.14, lbl, SANB, 8.5, NAVY, "c")

# ---------------------------------------------------------------- composite blocks
def stat_row(items):
    cells = []
    cw = (FW - (len(items) - 1) * 5 * mm) / len(items)
    for big, lbl in items:
        inner = Table([[Paragraph(big, ST["disp2"])],
                       [Paragraph(lbl, ST["small"])]], colWidths=[cw])
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD),
            ("LINEBELOW", (0, 0), (-1, 0), 0, CARD),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, 0), 11),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 1),
            ("TOPPADDING", (0, 1), (-1, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 12),
            ("LINEBEFORE", (0, 0), (0, -1), 2.5, GOLD),
        ]))
        cells.append(inner)
    gaps = []
    row = []
    for i, cell in enumerate(cells):
        row.append(cell)
    t = Table([row], colWidths=[cw + 5 * mm if i < len(cells) - 1 else cw
                                for i in range(len(cells))])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-2, -1), 5 * mm),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t

def front_block(kick, title, intro, treatments, hook, icon):
    """bloco editorial grande para os públicos criança / idoso"""
    def draw_icon(c, w, h):
        c.setFillColor(NAVY); c.roundRect(0, 0, w, h, 8, stroke=0, fill=1)
        cx, cy = w / 2, h / 2
        if icon == "child":
            ic_child(c, cx, cy - 3, 20, col=WHITE, lw=2.4)
        else:
            ic_person(c, cx, cy - 3, 24, col=WHITE, lw=2.4)
        ic_pluscross(c, cx + 15, cy + 14, 8, col=GOLD)
    left = art(draw_icon, 74, w=64)
    treat_tbl = Table([[Paragraph("<b>O que costuma ser negado:</b> " + treatments,
                                   ST["cardb"])]], colWidths=[FW - 64 - 10])
    treat_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F0E7D6")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    right = [Paragraph(sp(kick), ST["cardk"]), Spacer(1, 2),
             Paragraph(title, ST["cardh"]), Spacer(1, 3),
             Paragraph(intro, ST["cardb"]), Spacer(1, 5),
             treat_tbl, Spacer(1, 5),
             Paragraph("<i>" + hook + "</i>", ST["small"])]
    t = Table([[left, right]], colWidths=[64, FW - 64])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (0, 0), "TOP"), ("VALIGN", (1, 0), (1, 0), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0), ("RIGHTPADDING", (0, 0), (0, 0), 10),
        ("LEFTPADDING", (1, 0), (1, 0), 0), ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t

def pull_navy(txt):
    inner = Table([[Paragraph(txt, ST["pullw"])]], colWidths=[FW])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 18), ("RIGHTPADDING", (0, 0), (-1, -1), 18),
        ("TOPPADDING", (0, 0), (-1, -1), 14), ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
    ]))
    return inner

def note_gold(title, body):
    inner = Table([[Paragraph("<b>" + title + "</b>  " + body, ST["small"])]],
                  colWidths=[FW])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F4EEE1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, GOLD),
    ]))
    return inner

# ================================================================ page furniture
def bg_cream(c, doc):
    c.setFillColor(CREAM); c.rect(0, 0, W, Hh, stroke=0, fill=1)
    # faint monogram bottom-right
    try:
        c.drawImage(A("vgj_mono_faint.png"), W - 62 * mm, -8 * mm, width=70 * mm,
                    height=73 * mm, preserveAspectRatio=True, mask='auto')
    except Exception: pass
    # header
    try:
        c.drawImage(A("vgj_navy.png"), L, Hh - 15 * mm, width=34 * mm, height=9.8 * mm,
                    preserveAspectRatio=True, mask='auto')
    except Exception: pass
    c.setStrokeColor(GOLD); c.setLineWidth(0.8)
    c.line(L, Hh - 17 * mm, W - R, Hh - 17 * mm)
    _txt(c, W - R, Hh - 14.5 * mm, "ESTRATÉGIA · SAÚDE", SANB, 7, GOLD, "r")
    # footer
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    c.line(L, 13 * mm, W - R, 13 * mm)
    _txt(c, L, 9 * mm, "Vilmar Guimarães Júnior · Advocacia", SANS, 7.2, GRAY, "l")
    _txt(c, W - R, 9 * mm, "%02d" % doc.page, SANB, 8, NAVY, "r")

def bg_navy(c, doc):
    c.setFillColor(NAVY); c.rect(0, 0, W, Hh, stroke=0, fill=1)
    c.setFillColor(NAVY2); c.rect(0, 0, W, 6 * mm, stroke=0, fill=1)
    c.setFillColor(GOLD); c.rect(0, Hh - 5 * mm, W, 5 * mm, stroke=0, fill=1)
    try:
        c.drawImage(A("vgj_mono_faintw.png"), W - 70 * mm, 12 * mm, width=78 * mm,
                    height=82 * mm, preserveAspectRatio=True, mask='auto')
    except Exception: pass

def bg_cover(c, doc):
    bg_navy(c, doc)
    try:
        c.drawImage(A("vgj_white.png"), L, Hh - 44 * mm, width=52 * mm, height=15 * mm,
                    preserveAspectRatio=True, mask='auto')
    except Exception: pass

# ================================================================ document
doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=L, rightMargin=R,
                      topMargin=24 * mm, bottomMargin=BOT,
                      title="VGJ · Estratégia em Saúde — Proposta",
                      author="Vilmar Guimarães Júnior Advocacia")
fr_content = Frame(L, BOT, FW, Hh - 24 * mm - BOT, id="c")
fr_dark = Frame(L, 14 * mm, FW, Hh - 30 * mm, id="d")
fr_cover = Frame(L, 30 * mm, FW, Hh - 78 * mm, id="cov")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[fr_cover], onPage=bg_cover),
    PageTemplate(id="content", frames=[fr_content], onPage=bg_cream),
    PageTemplate(id="dark", frames=[fr_dark], onPage=bg_navy),
])

def sec(kick, title, style="disp"):
    return [Paragraph(sp(kick), ST["kick"]), Spacer(1, 2),
            Paragraph(title, ST[style]), Spacer(1, 4)]

E = []

# ---------------------------------------------------------------- CAPA
E += [
    Spacer(1, 6 * mm),
    Paragraph(sp("VILMAR GUIMARÃES JÚNIOR · ADVOCACIA EM SAÚDE"), ST["cov_k"]),
    Spacer(1, 16 * mm),
    Paragraph("O advogado<br/>que vira<br/>plano de saúde", ST["cov_t"]),
    Spacer(1, 10 * mm),
    Paragraph("Uma proposta de posicionamento, público e estratégia — pensada pro seu "
              "jeito de atuar. Não é o material da agência; é o que eu acho que a gente "
              "consegue fazer com ele, e um pouco além.", ST["cov_s"]),
    Spacer(1, 20 * mm),
    Paragraph("ESCRITO PARA VILMAR &nbsp;·&nbsp; JULHO DE 2026 &nbsp;·&nbsp; "
              "DOCUMENTO INTERNO E CONFIDENCIAL", ST["cov_m"]),
    NextPageTemplate("content"),
    PageBreak(),
]

# ---------------------------------------------------------------- CARTA
E += [
    Spacer(1, 4 * mm),
    Paragraph(sp("ANTES DE TUDO"), ST["kick"]), Spacer(1, 2),
    Paragraph("Vilmar,", ST["disp"]),
    Paragraph("Recebi o material da agência e passei alguns dias com ele na cabeça. "
              "A estratégia deles é boa — o diagnóstico de competir em <b>velocidade</b>, "
              "e não em quem sabe mais direito, está certíssimo. Mas ficaram três coisas "
              "me incomodando, e nenhuma delas está no PDF que mandaram. Resolvi escrever "
              "do meu jeito, sem juridiquês e sem aquele tom de agência, pra você bater "
              "o olho e me dizer se faz sentido.", ST["bodyj"]),
    Paragraph("A <b>primeira</b> é sobre com quem a gente fala de verdade — e não é com "
              "o doente. A <b>segunda</b> é sobre onde a briga acontece, porque limitar "
              "tudo a “plano de saúde” está deixando dinheiro na mesa: contra o SUS "
              "funciona igual. A <b>terceira</b> é sobre a entrada, o dinheiro — e é aí "
              "que eu acho que mora o pulo do gato do seu escritório.", ST["bodyj"]),
    Paragraph("Costurei as três numa ideia só, que dá título a essa proposta. Lê com "
              "calma. No fim eu te digo, em quatro linhas, o que preciso de você pra "
              "isso sair do papel.", ST["bodyj"]),
    Spacer(1, 6 * mm),
    Paragraph("— e sim, tudo aqui cabe dentro da ética da OAB. Já pensei nisso por você.",
              ST["small"]),
    Spacer(1, 3 * mm),
    Paragraph("A gente resolve isso juntos.", ST["sig"]),
    Paragraph(sp("ESTRATÉGIA & POSICIONAMENTO"), ST["kick"]),
    PageBreak(),
]

# ---------------------------------------------------------------- BIG IDEA
E += sec("A IDEIA EM UMA FRASE", "Pra quem não tem plano,<br/>você vira o plano.")
E += [
    Paragraph("A maioria das pessoas que precisa de um tratamento caro não tem plano "
              "de saúde — ou tem um que nega na hora H. Quando o tratamento é negado, "
              "seja pela operadora, seja pela fila do SUS, alguém precisa entrar e "
              "obrigar o sistema a entregar. Esse alguém é você.", ST["bodyj"]),
    Paragraph("O cliente não está comprando uma petição. Está comprando a <b>certeza de "
              "que o tratamento vai acontecer</b> — que é exatamente o que um plano "
              "deveria fazer e não faz. Se ele te contrata quando precisa e você faz o "
              "tratamento sair, na prática, na hora que mais importa, você foi o plano "
              "de saúde dele. Melhor: um que cumpre.", ST["bodyj"]),
    Spacer(1, 3 * mm),
    art(art_reframe, 92),
    Spacer(1, 2 * mm),
    Paragraph("Da esquerda pra direita: o plano que nega (ou que a pessoa nem tem) sai "
              "de cena; entra você; e o que o cliente leva pra casa é o tratamento "
              "liberado. É essa a promessa — de processo e de presença, nunca de "
              "resultado garantido.", ST["cap"]),
    PageBreak(),
]

# ---------------------------------------------------------------- SUS / DUAS FRENTES
E += sec("ONDE A BRIGA ACONTECE", "Parar de mirar só no plano")
E += [
    Paragraph("A agência montou tudo mirando a operadora de plano. O problema é de "
              "tamanho de mercado: cerca de <b>7 em cada 10 brasileiros não têm plano</b> "
              "e dependem do SUS. E o SUS nega igual — medicamento de alto custo, "
              "cirurgia, vaga de UTI, terapia que “não está na tabela”. A dor é a mesma; "
              "muda só quem está do outro lado do balcão.", ST["bodyj"]),
    Paragraph("Contra o Estado, a base é o <b>art. 196 da Constituição</b> (saúde é "
              "direito de todos e dever do Estado). Contra o plano, é a Lei 9.656/98 e "
              "o Código de Defesa do Consumidor. A ferramenta que destrava os dois é a "
              "mesma: a <b>tutela de urgência do art. 300 do CPC</b>. Ou seja — a mesma "
              "competência que você já tem, mirando o dobro de gente.", ST["bodyj"]),
    Spacer(1, 2 * mm),
    art(art_twofronts, 150),
    Spacer(1, 4 * mm),
    stat_row([("≈ 7 em 10", "brasileiros dependem do SUS, não de plano"),
              ("Art. 196", "a Constituição obriga o Estado a dar saúde"),
              ("Art. 300", "a mesma liminar vale nas duas frentes")]),
    PageBreak(),
]

# ---------------------------------------------------------------- PERSONAS
E += sec("QUEM REALMENTE CONTRATA", "Quem liga quase nunca<br/>é o próprio paciente")
E += [
    Paragraph("Essa é a virada de chave do público. Na saúde, quem procura o advogado, "
              "decide e paga quase nunca é o doente — é a <b>família</b>. É a mãe da "
              "criança, a filha do idoso, o marido desesperado. Gente movida por amor e "
              "por culpa, não por tabela de preço.", ST["bodyj"]),
    Spacer(1, 2 * mm),
    art(art_persona, 118),
    Spacer(1, 3 * mm),
    Paragraph("Isso muda o anúncio inteiro: a gente fala com <b>quem cuida</b>, não com "
              "quem está doente. E cuidador com medo de perder alguém não pesquisa "
              "preço — pesquisa quem resolve rápido. É o cliente menos sensível a valor "
              "que existe, e é justamente o que a mensagem de urgência atrai.", ST["bodyj"]),
    Spacer(1, 2 * mm),
    pull_navy("“Quanto custa?” é a segunda pergunta de quem tem medo. A primeira é "
              "“você consegue resolver?”. Responda a primeira e a segunda perde a força."),
    PageBreak(),
]

# ---------------------------------------------------------------- DOIS PÚBLICOS
E += sec("OS DOIS PÚBLICOS QUE NINGUÉM PEGA DIREITO",
         "A criança e a melhor idade")
E += [
    Paragraph("Dentro dessa lógica de família, dois públicos estão órfãos de um "
              "advogado que fale com eles — e são os mais recorrentes e emocionais que "
              "existem. Eu apostaria as fichas aqui.", ST["bodyj"]),
    Spacer(1, 3 * mm),
    front_block(
        "PÚBLICO 01 · A CRIANÇA", "A criança que precisa de terapia",
        "O autismo (TEA) virou uma das maiores demandas de saúde do país — estimativas "
        "internacionais falam em cerca de 1 criança a cada 36. Plano e SUS negam ou "
        "cortam a carga horária de terapia que o médico pediu, e cada mês perdido é "
        "desenvolvimento que não volta. A mãe entra em pânico — e vira sua melhor "
        "propaganda no grupo de outras mães.",
        "terapia ABA, fonoaudiologia, terapia ocupacional, psicopedagogia, acompanhante "
        "terapêutico na escola, canabidiol e as horas de terapia negadas pelo plano.",
        "É recorrente, é emocional e se espalha boca a boca como nenhum outro nicho.",
        "child"),
    Spacer(1, 5 * mm),
    front_block(
        "PÚBLICO 02 · A MELHOR IDADE", "O idoso que o sistema deixa esperando",
        "Do outro lado da vida, a mesma cena. A família não aceita ver o pai ou a mãe "
        "na fila enquanto a saúde piora. Aqui a urgência é literal, e o Estatuto do "
        "Idoso ainda dá prioridade na tramitação — a liminar sai mais rápido.",
        "home care e internação domiciliar, medicamento oncológico e de alto custo, "
        "cirurgia negada “por idade” ou “fora do rol”, fisioterapia, fraldas e insumos, "
        "cuidador.",
        "Decisão movida por amor de filho, com prioridade legal de quem já tem idade.",
        "elder"),
    PageBreak(),
]

# ---------------------------------------------------------------- FINANCEIRO
E += sec("O PULO DO GATO É NO DINHEIRO", "Tirar o medo da entrada")
E += [
    Paragraph("A maior objeção nunca é o valor do honorário. É o medo: <i>“e se eu "
              "pagar e não der certo?”</i>. Com o público do SUS, esse medo cai sozinho "
              "— e é aí que está a sua vantagem. Quem depende do SUS <b>já não paga "
              "plano nenhum</b>. O dinheiro que iria pra uma mensalidade que nega está "
              "livre. Reposiciona o honorário como o que ele é de verdade: o melhor "
              "investimento em saúde que essa família pode fazer.", ST["bodyj"]),
    Paragraph("Mais barato que um ano de plano — e esse aqui entrega. Para o cliente do "
              "SUS, ainda tem a <b>gratuidade de justiça</b>, que derruba as custas do "
              "processo: o honorário passa a ser o único gasto, e em troca ele compra a "
              "certeza do tratamento. A entrada deixa de ser um custo assustador e vira "
              "a coisa mais óbvia do mundo.", ST["bodyj"]),
    Spacer(1, 2 * mm),
    art(art_scale, 168),
    Spacer(1, 3 * mm),
    note_gold("Sobre a ética:",
              "isso é reposicionamento de valor percebido, não promessa de ganho. "
              "Nada de “recupero seu dinheiro” ou “ganho garantido”. A gente vende "
              "presença, rapidez e método — o desfecho é sempre da Justiça, e cada peça "
              "passa pelo seu ok."),
    PageBreak(),
]

# ---------------------------------------------------------------- SOCIAL
E += sec("COMO ISSO APARECE — DO SEU JEITO", "Autoridade sem aparecer")
E += [
    Paragraph("Eu sei que você não curte aparecer, e quero que fique tranquilo: nesse "
              "nicho, isso é <b>vantagem</b>, não limitação. Quem está com um filho "
              "doente não quer ver advogado dançando trend. Quer ver alguém sério que "
              "entende a lei e vai agir. Discrição, aqui, lê como seriedade.", ST["bodyj"]),
    Paragraph("Então a comunicação não depende da sua cara: <b>reels de texto sem "
              "rosto</b>, cards que explicam direitos, a base legal sempre citada. Sua "
              "imagem aparece uma única vez — séria, na foto de perfil — e pronto. É a "
              "repetição da mesma mensagem que constrói a autoridade que a exposição "
              "construiria em outro tipo de advogado. E, como sempre, nada vai ao ar "
              "sem o seu ok: na OAB, quem responde pela publicidade é você.", ST["bodyj"]),
    Spacer(1, 3 * mm),
    art(art_socialrow, 92),
    PageBreak(),
]

# ---------------------------------------------------------------- 90 DIAS
E += sec("O CAMINHO", "90 dias, três frentes")
E += [
    Paragraph("Nada de virar tudo de uma vez. A gente prova o modelo em etapas, com os "
              "mesmos R$ 500 que a agência já planejou, abrindo uma frente nova a cada "
              "mês e mantendo só o que der resultado.", ST["bodyj"]),
    Spacer(1, 3 * mm),
    art(art_timeline, 150),
    Spacer(1, 4 * mm),
    Paragraph("O objetivo dos 90 dias não é escalar. É <b>provar</b>, com o menor "
              "investimento possível, que o protocolo funciona nas duas frentes (plano "
              "e SUS) e nos dois públicos (criança e idoso) — e então saber, com número "
              "na mão, onde vale a pena colocar mais verba.", ST["bodyj"]),
]

# ---------------------------------------------------------------- FECHAMENTO (navy)
E += [NextPageTemplate("dark"), PageBreak()]
E += [
    Spacer(1, 8 * mm),
    Paragraph(sp("PRA COMEÇAR"), ST["kickw"]), Spacer(1, 3),
    Paragraph("O que eu preciso de você", ST["dk_h"]),
    Spacer(1, 6 * mm),
    Paragraph("São quatro coisas, e nenhuma toma seu dia:", ST["dk_b"]),
    Spacer(1, 3 * mm),
    Paragraph("<b>1.</b>&nbsp;&nbsp;Seu número da OAB, pra estampar em perfil e "
              "criativos — é o que dá seriedade e cumpre a identificação da publicidade.",
              ST["dk_b"]),
    Paragraph("<b>2.</b>&nbsp;&nbsp;Três casos antigos, anonimizados, pra eu entender "
              "os melhores gatilhos e os erros que a família mais comete.", ST["dk_b"]),
    Paragraph("<b>3.</b>&nbsp;&nbsp;Seu ok pra eu conversar com a agência sobre abrir a "
              "frente do SUS e os públicos criança e idoso — sem isso eles seguem "
              "mirando só plano.", ST["dk_b"]),
    Paragraph("<b>4.</b>&nbsp;&nbsp;Meia hora sua pra a gente alinhar o tom. O resto "
              "eu toco e te trago pronto pra validar.", ST["dk_b"]),
    Spacer(1, 8 * mm),
    Paragraph("Se você topar, em 90 dias a gente sabe exatamente que tipo de advogado "
              "de saúde o mercado da região está procurando — e você vai estar sendo o "
              "plano de saúde de quem nunca teve um.", ST["pullw"]),
    Spacer(1, 8 * mm),
    Paragraph("Bora?", ST["dk_h"]),
]

doc.build(E)
print("OK:", OUT)
