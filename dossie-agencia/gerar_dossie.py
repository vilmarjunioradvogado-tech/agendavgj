# -*- coding: utf-8 -*-
"""Gera o dossiê revisado 'Protocolo Emergencial de Saúde — Revisão 2.0' em PDF."""

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
NAVY_SOFT = HexColor("#1B3556")
RED = HexColor("#C0392B")
INK = HexColor("#2B3440")
GRAY = HexColor("#5A6572")
BG = HexColor("#F2F4F7")
BG_WARN = HexColor("#FBEEE9")
LINE = HexColor("#D8DDE3")

W, H = A4
MARGIN = 18 * mm
OUT = "Protocolo_Emergencial_de_Saude_REVISAO_2.pdf"

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
    "body_sm":  st("body_sm", fontSize=8.5, leading=12.5, textColor=GRAY),
    "box_tag":  st("box_tag", fontName="Helvetica-Bold", fontSize=7.5, leading=10,
                   textColor=RED),
    "box_h":    st("box_h", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                   textColor=NAVY),
    "box_b":    st("box_b", fontSize=9, leading=13, textColor=INK),
    "quote":    st("quote", fontName="Helvetica-BoldOblique", fontSize=11.5,
                   leading=16.5, textColor=white),
    "note":     st("note", fontSize=8.5, leading=12.5, textColor=GRAY),
    "cell_h":   st("cell_h", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
                   textColor=NAVY),
    "cell_b":   st("cell_b", fontSize=8.5, leading=12, textColor=INK),
    "cov_kick": st("cov_kick", fontName="Helvetica-Bold", fontSize=9, leading=13,
                   textColor=HexColor("#9FB2CC")),
    "cov_t":    st("cov_t", fontName="Helvetica-Bold", fontSize=38, leading=42,
                   textColor=white),
    "cov_sub":  st("cov_sub", fontSize=12, leading=18, textColor=HexColor("#C9D4E4")),
    "cov_meta": st("cov_meta", fontSize=10, leading=17, textColor=HexColor("#E3EAF3")),
    "badge":    st("badge", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
                   textColor=white, alignment=TA_CENTER),
}

def spaced(txt):
    return "   ".join(" ".join(w) for w in txt.split())

def label(txt):
    return Paragraph(spaced(txt).upper(), S["label"])

def box(tag, title, body, bg=BG, border=RED):
    rows = []
    if tag:
        rows.append([Paragraph(spaced(tag).upper(), S["box_tag"])])
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

# ---------------------------------------------------------------- page furniture
def on_cover(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    canv.setFillColor(RED)
    canv.rect(0, H - 6 * mm, W, 6 * mm, stroke=0, fill=1)
    canv.setStrokeColor(HexColor("#2A4568"))
    canv.setLineWidth(0.75)
    canv.circle(W - 38 * mm, 46 * mm, 21 * mm, stroke=1, fill=0)
    canv.setFillColor(HexColor("#9FB2CC"))
    canv.setFont("Helvetica-Bold", 7)
    canv.drawCentredString(W - 38 * mm, 50 * mm, "PROTOCOLO EMERGENCIAL")
    canv.drawCentredString(W - 38 * mm, 44 * mm, "Nº 001 · REVISÃO 2.0")
    canv.drawCentredString(W - 38 * mm, 38 * mm, "SAÚDE SUPLEMENTAR")
    canv.restoreState()

def on_page(canv, doc):
    canv.saveState()
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.6)
    canv.line(MARGIN, 14 * mm, W - MARGIN, 14 * mm)
    canv.setFont("Helvetica-Bold", 7)
    canv.setFillColor(GRAY)
    canv.drawString(MARGIN, 9.5 * mm, "PROTOCOLO EMERGENCIAL DE SAÚDE · REVISÃO 2.0")
    canv.drawRightString(W - MARGIN, 9.5 * mm, "PÁG. %02d" % doc.page)
    canv.setFillColor(RED)
    canv.rect(0, H - 4 * mm, W, 4 * mm, stroke=0, fill=1)
    canv.restoreState()

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                      topMargin=16 * mm, bottomMargin=20 * mm,
                      title="Protocolo Emergencial de Saúde — Revisão 2.0",
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
    Paragraph(spaced("REVISÃO 2.0 — COM CONFORMIDADE OAB E LGPD"),
              st("k2", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=RED)),
    Spacer(1, 12 * mm),
    Paragraph("Protocolo<br/>Emergencial<br/>de Saúde", S["cov_t"]),
    Spacer(1, 9 * mm),
    Paragraph("Enquanto o plano nega e a ANS demora, alguém precisa correr contra o "
              "tempo. Esse alguém é você — <b>comunicado do jeito certo, sem risco "
              "ético e sem promessa que a lei proíbe.</b>", S["cov_sub"]),
    Spacer(1, 16 * mm),
    Paragraph("<b>Cliente</b> — Vilmar Junior · Advocacia em Direito à Saúde<br/>"
              "<b>Escopo</b> — Posicionamento de Instagram + Estratégia de Tráfego + "
              "Conformidade OAB/LGPD<br/>"
              "<b>Investimento inicial</b> — R$ 500,00<br/>"
              "<b>Data</b> — Julho de 2026", S["cov_meta"]),
    NextPageTemplate("content"),
    PageBreak(),
]

# ---------------------------------------------------------------- 01 DIAGNÓSTICO
E += sec("01", "DIAGNÓSTICO", "O problema não é a negativa.<br/>É o tempo — e o jeito de dizer isso.")
E += [
    Paragraph("Todo paciente que tem um procedimento, exame ou medicamento de alto custo "
              "negado passa pela mesma sequência: liga pra operadora, abre reclamação na "
              "ANS, espera. E nessa espera, o tratamento não acontece. O diagnóstico da "
              "versão original está correto — mas ele ignorava um terceiro problema, que "
              "é justamente o que diferencia um advogado de um vendedor de urgência.",
              S["body"]),
    gap(2),
    two_boxes([
        ("PROBLEMA CENTRAL", "A negativa",
         "O paciente não sabe que muitas negativas de plano de saúde podem ser "
         "ilegais — e que existe caminho jurídico para discuti-las com rapidez, "
         "quando presentes os requisitos legais."),
        ("PROBLEMA SOFISTICADO", "O tempo perdido",
         "Mesmo quem procura ajuda cai em canais lentos (ANS, operadora) ou em "
         "atendimento generalista que não domina o pedido de urgência. O quadro "
         "de saúde piora enquanto o processo tramita."),
    ]),
    gap(4),
    box("PROBLEMA INVISÍVEL — NOVO NESTA REVISÃO", "O risco de comunicar errado",
        "Posicionar urgência vendendo resultado (\"reverto em dias\", \"meus clientes "
        "já têm data marcada\") viola o Provimento 205/2021 da OAB e expõe a banca a "
        "representação ética — exatamente quando ela começa a aparecer. O diferencial "
        "sustentável é comunicar <b>urgência e método</b> sem prometer <b>desfecho</b>. "
        "Toda a copy deste dossiê foi reescrita sob essa régua.", bg=BG_WARN),
    gap(5),
    Paragraph("<b>Por que isso muda o posicionamento:</b> o mercado de advocacia em "
              "saúde compete em conhecimento jurídico. Nós vamos competir em "
              "<b>velocidade de resposta e clareza de método</b>. É isso que faz o "
              "cliente decidir rápido: a certeza de que alguém vai agir no tempo "
              "certo — não a promessa de um resultado que nenhum advogado pode dar.",
              S["body"]),
    gap(3),
    quote("“Direito à saúde não tem fila de espera administrativa. Tem prazo legal, "
          "e ele é curto.”"),
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
            ["02", "<b>Quem NÃO é o público</b>",
             "Curiosos sem negativa formalizada, casos sem urgência médica e quem busca "
             "apenas indenização — o formulário de qualificação filtra na entrada, "
             "protegendo a agenda para os casos em que o método faz diferença."],
            ["03", "<b>Soluções comuns do mercado</b>",
             "Reclamar direto na operadora ou na ANS. Procurar advogado generalista. "
             "Pagar o procedimento do próprio bolso."],
            ["04", "<b>Efeito colateral em comum</b>",
             "Tempo perdido, saúde agravando, dinheiro saindo do bolso, sensação de "
             "estar sozinho contra a operadora."],
        ],
        [10 * mm, 42 * mm, W - 2 * MARGIN - 52 * mm]),
    gap(5),
    box("NOME DO MÉTODO", "Protocolo Emergencial de Saúde",
        "Comunica exatamente o que o cliente precisa sentir: urgência e procedimento. "
        "Não é \"mais um advogado\", é um protocolo a ser seguido quando o tempo é "
        "curto. O nome é forte e fica mantido."),
    gap(4),
    box("PROMESSA (REVISADA)", None,
        "<b>\"Oriento quem teve procedimento ou medicamento negado pelo plano de saúde "
        "a buscar, com agilidade e dentro da lei, a resposta jurídica adequada ao seu "
        "caso.\"</b><br/><br/>Promessa de processo e competência — não de resultado. Sem "
        "projeção de desfecho, sem valores, sem \"consulta gratuita\" como isca, "
        "conforme o Código de Ética da OAB e o Provimento 205/2021."),
    gap(4),
    box("BASE TÉCNICA DO MÉTODO — NOVO NESTA REVISÃO", "Por que urgência não é exagero",
        "O método se apoia em institutos reais: tutela de urgência (art. 300 do CPC), "
        "Lei dos Planos de Saúde (Lei 9.656/98), Código de Defesa do Consumidor e a "
        "Lei 14.454/2022 sobre o rol da ANS. Citar a base legal nos conteúdos faz duas "
        "coisas ao mesmo tempo: educa o público e blinda a comunicação — quem explica "
        "a lei não está prometendo, está informando."),
    PageBreak(),
]

# ---------------------------------------------------------------- 03 IDENTIDADE
E += sec("03", "NOVA IDENTIDADE", "O que muda no perfil")
E += [
    box("BIO (PROPOSTA REVISADA)", None,
        "<b>\"Advocacia em Direito à Saúde · Negativas de cirurgia, exame e medicamento "
        "de alto custo · Casos urgentes com prioridade de análise · OAB/BA nº ____\"</b>"
        "<br/><br/>A bio original (\"te ajudo a reverter isso\") projetava desfecho. A "
        "revisada mantém a direção de urgência — fala direto com quem está numa negativa "
        "agora — mas em tom informativo. O número da OAB na bio é sinal de seriedade e "
        "requisito de identificação da publicidade profissional."),
    gap(4),
    two_boxes([
        ("FOTO DE PERFIL", "Autoridade e proximidade",
         "Retrato direto, fundo neutro, expressão de confiança. Nada de foto de "
         "escritório genérica. A mesma foto em todos os canais (Instagram, WhatsApp "
         "Business, Google) para reconhecimento imediato."),
        ("DESTAQUES", "\"Comece aqui\" + \"Seus direitos\"",
         "\"Comece aqui\" explica o Protocolo em 3 passos e o que o cliente deve ter "
         "em mãos (negativa por escrito, laudo, pedido médico). \"Seus direitos\" "
         "reúne conteúdo educativo sobre a lei — prova de autoridade sem depender de "
         "depoimento de cliente."),
    ]),
    gap(5),
    Paragraph("<b>Regra de consistência:</b> tudo no perfil fala de uma coisa só — o "
              "Protocolo Emergencial de Saúde. Bio, destaques e os 3 primeiros posts "
              "fixados repetem a mesma mensagem de formas diferentes. É essa repetição "
              "que fixa o método na cabeça de quem visita o perfil.", S["body"]),
    gap(2),
    box("IDENTIFICAÇÃO PROFISSIONAL", "Checklist do perfil",
        "• Nome do perfil com \"Advogado\" ou \"Advocacia\" (publicidade identificada)<br/>"
        "• Número de inscrição na OAB visível na bio<br/>"
        "• Categoria do perfil: \"Advogado/serviço jurídico\", não \"empreendedor\"<br/>"
        "• Link do WhatsApp Business com mensagem de boas-vindas configurada"),
    PageBreak(),
]

# ---------------------------------------------------------------- 04 CONTEÚDO
E += sec("04", "CONTEÚDO", "Fase 1: 9 posts<br/>pra construir posicionamento")
E += [
    Paragraph("Antes de investir em tráfego, o perfil precisa comunicar o método com "
              "clareza. Três posts fixados carregam o peso da mensagem. Os demais "
              "sustentam e repetem sob ângulos diferentes.", S["body"]),
    gap(2),
    box("POST N3 · 1/3 · FIXADO", "Explica o método",
        "Responde à pergunta que todo visitante tem: \"o que é o Protocolo Emergencial "
        "de Saúde?\" Estrutura o problema, as etapas do método e a base legal que o "
        "sustenta."),
    gap(3),
    box("POST N3 · 2/3 · FIXADO", "Mostra a transformação — sem prometer",
        "Pinta o quadro da vida de quem conseguiu destravar o tratamento a tempo: "
        "rotina retomada, tranquilidade de volta. Narrado como cenário possível "
        "(\"quando a Justiça reconhece a urgência...\"), nunca como garantia."),
    gap(3),
    box("POST N3 · 3/3 · FIXADO", "\"Enquanto você espera a ANS resolver...\"",
        "Contrapõe o método à solução comum (esperar a ANS). Atrai quem já está "
        "frustrado e pronto pra agir. Roteiro completo revisado na página seguinte."),
    gap(5),
    Paragraph("<b>+ 6 posts de sustentação</b> — publicados nas semanas seguintes, cada "
              "um reforçando o método sob um ângulo:", S["body"]),
    rule_table(
        ["Nº", "ÂNGULO", "OBJETIVO"],
        [
            ["04", "Caso ilustrativo anonimizado: da negativa ao pedido de urgência — "
                   "as etapas, sem valores e sem prometer o mesmo desfecho",
             "Tangibilizar o método com credibilidade e dentro da ética"],
            ["05", "\"3 sinais de que sua negativa pode ser ilegal\"",
             "Educar rápido, gerar identificação"],
            ["06", "Bastidor: como se monta um pedido de urgência (documentos, laudo, prazo)",
             "Tirar o mistério, mostrar competência"],
            ["07", "\"Peça a negativa por escrito — mas não pare nela\": o documento é "
                   "prova essencial, esperar sem prazo é o erro",
             "Alertar, reforçar a urgência e já preparar o lead com a documentação certa"],
            ["08", "Medicamento de alto custo negado: o que fazer nas primeiras 24h",
             "Conteúdo utilitário, alto valor de salvamento"],
            ["09", "\"O que a lei diz sobre negativas\": CPC art. 300, Lei 9.656/98, "
                   "Lei 14.454/2022 — em linguagem simples",
             "Autoridade recorrente sem depoimento nem print de resultado (vedados "
             "pela publicidade da OAB)"],
        ],
        [10 * mm, 95 * mm, W - 2 * MARGIN - 105 * mm]),
    PageBreak(),
]

# ---------------------------------------------------------------- Post 3/3 roteiro
E += sec("04", "PEÇA-CHAVE", "Post N3 3/3 — Roteiro completo revisado")
cards = [
    ("CARD 1", "Enquanto você espera a ANS resolver seu problema, você fica cada vez "
               "mais sem tempo pro seu tratamento. A ANS não tem prazo pra te salvar. "
               "Tem prazo pra protocolar."),
    ("CARD 2", "Reclamação na ANS não é ação judicial. Não obriga a operadora a liberar "
               "nada. Você abre um processo administrativo que pode levar semanas. "
               "Enquanto isso, sua cirurgia, exame ou remédio continua negado."),
    ("CARD 3", "Existe uma ferramenta prevista em lei — a tutela de urgência (art. 300 "
               "do CPC), a chamada liminar. Quando o caso preenche os requisitos "
               "legais, o juiz pode determinar que o plano cumpra o contrato em prazo "
               "curto. E ela precisa ser pedida do jeito certo, no momento certo."),
    ("CARD 4", "O Protocolo Emergencial de Saúde organiza exatamente isso: análise do "
               "seu caso, verificação de possível ilegalidade na negativa e, quando "
               "cabível, pedido de urgência direto na Justiça."),
    ("CARD 5", "Não é reclamação. Não é mediação. É pedido de decisão judicial para que "
               "a operadora cumpra o contrato. Cada caso é único e depende de análise — "
               "mas quem age no tempo certo, com a documentação certa, disputa em "
               "outras condições."),
    ("CARD 6", "O que está em jogo não é dinheiro. É tempo de tratamento que não volta. "
               "Cada semana de espera é uma semana a menos de recuperação, de qualidade "
               "de vida, de tranquilidade."),
    ("CARD 7", "Direito à saúde não tem fila de espera administrativa. Tem prazo legal, "
               "e ele é curto."),
    ("CARD 8 · CTA", "Se seu plano negou cirurgia, exame ou medicamento de alto custo, "
               "guarde a negativa por escrito e não espere sem prazo. Pra entender o "
               "seu caso, envie a palavra PROTOCOLO no Direct."),
]
card_rows = [[Paragraph(spaced(tag).upper(), S["box_tag"]),
              Paragraph(txt, S["cell_b"])] for tag, txt in cards]
tcards = Table(card_rows, colWidths=[26 * mm, W - 2 * MARGIN - 26 * mm])
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
    box("O QUE MUDOU E POR QUÊ", None,
        "Os cards 3, 4 e 5 originais afirmavam que a liminar \"obriga o plano a liberar "
        "em dias\" e que \"meus clientes já têm data marcada\" — promessa de resultado e "
        "comparação implícita, vedadas pelo Provimento 205/2021. A versão revisada "
        "mantém a mesma tensão narrativa (ANS lenta × Justiça com prazo), mas ancora a "
        "força no <b>instituto legal</b> e no <b>método</b>, não no desfecho garantido. "
        "O CTA agora instrui um passo concreto (guardar a negativa por escrito) antes do "
        "convite ao Direct — lead que chega com documento é lead qualificado.",
        bg=BG_WARN),
    PageBreak(),
]

# ---------------------------------------------------------------- 05 TRÁFEGO
E += sec("05", "TRÁFEGO", "Estratégia de tráfego:<br/>orçamento enxuto, fechamento rápido")
kpi_cells = [
    ("R$ 500", "INVESTIMENTO INICIAL"),
    ("100%", "EM CAMPANHA DE MENSAGEM"),
    ("12–30", "CONVERSAS ESPERADAS/MÊS*"),
]
kt = Table([[Table([[Paragraph(f"<b>{v}</b>", st("kv", fontName="Helvetica-Bold",
                                                fontSize=19, leading=22, textColor=RED,
                                                alignment=TA_CENTER))],
                    [Paragraph(k, st("kk", fontName="Helvetica-Bold", fontSize=6.8,
                                             leading=9.5, textColor=NAVY,
                                             alignment=TA_CENTER))]],
                   colWidths=[(W - 2 * MARGIN - 12 * mm) / 3])
             for v, k in kpi_cells]],
           colWidths=[(W - 2 * MARGIN) / 3] * 3)
kt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), BG),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
E += [
    kt,
    Paragraph("*Faixa estimada com custo por conversa iniciada entre R$ 15 e R$ 40, "
              "típico do nicho jurídico em campanha de mensagem. É estimativa de "
              "planejamento, não garantia — a primeira semana calibra o número real.",
              S["note"]),
    gap(4),
    Paragraph("Orçamento baixo não sustenta teste de várias campanhas ao mesmo tempo. "
              "Toda a verba vai pra um único objetivo: gerar conversa qualificada no "
              "WhatsApp o mais rápido possível. <b>Definição de sucesso da Fase 1:</b> "
              "1 a 2 fechamentos já pagam a operação inteira e validam o método — é "
              "essa a régua, não volume.", S["body"]),
    gap(2),
    rule_table(
        ["Nº", "ETAPA", "O QUE ACONTECE"],
        [
            ["01", "<b>Anúncio</b>", "Posts do perfil + criativos externos direcionando tráfego"],
            ["02", "<b>Formulário</b>", "Nativo do Instagram ou externo, com perguntas de "
                                        "qualificação e aviso de privacidade (LGPD)"],
            ["03", "<b>WhatsApp</b>", "Lead qualificado inicia atendimento com contexto completo"],
            ["04", "<b>Resposta em até 1h útil</b>", "A velocidade de resposta É o posicionamento — "
                                        "script pronto na pág. 08"],
            ["05", "<b>Reunião</b>", "Agendamento pra maximizar taxa de fechamento"],
            ["06", "<b>Fechamento</b>", "Proposta apresentada na chamada; com volume, passa a "
                                        "ser enviada por mensagem"],
        ],
        [10 * mm, 45 * mm, W - 2 * MARGIN - 55 * mm]),
    gap(4),
    box("FORMULÁRIO DE QUALIFICAÇÃO", "Perguntas necessárias",
        "1. Qual foi o procedimento, exame ou medicamento negado?<br/>"
        "2. A negativa já foi formalizada por escrito pela operadora?<br/>"
        "3. Há urgência médica envolvida (risco à saúde em caso de demora)?<br/>"
        "4. Nome e melhor forma de contato (WhatsApp)<br/><br/>"
        "As respostas chegam junto com o lead — o atendimento já começa com contexto, "
        "sem repetir perguntas."),
    gap(3),
    box("ADEQUAÇÃO À LGPD — NOVO NESTA REVISÃO", "O formulário coleta dado sensível",
        "Informação sobre procedimento negado e urgência médica é <b>dado pessoal "
        "sensível</b> (art. 5º, II e art. 11 da LGPD). O formulário deve incluir aviso "
        "curto de privacidade com consentimento: \"Seus dados serão usados apenas para "
        "análise do seu caso e contato do escritório, e não serão compartilhados.\" "
        "Armazenar as respostas em ambiente controlado (não em planilha aberta da "
        "agência) e definir quem tem acesso.", bg=BG_WARN),
    PageBreak(),
]

# ---------------------------------------------------------------- Criativos + atendimento
E += sec("05", "CRIATIVOS & ATENDIMENTO", "O que vai rodar em anúncio —<br/>e o que acontece quando o lead chega")
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
        "método + base legal. Complementam os reels pra dar variedade sem fugir da "
        "mensagem. Todos os criativos identificados como publicidade de advocacia "
        "(nome + OAB)."),
    gap(4),
    Paragraph("<b>Regra de ouro dos criativos:</b> nenhum anúncio foge do Protocolo "
              "Emergencial de Saúde. Todo criativo, em qualquer formato, comunica a "
              "mesma mensagem central — é a repetição que barateia o custo por lead "
              "com o tempo.", S["body"]),
    gap(2),
    box("SCRIPT DE PRIMEIRA RESPOSTA — NOVO NESTA REVISÃO", "WhatsApp, em até 1h útil",
        "<b>Mensagem 1 (automática, imediata):</b> \"Recebi suas informações sobre a "
        "negativa do plano. Sou o Dr. Vilmar Junior (OAB/BA nº ____). Vou analisar o "
        "que você enviou e te respondo ainda hoje. Enquanto isso: você tem a negativa "
        "por escrito e o pedido/laudo médico? Pode enviar por aqui.\"<br/><br/>"
        "<b>Mensagem 2 (pessoal, até 1h útil):</b> confirma recebimento dos documentos, "
        "faz 1–2 perguntas de urgência e oferece dois horários objetivos para a "
        "reunião. Nada de \"qualquer hora\": urgência se comunica dando o próximo "
        "passo pronto.<br/><br/>O funil original parava no \"lead chega no WhatsApp\". "
        "Mas se o posicionamento é velocidade, o atendimento é a prova — anúncio "
        "rápido com resposta lenta desmonta a promessa do método."),
    PageBreak(),
]

# ---------------------------------------------------------------- 06 MÉTRICAS + CONFORMIDADE
E += sec("06", "MÉTRICAS & CONFORMIDADE", "Como saber se está funcionando —<br/>sem criar risco pro escritório")
E += [
    Paragraph("A versão original previa \"leitura de resultados na primeira semana\" sem "
              "dizer quais números olhar nem quando agir. Métricas sem meta viram "
              "relatório decorativo. Estas são as quatro que importam na Fase 1:",
              S["body"]),
    rule_table(
        ["MÉTRICA", "META FASE 1", "SE ESTIVER FORA"],
        [
            ["<b>Custo por conversa iniciada</b>", "Até R$ 40",
             "Trocar criativo primeiro, público depois — nunca os dois ao mesmo tempo"],
            ["<b>Taxa de qualificação</b> (leads com negativa formalizada)", "Acima de 50%",
             "Ajustar as perguntas do formulário ou o texto do anúncio, que pode estar "
             "atraindo curiosos"],
            ["<b>Comparecimento em reunião</b>", "Acima de 60%",
             "Encurtar o tempo entre contato e reunião; reunião marcada pra semana que "
             "vem esfria o caso urgente"],
            ["<b>Fechamentos no mês</b>", "1 a 2",
             "Se as três métricas acima estão na meta e não fecha, o problema é a "
             "proposta/condução da reunião — não o tráfego"],
        ],
        [50 * mm, 34 * mm, W - 2 * MARGIN - 84 * mm]),
    gap(5),
    box("CHECKLIST DE CONFORMIDADE — PROVIMENTO 205/2021 (OAB)", None,
        "Régua para TODO conteúdo e anúncio antes de publicar:<br/><br/>"
        "✓ Sem promessa de resultado (\"reverto\", \"garanto\", \"em X dias\")<br/>"
        "✓ Sem divulgação de valores de causa ou de honorários<br/>"
        "✓ Sem depoimento de cliente ou print de decisão/resultado como propaganda<br/>"
        "✓ Sem \"consulta gratuita\" como isca de captação<br/>"
        "✓ Caráter informativo-educativo predominante em cada peça<br/>"
        "✓ Identificação: nome do advogado + número da OAB em perfil e criativos<br/><br/>"
        "Ficou em dúvida numa peça? Não publica — ajusta antes. Uma representação "
        "ética custa mais que qualquer campanha.", bg=BG_WARN),
    PageBreak(),
]

# ---------------------------------------------------------------- 07 PRÓXIMOS PASSOS
E += sec("07", "PRÓXIMOS PASSOS", "Cronograma de 30 dias")
E += [
    rule_table(
        ["SEMANA", "ENTREGA", "DETALHE"],
        [
            ["<b>1</b>", "Posicionamento",
             "Nova bio com OAB, nova foto, destaques \"Comece aqui\" e \"Seus "
             "direitos\", publicação dos 3 Posts N3 fixados"],
            ["<b>2</b>", "Estrutura de captação",
             "Formulário com aviso LGPD configurado, WhatsApp Business com mensagem "
             "automática e script de primeira resposta pronto; 2 posts de sustentação"],
            ["<b>3</b>", "Tráfego no ar",
             "Campanha de mensagem com R$ 500 usando posts do perfil, reels de texto e "
             "estáticos; 2 posts de sustentação"],
            ["<b>4</b>", "Leitura e ajuste",
             "Análise das 4 métricas contra as metas da pág. 09; ajuste de criativo ou "
             "público conforme a regra \"um de cada vez\"; 2 posts de sustentação"],
        ],
        [24 * mm, 42 * mm, W - 2 * MARGIN - 66 * mm]),
    gap(6),
    quote("O objetivo da Fase 1 não é escalar. É provar que o protocolo funciona — com "
          "o menor investimento possível e zero risco ético pro escritório."),
    gap(6),
    Paragraph("<b>Papéis:</b> agência executa criativos, campanha e leitura de métricas; "
              "o escritório valida cada peça pelo checklist de conformidade antes de "
              "publicar e garante a resposta em até 1h útil no WhatsApp. Nenhuma peça "
              "vai ao ar sem o \"ok\" do advogado — na advocacia, quem responde pela "
              "publicidade perante a OAB é o profissional, não a agência.", S["body"]),
]

doc.build(E)
print("OK:", OUT)
