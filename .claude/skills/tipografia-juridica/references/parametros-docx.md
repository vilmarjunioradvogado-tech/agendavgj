# Parâmetros técnicos para `.docx` (python-docx) — padrão da casa

Implementação do padrão da casa do usuário. **Leia também `/mnt/skills/public/docx/SKILL.md` antes de gerar o arquivo.** Estes valores reproduzem o estilo já consolidado nas peças do usuário; não os altere sem pedido.

## Imports e unidades

```python
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
```

## Página A4 + margens 3/2/3/2

```python
sec = doc.sections[0]
sec.page_width = Cm(21.0); sec.page_height = Cm(29.7)
sec.top_margin = Cm(3.0); sec.left_margin = Cm(3.0)
sec.bottom_margin = Cm(2.0); sec.right_margin = Cm(2.0)
```

## Estilo do corpo (Normal)

```python
st = doc.styles['Normal']
st.font.name = 'Times New Roman'
rpr = st.element.get_or_add_rPr(); rf = rpr.get_or_add_rFonts()
for a in ('w:ascii','w:hAnsi','w:cs','w:eastAsia'):
    rf.set(qn(a), 'Times New Roman')
st.font.size = Pt(12)

pf = st.paragraph_format
pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
pf.first_line_indent = Cm(1.25)        # recuo de 1ª linha
pf.space_before = Pt(0)
pf.space_after = Pt(6)                  # 6 pt entre parágrafos (padrão da casa)
pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE   # entrelinhamento 1,5
```

> O padrão da casa usa recuo **e** 6 pt de espaçamento (escolha do autor). Só remova o espaçamento se o usuário pedir o refinamento "recuo ou espaçamento".

## Títulos de seção (negrito CAIXA ALTA, à esquerda)

```python
h = doc.add_paragraph()
h.paragraph_format.first_line_indent = Cm(0)
h.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
h.paragraph_format.space_before = Pt(12); h.paragraph_format.space_after = Pt(6)
r = h.add_run('I — DA SÍNTESE PROCESSUAL E DA DELIMITAÇÃO DO OBJETO')
r.font.name = 'Times New Roman'; r.bold = True   # texto JÁ em maiúsculas
```

Subitens (II.1 etc.): igual, `space_before = Pt(8)`, negrito; mantenha caixa conforme a peça.

## Nomes das partes na qualificação

Dentro do parágrafo do preâmbulo, os nomes vão em negrito e em maiúsculas:

```python
p = doc.add_paragraph()
r = p.add_run('JEOVÁ DE CASTRO SANTOS'); r.bold = True
p.add_run(', já devidamente qualificado nos autos... em face de ')
r = p.add_run('PAGSEGURO INTERNET INSTITUIÇÃO DE PAGAMENTO S.A.'); r.bold = True
p.add_run(', igualmente qualificada, ...')
```

## Ênfase

```python
r = p.add_run('retirada definitiva do alerta de suspeita de fraude'); r.bold = True  # ênfase
r = p.add_run('bis in idem'); r.italic = True                                        # latim
# NUNCA: r.underline = True
```

## Título da ação e assinatura (à esquerda)

```python
t = doc.add_paragraph(); t.paragraph_format.first_line_indent = Cm(0)
t.paragraph_format.space_before = Pt(12); t.paragraph_format.space_after = Pt(6)
r = t.add_run('IMPUGNAÇÃO AO SUPOSTO CUMPRIMENTO DE SENTENÇA'); r.bold = True

# assinatura à esquerda
s = doc.add_paragraph(); s.paragraph_format.first_line_indent = Cm(0)
r = s.add_run('VILMAR GUIMARÃES JÚNIOR'); r.bold = True
o = doc.add_paragraph(); o.paragraph_format.first_line_indent = Cm(0)
o.add_run('OAB/BA 50.217')
```

## Citação longa (bloco)

```python
q = doc.add_paragraph(); qf = q.paragraph_format
qf.left_indent = Cm(4); qf.first_line_indent = Cm(0)
qf.line_spacing_rule = WD_LINE_SPACING.SINGLE
r = q.add_run('Texto da citação, sem aspas e sem itálico...'); r.font.size = Pt(11)
```

## Imagens (planilha de débito etc.)

Preserve imagens já existentes; centralize a imagem e zere o recuo do parágrafo:

```python
pp = doc.add_paragraph(); pp.paragraph_format.first_line_indent = Cm(0)
pp.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
pp.add_run().add_picture('planilha.png', width=Cm(15))
```

## Correção do resíduo do python-docx (zoom)

O python-docx grava `<w:zoom w:val="bestFit"/>`, que falha na validação. Após salvar, desempacote, troque por `<w:zoom w:percent="100"/>` e reempacote (scripts da skill docx), ou ajuste o `settings.xml`.

## O que NÃO fazer

- Não trocar Times New Roman por outra fonte sem pedido.
- Não converter CAIXA ALTA em versalete sem pedido.
- Não centralizar título/assinatura que o autor deixa à esquerda.
- Não usar sublinhado.
- Não trocar 1,5 por outro valor sem pedido.
- Não inserir tabelas/linha do tempo/visual law sem pedido.
