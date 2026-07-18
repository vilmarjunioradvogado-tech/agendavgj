# -*- coding: utf-8 -*-
"""Gera a versão COMENTADA do dossiê da agência: conteúdo original preservado,
com caixas de observação do escritório nos pontos de ajuste."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, NextPageTemplate, PageBreak,
)

NAVY = HexColor("#10233F")
RED = HexColor("#C0392B")
INK = HexColor("#2B3440")
GRAY = HexColor("#5A6572")
BG = HexColor("#F2F4F7")
LINE = HexColor("#D8DDE3")
NOTE_BG = HexColor("#FFF6DF")
NOTE_BD = HexColor("#D9A21B")
NOTE_TAG = HexColor("#8A6510")

W, H = A4
MARGIN = 18 * mm
OUT = "Protocolo_Emergencial_de_Saude_COMENTADO.pdf"

def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.5, leading=14, textColor=INK,
                alignment=TA_LEFT, spaceAfter=0, spaceBefore=0)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    "label":    st("label", fontName="Helvetica-Bold", fontSize=8, leading=11,
                   textColor=RED),
    "h1":       st("h1", fontName="Helvetica-Bold", fontSize=21, leading=25,
                   textColor=NAVY, spaceBefore=4, spaceAfter=10),
    "body":     st("body", spaceAfter=8),
    "box_tag":  st("box_tag", fontName="Helvetica-Bold", fontSize=7.5, leading=10,
                   textColor=RED),
    "note_tag": st("note_tag", fontName="Helvetica-Bold", fontSize=7.5, leading=10,
                   textColor=NOTE_TAG),
    "box_h":    st("box_h", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                   textColor=NAVY),
    "box_b":    st("box_b", fontSize=9, leading=13, textColor=INK),
    "quote":    st("quote", fontName="Helvetica-BoldOblique", fontSize=11.5,
                   leading=16.5, textColor=white),
    "note":     st("note", fontSize=8.5, leading=12.5, textColor=GRAY),
    "cell_b":   st("cell_b", fontSize=8.5, leading=12, textColor=INK),
    "cov_kick": st("cov_kick", fontName="Helvetica-Bold", fontSize=9, leading=13,
                   textColor=HexColor("#9FB2CC")),
    "cov_t":    st("cov_t", fontName="Helvetica-Bold", fontSize=38, leading=42,
                   textColor=white),
    "cov_sub":  st("cov_sub", fontSize=12, leading=18, textColor=HexColor("#C9D4E4")),
    "cov_meta": st("cov_meta", fontSize=10, leading=17, textColor=HexColor("#E3EAF3")),
}

def spaced(txt):
    return "   ".join(" ".join(w) for w in txt.split())

def label(txt):
    return Paragraph(spaced(txt).upper(), S["label"])

def box(tag, title, body, bg=BG, border=RED, tagstyle="box_tag"):
    rows = []
    if tag:
        rows.append([Paragraph(spaced(tag).upper(), S[tagstyle])])
    if title:
        rows.append([Paragraph(title, S["box_h"])])
    rows.append([Paragraph(body, S["box_b"])])
    t = Table(rows, colWidths=[W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, 0), 9),
        ("TOPPADDING", (0, 1), (-1, -1), 2),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
    ]))
    return t

def note(body, title=None):
    return box("OBSERVAÇÃO DO ESCRITÓRIO", title, body,
               bg=NOTE_BG, border=NOTE_BD, tagstyle="note_tag")

def two_boxes(items):
    cw = (W - 2 * MARGIN - 6 * mm) / 2
    cells = []
    for tag, title, body in items:
        inner = Table(
            [[Paragraph(spaced(tag).upper(), S["box_tag"])],
             [Paragraph(title, S["box_h"])],
             [Paragraph(body, S["box_b"])]],
            colWidths=[cw])
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG),
            ("LINEBEFORE", (0, 0), (0, -1), 2.5, RED),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, 0), 9),
            ("TOPPADDING", (0, 1), (-1, -1), 2),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[cw + 3 * mm, cw + 3 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (-1, 0), (-1, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 6 * mm),
        ("RIGHTPADDING", (0, 0), (0, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t

def quote(txt):
    t = Table([[Paragraph(txt, S["quote"])]], colWidths=[W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
    ]))
    return t

def rule_table(header, rows, widths):
    data = [[Paragraph(spaced(h).upper(), S["box_tag"]) for h in header]]
    for r in rows:
        data.append([Paragraph(c, S["cell_b"]) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 1, NAVY),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t

def sec(num, name, title):
    return [label(f"PROCESSO Nº {num} — {name}"),
            Spacer(1, 2 * mm),
            Paragraph(title, S["h1"])]

def gap(h=5):
    return Spacer(1, h * mm)

def on_cover(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    canv.setFillColor(NOTE_BD)
    canv.rect(0, H - 6 * mm, W, 6 * mm, stroke=0, fill=1)
    canv.setStrokeColor(HexColor("#2A4568"))
    canv.setLineWidth(0.75)
    canv.circle(W - 38 * mm, 46 * mm, 21 * mm, stroke=1, fill=0)
    canv.setFillColor(HexColor("#9FB2CC"))
    canv.setFont("Helvetica-Bold", 7)
    canv.drawCentredString(W - 38 * mm, 50 * mm, "PROTOCOLO EMERGENCIAL")
    canv.drawCentredString(W - 38 * mm, 44 * mm, "Nº 001 · VERSÃO COMENTADA")
    canv.drawCentredString(W - 38 * mm, 38 * mm, "SAÚDE SUPLEMENTAR")
    canv.restoreState()

def on_page(canv, doc):
    canv.saveState()
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.6)
    canv.line(MARGIN, 14 * mm, W - MARGIN, 14 * mm)
    canv.setFont("Helvetica-Bold", 7)
    canv.setFillColor(GRAY)
    canv.drawString(MARGIN, 9.5 * mm,
                    "PROTOCOLO EMERGENCIAL DE SAÚDE · VERSÃO COMENTADA PELO ESCRITÓRIO")
    canv.drawRightString(W - MARGIN, 9.5 * mm, "PÁG. %02d" % doc.page)
    canv.setFillColor(NOTE_BD)
    canv.rect(0, H - 4 * mm, W, 4 * mm, stroke=0, fill=1)
    canv.restoreState()

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=16 * mm, bottomMargin=20 * mm,
                      title="Protocolo Emergencial de Saúde — Versão Comentada",
                      author="Vilmar Junior Advocacia")
frame = Frame(MARGIN, 20 * mm, W - 2 * MARGIN, H - 36 * mm, id="f")
cov_frame = Frame(MARGIN, 20 * mm, W - 2 * MARGIN, H - 44 * mm, id="cov")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[cov_frame], onPage=on_cover),
    PageTemplate(id="content", frames=[frame], onPage=on_page),
])

E = []

# ---------------------------------------------------------------- CAPA
E += [
    Spacer(1, 10 * mm),
    Paragraph(spaced("DOSSIÊ DE POSICIONAMENTO & TRÁFEGO"), S["cov_kick"]),
    Spacer(1, 3 * mm),
    Paragraph(spaced("VERSÃO COMENTADA — OBSERVAÇÕES DO ESCRITÓRIO EM AMARELO"),
              st("k2", fontName="Helvetica-Bold", fontSize=8, leading=11,
                 textColor=NOTE_BD)),
    Spacer(1, 12 * mm),
    Paragraph("Protocolo<br/>Emergencial<br/>de Saúde", S["cov_t"]),
    Spacer(1, 9 * mm),
    Paragraph("Enquanto o plano nega e a ANS demora, alguém precisa correr contra o "
              "tempo. Esse alguém é você.", S["cov_sub"]),
    Spacer(1, 12 * mm),
    Paragraph("<b>Cliente</b> — Vilmar Junior · Advocacia em Direito à Saúde<br/>"
              "<b>Escopo</b> — Posicionamento de Instagram + Estratégia de Tráfego<br/>"
              "<b>Investimento inicial</b> — R$ 500,00<br/>"
              "<b>Data</b> — Julho de 2026", S["cov_meta"]),
    Spacer(1, 10 * mm),
    Paragraph("<b>Como ler este documento:</b> o material de vocês foi mantido como "
              "está — a estratégia foi aprovada. As caixas amarelas marcam os pontos "
              "onde o escritório pede pra trabalhar de um jeito específico, com a "
              "explicação do porquê em cada uma.", S["cov_sub"]),
    NextPageTemplate("content"),
    PageBreak(),
]

# ---------------------------------------------------------------- 01 DIAGNÓSTICO
E += sec("01", "DIAGNÓSTICO", "O problema não é a negativa.<br/>É o tempo.")
E += [
    Paragraph("Todo paciente que tem um procedimento, exame ou medicamento de alto custo "
              "negado passa pela mesma sequência: liga pra operadora, abre reclamação na "
              "ANS, espera. E nessa espera, o tratamento não acontece.", S["body"]),
    gap(2),
    two_boxes([
        ("PROBLEMA CENTRAL", "A negativa",
         "O paciente não sabe que a maioria das negativas de plano de saúde é ilegal, "
         "e que existe caminho jurídico pra reverter em dias, não em meses."),
        ("PROBLEMA SOFISTICADO", "O tempo perdido",
         "Mesmo quem procura ajuda cai em canais lentos (ANS, operadora) ou advogado "
         "generalista que não sabe pedir liminar a tempo. O quadro de saúde piora "
         "enquanto o processo tramita."),
    ]),
    gap(4),
    Paragraph("<b>Por que isso muda o posicionamento:</b> o mercado de advocacia em "
              "saúde compete em conhecimento jurídico. Nós vamos competir em "
              "velocidade. É isso que faz o cliente pagar bem e pagar rápido: a "
              "certeza de que alguém vai agir antes que seja tarde.", S["body"]),
    gap(2),
    quote("“Direito à saúde não tem fila de espera administrativa. Tem prazo legal, "
          "e ele é curto.”"),
    gap(4),
    note("O diagnóstico está certeiro e a tese de competir em velocidade fica "
         "aprovada — é exatamente o que diferencia. Só um ajuste de régua que vale "
         "pra tudo daqui pra frente: o Dr. Vilmar atua estritamente dentro do Código "
         "de Ética e do Provimento 205/2021 da OAB, e é ele quem responde pela "
         "publicidade perante a Ordem. Então frases como <b>\"reverter em dias\"</b> "
         "precisam virar método e prioridade de análise, nunca promessa de desfecho. "
         "O jeito dele de trabalhar é informar com base legal — a urgência continua, "
         "a garantia sai.", title="Aprovado — com uma régua pra toda a copy"),
    PageBreak(),
]

# ---------------------------------------------------------------- 02 POSICIONAMENTO
E += sec("02", "POSICIONAMENTO", "O discurso que atrai<br/>quem já está frustrado")
E += [
    rule_table(
        ["Nº", "ELEMENTO", "DEFINIÇÃO"],
        [
            ["01", "<b>Público</b>",
             "Pessoas com procedimento, cirurgia, exame ou medicamento de alto custo "
             "negado por plano de saúde. Já tentaram resolver sozinhas e não conseguiram."],
            ["02", "<b>Soluções comuns do mercado</b>",
             "Reclamar direto na operadora ou na ANS. Procurar advogado generalista. "
             "Pagar o procedimento do próprio bolso."],
            ["03", "<b>Efeito colateral em comum</b>",
             "Tempo perdido, saúde agravando, dinheiro saindo do bolso, sensação de "
             "estar sozinho contra a operadora."],
        ],
        [10 * mm, 48 * mm, W - 2 * MARGIN - 58 * mm]),
    gap(4),
    box("NOME DO MÉTODO", "Protocolo Emergencial de Saúde",
        "Comunica exatamente o que o cliente precisa sentir: urgência e procedimento. "
        "Não é \"mais um advogado\", é um protocolo a ser seguido quando o tempo é "
        "curto."),
    gap(3),
    box("PROMESSA", None,
        "<b>\"Ajudo quem teve procedimento ou medicamento negado pelo plano de saúde a "
        "buscar a resposta jurídica certa, com agilidade e dentro da lei.\"</b><br/><br/>"
        "Promessa de processo e competência. Sem projeção de resultado financeiro, sem "
        "menção a consulta gratuita — conforme o Código de Ética da OAB."),
    gap(4),
    note("O nome do método é excelente e fica. A promessa também está bem "
         "encaminhada — só trocar <b>\"a resposta jurídica certa\"</b> por <b>\"a "
         "resposta jurídica adequada ao seu caso\"</b>: \"certa\" soa garantia, e ele "
         "evita qualquer palavra nesse tom. Dois acréscimos que são o jeito da banca: "
         "(1) citar a base legal nos conteúdos (tutela de urgência — art. 300 do CPC, "
         "Lei 9.656/98, CDC, Lei 14.454/2022) — quem explica a lei informa, não "
         "promete; (2) deixar claro quem NÃO é o público (curioso sem negativa "
         "formalizada, caso sem urgência), porque a agenda dele é enxuta e o filtro "
         "precisa acontecer na entrada.", title="Ajuste fino na promessa"),
    PageBreak(),
]

# ---------------------------------------------------------------- 03 IDENTIDADE
E += sec("03", "NOVA IDENTIDADE", "O que muda no perfil")
E += [
    box("BIO (PROPOSTA)", None,
        "<b>\"Seu plano negou cirurgia, exame ou remédio de alto custo? Te ajudo a "
        "reverter isso com agilidade jurídica.\"</b><br/><br/>Direção de urgência: fala "
        "direto com quem está numa negativa agora e precisa de resposta rápida. "
        "Alternativa de tom mais técnico disponível se preferir — ajustamos juntos "
        "antes de publicar."),
    gap(3),
    note("Vamos de alternativa mais técnica que vocês mesmos ofereceram — \"te ajudo "
         "a reverter\" projeta desfecho e não é o estilo dele. Sugestão: "
         "<b>\"Advocacia em Direito à Saúde · Negativas de cirurgia, exame e "
         "medicamento de alto custo · Casos urgentes com prioridade de análise · "
         "OAB/BA nº ____\"</b>. E o número da OAB entra na bio e nos criativos — ele "
         "faz questão, além de ser requisito de identificação da publicidade.",
         title="Bio: ficar com a versão técnica"),
    gap(4),
    two_boxes([
        ("FOTO DE PERFIL", "Substituição",
         "Substituição por imagem que comunique autoridade e proximidade — nada de "
         "foto de escritório genérica. Recomendação: retrato direto, fundo neutro, "
         "expressão de confiança."),
        ("DESTAQUE \"COMECE AQUI\"", "Explica o método",
         "Explica o Protocolo Emergencial de Saúde em 3 passos e mostra prova social "
         "— reforça o que os Posts N3 fixados já comunicam no feed."),
    ]),
    gap(4),
    note("Aqui é o ponto mais importante da identidade, e é sobre o perfil pessoal "
         "dele: <b>o Dr. Vilmar é reservado e não costuma se expor nas redes "
         "sociais</b>. Uma única foto institucional sóbria pro perfil, tudo bem — "
         "agora a comunicação do dia a dia <b>não pode depender do rosto dele</b>: "
         "nada de vídeo falando pra câmera, stories pessoais diários ou bastidor com "
         "exposição. A autoridade vem do método, da base legal e da consistência — "
         "não da presença física. Os reels de texto sem rosto que vocês propõem no "
         "Processo 05 encaixam perfeitamente nisso e devem ser o formato principal. "
         "E no destaque, onde está \"prova social\": trocar por conteúdo educativo "
         "(\"Seus direitos\") — ele não expõe caso nem depoimento de cliente, e a "
         "publicidade da OAB também veda.", title="O jeito dele: discrição"),
    gap(3),
    Paragraph("<b>Regra de consistência (mantida):</b> tudo no perfil fala de uma "
              "coisa só — o Protocolo Emergencial de Saúde. Bio, destaque e os 3 "
              "primeiros posts fixados repetem a mesma mensagem de formas diferentes.",
              S["body"]),
    PageBreak(),
]

# ---------------------------------------------------------------- 04 CONTEÚDO
E += sec("04", "CONTEÚDO", "Fase 1: de 6 a 9 posts<br/>pra construir posicionamento")
E += [
    Paragraph("Antes de investir em tráfego, o perfil precisa comunicar o método com "
              "clareza. Três posts fixados carregam o peso da mensagem. Os demais "
              "sustentam e repetem sob ângulos diferentes.", S["body"]),
    gap(2),
    box("POST N3 · 1/3 · FIXADO", "Explica o método",
        "Responde à pergunta que todo visitante tem: \"o que é o Protocolo Emergencial "
        "de Saúde?\" Estrutura o problema, o método e a prova de autoridade."),
    gap(3),
    box("POST N3 · 2/3 · FIXADO", "Mostra a transformação",
        "Pinta o quadro da vida depois da liminar concedida: tratamento retomado, "
        "tempo recuperado, tranquilidade de volta. Gera desejo."),
    gap(3),
    box("POST N3 · 3/3 · FIXADO", "\"Enquanto você espera a ANS resolver...\"",
        "Contrapõe o método à solução comum (esperar a ANS). Atrai quem já está "
        "frustrado e pronto pra agir. Conteúdo completo na página seguinte."),
    gap(4),
    Paragraph("<b>+ 6 posts de sustentação</b> — publicados nas semanas seguintes:",
              S["body"]),
    rule_table(
        ["Nº", "ÂNGULO", "OBJETIVO"],
        [
            ["04", "Case real: da negativa à liminar concedida",
             "Prova social, credibilidade imediata"],
            ["05", "\"3 sinais de que sua negativa é ilegal\"",
             "Educar rápido, gerar identificação"],
            ["06", "Bastidor: como funciona um pedido de urgência",
             "Tangibilizar o método, tirar o mistério"],
            ["07", "Erro comum: esperar resposta da operadora por escrito",
             "Alertar, reforçar a urgência"],
            ["08", "Medicamento de alto custo negado: o que fazer nas primeiras 24h",
             "Conteúdo utilitário, alto valor de salvamento"],
            ["09", "Depoimento ou print de resultado recente",
             "Prova social recorrente"],
        ],
        [10 * mm, 88 * mm, W - 2 * MARGIN - 98 * mm]),
    gap(4),
    note("Três ajustes nesta grade, todos pelo mesmo motivo — ele não trabalha com "
         "exposição de cliente e a publicidade da OAB veda depoimento e print de "
         "resultado como propaganda: <b>Post 04</b> vira caso ilustrativo "
         "<b>anonimizado</b>, contado como etapas do método, sem valores e sem "
         "prometer o mesmo desfecho. <b>Post 05</b>: acrescentar \"pode ser\" — \"3 "
         "sinais de que sua negativa <b>pode ser</b> ilegal\". <b>Post 09</b>: "
         "substituir por \"O que a lei diz sobre negativas\" em linguagem simples — "
         "autoridade recorrente sem expor ninguém. No <b>Post 07</b>, inverter o "
         "ângulo: a negativa por escrito é prova essencial (ele orienta todo cliente "
         "a guardá-la); o erro é esperar <b>sem prazo</b>, não pedir por escrito.",
         title="Posts 04, 05, 07 e 09"),
    PageBreak(),
]

# ---------------------------------------------------------------- Post 3/3 roteiro
E += sec("04", "PEÇA-CHAVE", "Post N3 3/3 — Roteiro completo")
cards = [
    ("CARD 1", "Enquanto você espera a ANS resolver seu problema, você fica cada vez "
               "mais sem tempo pro seu tratamento. A ANS não tem prazo pra te salvar. "
               "Tem prazo pra protocolar."),
    ("CARD 2", "Reclamação na ANS não é ação judicial. Não obriga a operadora a "
               "liberar nada. Você abre um processo administrativo que pode levar "
               "semanas. Enquanto isso, sua cirurgia, exame ou remédio continua negado."),
    ("CARD 3", "Quem entende de saúde suplementar sabe: existe uma ferramenta jurídica "
               "que obriga o plano a liberar em dias, não em semanas. Chama liminar. E "
               "ela só funciona se for pedida certo, no momento certo."),
    ("CARD 4", "O Protocolo Emergencial de Saúde nasceu pra isso. Analiso seu caso, "
               "identifico a ilegalidade na negativa e entro com o pedido de urgência "
               "direto na Justiça."),
    ("CARD 5", "Não é reclamação. Não é mediação. É decisão judicial forçando a "
               "operadora a cumprir o contrato. Enquanto outros esperam resposta da "
               "ANS, meus clientes já têm data marcada pro procedimento."),
    ("CARD 6", "O que está em jogo não é dinheiro. É tempo de tratamento que não "
               "volta. Cada semana de espera é uma semana a menos de recuperação, de "
               "qualidade de vida, de tranquilidade."),
    ("CARD 7", "Direito à saúde não tem fila de espera administrativa. Tem prazo "
               "legal, e ele é curto."),
    ("CARD 8 · CTA", "Se seu plano negou cirurgia, exame ou medicamento de alto "
               "custo, não espere a ANS decidir. Manda a palavra PROTOCOLO no Direct "
               "e te explico o que fazer ainda hoje."),
]
card_rows = [[Paragraph(spaced(tag).upper(), S["box_tag"]),
              Paragraph(txt, S["cell_b"])] for tag, txt in cards]
tcards = Table(card_rows, colWidths=[31 * mm, W - 2 * MARGIN - 31 * mm])
tcards.setStyle(TableStyle([
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
E += [
    tcards,
    gap(4),
    note("Cards 1, 2, 6 e 7 estão ótimos e ficam como estão. Os cards 3, 4 e 5 são o "
         "principal ajuste do dossiê inteiro — \"obriga o plano a liberar em dias\" e "
         "\"meus clientes já têm data marcada\" são promessa de resultado, e o Dr. "
         "Vilmar não assina peça assim (nem a OAB permite). Trabalhar desta forma:<br/>"
         "<br/><b>Card 3</b> → \"Existe uma ferramenta prevista em lei — a tutela de "
         "urgência (art. 300 do CPC), a chamada liminar. Quando o caso preenche os "
         "requisitos legais, o juiz pode determinar que o plano cumpra o contrato em "
         "prazo curto. E ela precisa ser pedida do jeito certo, no momento certo.\"<br/>"
         "<br/><b>Card 4</b> → trocar \"identifico a ilegalidade\" por \"verifico "
         "possível ilegalidade\" e \"entro com o pedido\" por \"quando cabível, entro "
         "com o pedido\".<br/><br/><b>Card 5</b> → \"Não é reclamação. Não é mediação. "
         "É pedido de decisão judicial para que a operadora cumpra o contrato. Cada "
         "caso é único e depende de análise — mas quem age no tempo certo, com a "
         "documentação certa, disputa em outras condições.\"<br/><br/><b>Card 8 "
         "(CTA)</b> → acrescentar o passo concreto antes do convite: \"guarde a "
         "negativa por escrito e não espere sem prazo\". Ele prefere lead que já "
         "chega documentado — e o CTA fica informativo, sem tom de captação.",
         title="Cards 3, 4, 5 e 8 — trabalhar desta forma"),
    PageBreak(),
]

# ---------------------------------------------------------------- 05 TRÁFEGO
E += sec("05", "TRÁFEGO", "Estratégia de tráfego:<br/>orçamento enxuto, fechamento rápido")
E += [
    Paragraph("<b>R$ 500 de investimento inicial · 100% em campanha de mensagem · "
              "Fase 1 com foco em primeiros fechamentos.</b> Orçamento baixo não "
              "sustenta teste de várias campanhas ao mesmo tempo. Toda a verba vai "
              "pra um único objetivo: gerar conversa qualificada no WhatsApp o mais "
              "rápido possível.", S["body"]),
    gap(2),
    rule_table(
        ["Nº", "ETAPA", "O QUE ACONTECE"],
        [
            ["01", "<b>Anúncio</b>",
             "Posts do perfil + criativos externos direcionando tráfego"],
            ["02", "<b>Formulário</b>",
             "Nativo do Instagram ou externo, com perguntas de qualificação"],
            ["03", "<b>WhatsApp</b>",
             "Lead qualificado inicia atendimento automaticamente"],
            ["04", "<b>Reunião</b>", "Agendamento pra maximizar taxa de fechamento"],
            ["05", "<b>Fechamento</b>", "Proposta apresentada na chamada"],
            ["06", "<b>Escala</b>",
             "Com volume, proposta passa a ser enviada por mensagem"],
        ],
        [10 * mm, 34 * mm, W - 2 * MARGIN - 44 * mm]),
    gap(4),
    box("FORMULÁRIO DE QUALIFICAÇÃO", "Perguntas necessárias",
        "1. Qual foi o procedimento, exame ou medicamento negado?<br/>"
        "2. A negativa já foi formalizada por escrito pela operadora?<br/>"
        "3. Há urgência médica envolvida (risco à saúde em caso de demora)?<br/>"
        "4. Nome e melhor forma de contato (WhatsApp)<br/><br/>"
        "Essas respostas chegam junto com o lead no WhatsApp — o atendimento já "
        "começa com contexto, sem precisar repetir perguntas."),
    gap(4),
    note("Estrutura aprovada, com três pedidos: <b>(1) LGPD</b> — o formulário "
         "pergunta sobre saúde, e isso é dado pessoal sensível (art. 11 da LGPD). O "
         "escritório lida com sigilo de cliente todos os dias e leva isso a sério: "
         "incluir aviso curto de consentimento no formulário e guardar as respostas "
         "em ambiente restrito, nunca em planilha aberta da agência. <b>(2) "
         "Expectativa</b> — combinar já o que R$ 500 deve render (estimativa de "
         "conversas) e o que define sucesso da Fase 1; ele prefere meta clara a "
         "\"vamos acompanhar\". <b>(3) Atendimento</b> — o funil de vocês termina no "
         "\"lead chega no WhatsApp\", mas é ali que o posicionamento de velocidade se "
         "prova. Ele mesmo atende, e o WhatsApp é o canal natural dele: fechar juntos "
         "um script de primeira resposta (automática imediata + resposta pessoal em "
         "até 1h útil pedindo negativa por escrito e laudo).",
         title="Formulário, expectativa e o pós-clique"),
    PageBreak(),
]

# ---------------------------------------------------------------- 05 CRIATIVOS
E += sec("05", "CRIATIVOS", "O que vai rodar em anúncio")
E += [
    two_boxes([
        ("FORMATO 1", "Posts do perfil",
         "Os próprios Posts N3 do feed, promovidos como anúncio. Mantém congruência: "
         "quem clica no anúncio já reconhece o conteúdo dentro do perfil."),
        ("FORMATO 2", "Reels de texto",
         "Fundo neutro, sem rosto, com frase de impacto na tela. Rápido de produzir, "
         "fácil de escalar, alto potencial de retenção por ir direto ao ponto."),
    ]),
    gap(4),
    box("FORMATO 3", "Estáticos",
        "Peças de imagem única com a mesma lógica dos Posts N3: quebra de padrão + "
        "método + prova. Complementam os reels pra dar variedade sem fugir da "
        "mensagem."),
    gap(3),
    Paragraph("<b>Regra de ouro dos criativos (mantida):</b> nenhum anúncio foge do "
              "Protocolo Emergencial de Saúde. Todo criativo, em qualquer formato, "
              "comunica a mesma mensagem central — é a repetição que barateia o custo "
              "por lead com o tempo.", S["body"]),
    gap(2),
    note("Os três formatos ficam — e o <b>Formato 2 (reels de texto, sem rosto)</b> "
         "vira o principal, justamente porque casa com o perfil reservado do Dr. "
         "Vilmar: comunica urgência sem exigir que ele apareça. Estáticos na mesma "
         "linha. Qualquer criativo que dependa de aparição pessoal dele fica fora do "
         "plano por ora. Dois requisitos em todo criativo: identificação da "
         "publicidade (nome + OAB) e a régua ética da observação da pág. 02 — na "
         "dúvida sobre uma frase, não publica: manda pra validação antes.",
         title="Priorizar os formatos sem rosto"),
    PageBreak(),
]

# ---------------------------------------------------------------- 06 PRÓXIMOS PASSOS
E += sec("06", "PRÓXIMOS PASSOS", "O que acontece a partir daqui")
E += [
    rule_table(
        ["Nº", "ETAPA", "DETALHE"],
        [
            ["01", "<b>Posicionamento</b>",
             "Nova bio, nova foto de perfil, destaque \"Comece aqui\" e publicação "
             "dos 3 Posts N3 fixados + 6 posts de sustentação."],
            ["02", "<b>Estrutura de captação</b>",
             "Formulário de qualificação configurado e fluxo de WhatsApp pronto pra "
             "receber o lead com contexto completo."],
            ["03", "<b>Tráfego</b>",
             "Campanha de mensagem no ar com R$ 500, usando posts do perfil, reels "
             "de texto e estáticos."],
            ["04", "<b>Acompanhamento</b>",
             "Leitura de resultados na primeira semana: custo por lead, taxa de "
             "qualificação, taxa de comparecimento em reunião. Ajustes de verba e "
             "criativo a partir daí."],
        ],
        [10 * mm, 42 * mm, W - 2 * MARGIN - 52 * mm]),
    gap(5),
    quote("O objetivo da Fase 1 não é escalar. É provar que o protocolo funciona com "
          "o menor investimento possível."),
    gap(5),
    note("Fluxo aprovado, com uma regra de trabalho: <b>nenhuma peça vai ao ar sem o "
         "\"ok\" do Dr. Vilmar</b> — perante a OAB, quem responde pela publicidade é "
         "o advogado, não a agência. Ele valida rápido pelo WhatsApp, então isso não "
         "trava o cronograma de vocês. No acompanhamento, fixar as metas combinadas "
         "(custo por conversa, % de leads com negativa formalizada, comparecimento em "
         "reunião) e ajustar uma variável por vez. E um horizonte pra vocês já "
         "saberem: validado o funil de saúde, o escritório estuda replicar o formato "
         "\"protocolo\" pra uma segunda frente (direito digital — golpes e fraudes "
         "online). Mais um motivo pra construir essa comunicação num tom sóbrio, que "
         "envelheça bem e sirva de modelo.", title="Regra de validação e visão de futuro"),
]

doc.build(E)
print("OK:", OUT)
