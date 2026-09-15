# Refinamentos opcionais (método Júlio Xavier / @tipografiajuridica)

Estes ajustes **não** integram o padrão da casa. Aplique-os **somente quando o usuário pedir** (ex.: "deixa no estilo tipografia jurídica", "mais moderno", "enxuga as páginas", "usa versalete", "põe um quadro-resumo"). Cada um é uma troca estética consciente; ofereça, não imponha.

## 1. Fonte sem serifa

Troca de Times New Roman por **Segoe UI** (ou Aptos), ar mais moderno/clean. Aplique no estilo `Normal` (`st.font.name`) e nos runs, garantindo `rFonts` em ascii/hAnsi/cs/eastAsia.

## 2. Entrelinhamento 1,25

Reduz páginas mantendo legibilidade:

```python
pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
pf.line_spacing = 1.25
```

## 3. Versalete no lugar da CAIXA ALTA

Para títulos, nomes das partes e siglas, escreva o texto em **caixa de frase** e ative small caps:

```python
r = p.add_run('Jeová de Castro Santos'); r.bold = True; r.font.small_caps = True
```

Efeito imponente sem "gritar". Só com pedido — o padrão da casa usa caixa alta.

## 4. Recuo OU espaçamento (não os dois)

Se o usuário quiser eliminar o "bis in idem" tipográfico, mantenha o recuo e zere o espaçamento:

```python
pf.first_line_indent = Cm(1.25)
pf.space_after = Pt(0)
```

## 5. Visual law sóbrio

Quadro-resumo, linha do tempo, tabela-síntese ou box de destaque. Paleta restrita: `NAVY="1F3A5F"`, faixas `LIGHT="EAEFF5"`, tints `AMBER="FBEFD3"` / `REDL="F6DADA"`, bordas `D5D5D5`. Funcional e sóbrio; nunca poluído.

```python
from docx.shared import RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def shade(cell, hexc):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd'); sh.set(qn('w:val'),'clear')
    sh.set(qn('w:color'),'auto'); sh.set(qn('w:fill'),hexc); tcPr.append(sh)

def table_borders(table, color="D5D5D5", sz=4,
                  edges=('top','left','bottom','right','insideH','insideV')):
    tblPr = table._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for e in edges:
        el = OxmlElement('w:'+e)
        el.set(qn('w:val'),'single'); el.set(qn('w:sz'),str(sz))
        el.set(qn('w:space'),'0'); el.set(qn('w:color'),color); b.append(el)
    anchor = None                       # ORDEM DO SCHEMA
    for tag in ('w:shd','w:tblLayout','w:tblCellMar','w:tblLook'):
        f = tblPr.find(qn(tag))
        if f is not None: anchor = f; break
    anchor.addprevious(b) if anchor is not None else tblPr.append(b)
```

Boas práticas de execução (para não ficar "amador"):

- **Respiro:** dê padding vertical às células (`space_before/after` 3–4 pt) e use entrelinhamento simples.
- **Larguras equilibradas:** defina `cell.width` em todas as linhas; evite colunas que forçam quebras feias.
- **Cabeçalho:** linha de cabeçalho em `NAVY` com texto branco em negrito.
- **Linha do tempo:** prefira uma faixa horizontal com régua superior azul e nós espaçados; teste se o texto cabe sem quebrar em 3+ linhas — se não couber, reduza o texto, não aperte a célula.
- **Tabela nativa > imagem:** recrie demonstrativos de cálculo como tabela editável quando tiver os números.

Caveat forense: há juízos que rejeitam visual law (o e-book documenta uma inicial extinta na 10ª Vara Cível de Manaus, revertida em apelação). Em Juizados o risco é menor. Dosar conforme o foro; a escolha é do advogado.
