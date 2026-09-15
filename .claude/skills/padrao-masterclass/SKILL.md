---
name: padrao-masterclass
description: "Redige e formata peças no padrão Masterclass (Júlio Xavier / InicialMasterclassV.docx): Segoe UI 11 pt sem recuo, títulos em versalete 0,7 pt, Síntese Processual e quadro de Requerimentos com ☑. Use quando o pedido citar \"padrão Masterclass\", \"modelo da masterclass\" ou \"estilo Júlio Xavier\" — qualquer peça. Inclui parâmetros exatos, peça-modelo comentada e camada opcional de legal design (Juridy)."
---

# Padrão Masterclass — peças do escritório VGJ

Reproduz o layout do modelo **InicialMasterclassV.docx** (Júlio Xavier / Tipografia Jurídica), adotado pelo escritório como **terceiro padrão**, ao lado do visual-law VGJ e do clássico Times New Roman.

Todos os valores abaixo foram **medidos no XML de uma peça real do escritório** (`Peticao_Prosseguimento_Urgencia_Bradesco.docx`, set/2026). Reproduza-os literalmente.

**Regra de ouro:** é um sistema fechado. Não misturar com o visual-law VGJ (navy #1B2340, filete dourado nos títulos, boxes) nem com o clássico. Pediu "Masterclass", entregue Masterclass puro.

## Qual padrão usar

| Pedido | Padrão |
|---|---|
| "padrão Masterclass", "modelo da masterclass", "estilo Júlio Xavier", "InicialMasterclassV" | **esta skill** |
| "padrão da casa", "como sempre", peça sem indicação | clássico Times New Roman → skill `tipografia-juridica` |
| "visual law", "no timbrado", "padrão navy/dourado" | visual-law VGJ (timbrado_vilmar.docx) |

---

## 1. Página e base

`sectPr`: A4 (`w:w="11906" w:h="16838"`), `w:top="1701" w:right="1701" w:bottom="1417" w:left="1701" w:header="227" w:footer="567"` — ou seja **3 / 3 / 2,5 / 3 cm**.

Conversão: **1 cm = 566,93 twips**, **1 pt = 20 twips**, `w:sz` em **meios-pontos** (11 pt = 22).

O modelo original define cinco estilos nomeados (`1. Parágrafo`, `2. Título`, `3. Subtítulo`, `4. Citação`, `5. Lista alfabética`). **Nas peças reais do escritório a especificação do corpo vai no próprio `Normal`** e o resto é formatação direta. Qualquer um dos dois caminhos serve; o que não pode variar são os valores.

`Normal`:
```xml
<w:pPr><w:spacing w:before="200" w:after="200" w:line="240" w:lineRule="auto"/>
       <w:ind w:firstLine="0"/><w:jc w:val="both"/></w:pPr>
<w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI" w:eastAsia="Segoe UI"/>
       <w:sz w:val="22"/></w:rPr>
```

Segoe UI 11 pt, justificado, **sem recuo de primeira linha**, 10 pt antes e depois, entrelinha simples. O respiro vem do espaçamento, nunca do recuo — jamais os dois juntos.

## 2. Parâmetros por bloco

| Bloco | Parágrafo (`pPr`) | Fonte (`rPr`) |
|---|---|---|
| **Endereçamento — juízo** | `jc left`, `ind left="283"` (0,5 cm), `before=0 after=0` | Segoe UI, **negrito**, `sz 24` (12 pt) |
| **Endereçamento — comarca** | `jc left`, `ind left="283"`, `before=40 after=280` | **Goudy Old Style**, *itálico*, **sem negrito**, `sz 28` (14 pt) |
| **Processo nº** | `jc left`, sem recuo, `before=0 after=280` | Segoe UI, negrito, `sz 22` |
| **Preâmbulo** | `jc both`, `before=0 after=200` | corpo; partes em `b` + `smallCaps` + `spacing val="14"` |
| **`Síntese Processual`** | `jc left`, `keepNext`, `before=360 after=120` | `b` + `smallCaps` + `spacing 14`, `sz 28` (14 pt) |
| **Bloco da síntese** | `jc both`, `ind left="283"`, `before=0 after=200` | corpo |
| **Título de seção** | `jc left`, `keepNext`, `before=360 after=120` | `b` + `smallCaps` + `spacing 14`, `sz 26` (13 pt) |
| **Subtítulo** | `jc left`, `keepNext`, `before=200 after=80` | *itálico*, **sem negrito**, `spacing 14`, `sz 22` |
| **Corpo** | `jc both`, `before=0 after=200` | `sz 22` |
| **Citação longa** | `jc both`, `ind left="1417"` (2,5 cm) | `sz 20` (10 pt), sem aspas e sem itálico |
| **Fecho** | `jc center`, `before=400 after=80` | `sz 22`, **sem cor** |
| **Data** | `jc center`, `before=0 after=400` | `sz 22`, **sem cor** |
| **Nome do advogado** | `jc center`, `before=0 after=0` | negrito, `color 404040`, `sz 22` |
| **OAB** | `jc center`, `before=0 after=0` | normal, `color 404040`, `sz 18` (9 pt) |

### Versalete — o detalhe que define o padrão
Títulos, subtítulos e nomes das partes levam `<w:smallCaps/>` + `<w:spacing w:val="14"/>` (0,7 pt de espaçamento entre caracteres).

**Digitar em caixa de título, não em minúsculas nem em CAIXA ALTA.** "Da Urgência na Apreciação dos Pedidos" renderiza com D, U, A e P em altura plena e o resto em versalete — é esse contraste que produz o efeito. Texto todo em maiúsculas anula o versalete; texto todo em minúsculas perde as iniciais.

Subtítulos vão em **caixa de frase** ("Da impenhorabilidade do benefício previdenciário") e são *itálicos sem negrito*.

## 3. Quadro `Requerimentos desta Petição`

Tabela de 2 colunas que fecha a peça, precedida do título de seção (`sz 26`).

```xml
<w:tblPr>
  <w:tblW w:type="auto" w:w="0"/>
  <w:jc w:val="center"/>
  <w:tblBorders><w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/></w:tblBorders>
  <w:tblLayout w:type="fixed"/>
</w:tblPr>
```

- **Só há o filete vertical interno** (D9D9D9). Nenhuma borda externa, nenhuma horizontal.
- Coluna 1: `tcW 624` dxa, `shd fill="F2F2F2"`, `vAlign center` — uma caixa **☑** (U+2611) centralizada, negrito, `color 0F243E`, `sz 26`.
- Coluna 2: `tcW 7880` dxa, sem sombreamento — texto `jc both`, `before=80 after=80`, `sz 22`.
- Uma linha por requerimento; cada um termina em ponto e vírgula, o último em ponto.

Adaptar o rótulo à peça: `Requerimentos desta Notificação`, `Requerimentos deste Recurso`, `Síntese da Execução`.

## 4. Rodapé

Sem cabeçalho, sem logo, sem marca d'água. O rodapé institucional é discreto e **centralizado** (diferente do rodapé alinhado à direita do timbrado VGJ), Segoe UI `sz 16` (8 pt), `color 404040`, três linhas:

1. `VILMAR GUIMARÃES JÚNIOR — SOCIEDADE INDIVIDUAL DE ADVOCACIA` — negrito, com **filete dourado inferior** `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="C8A050"/></w:pBdr>`, `before=80 after=20`
2. `Av. Olívia Flores, 28, Candeias, CEP 45.028-100, Vitória da Conquista/BA` — `before=0 after=20`
3. `(77) 99126-6355 | vilmarjunior.advogado@gmail.com` — `before=0 after=0`

O bloco de assinatura **não** repete endereço, telefone ou e-mail.

---

## 5. Estrutura por tipo de peça

**Petição incidental / de prosseguimento / de urgência** (o modelo da seção 6): endereçamento → processo → preâmbulo curto de uma frase → `Síntese Processual` → título único da tese com subtítulos → quadro de requerimentos → assinatura. Sem "Dos Fatos" e "Do Direito" separados.

**Inicial:** endereçamento → `Síntese Processual` → preâmbulo/qualificação → título da ação → `Dos Fatos` → `Do Direito` (subtítulos por tese) → `Da Tutela de Urgência`, se houver → `Dos Pedidos` → `Do Valor da Causa` → quadro → assinatura.

**Contestação / impugnação / réplica / manifestação:** endereçamento → `Síntese Processual` → `Das Preliminares` → `Do Mérito` (subtítulos) → `Dos Pedidos` → quadro → assinatura.

**Recurso inominado:** peça **única**, nunca dividida em interposição + razões em arquivo separado.
1. Endereçamento ao juízo *a quo*, preâmbulo e interposição breve (arts. 41 e 42 da Lei 9.099/95), fecho e assinatura;
2. No mesmo arquivo, bloco `Razões Recursais`, endereçado à **Egrégia Turma Recursal**, com qualificação (Processo / Recorrente / Recorrida), vocativo "Emérita(o) Turma Julgadora," e frase de abertura;
3. Seções em **algarismo romano + ponto + dois-pontos** — `I. Da Tempestividade:`, `II. Do Cabimento:`, `III. Do Preparo:`, `IV. Da Síntese da Demanda:`;
4. O mérito sob **um único** título `Das Razões Recursais`, com subitens em **letra minúscula + parêntese** — `a) Da confissão…:`, `b) …:`. **Nunca** numeração romana decimal (jamais "VI.1", "VI.2");
5. Fecha com `Dos Pedidos` + fecho + assinatura.

**Cumprimento de sentença:** pedir **apenas a intimação para pagamento**. Não calcular a multa do art. 523, § 1º, do CPC antecipadamente nem pedir penhora/SISBAJUD de saída — jamais redigir contando que a parte não pagará no prazo. Memória de cálculo **dentro do corpo** da petição (não em anexo), mês a mês, com IPCA (IBGE/BCB) e taxa legal do art. 406, § 1º, do CC (série SGS 29543 do Banco Central). Com litisconsórcio passivo citado em datas distintas, adotar a **data da última citação** como termo inicial dos juros de mora.

**Notificação extrajudicial:** destinatário no lugar do endereçamento → `Síntese da Notificação` → fatos → fundamento → prazo → quadro `Requerimentos desta Notificação` → assinatura.

**Procuração e substabelecimento:** seguir `Procuração Masterclass V.docx` e `Substabelecimento Masterclass V.docx` — mesma tipografia, sem síntese e sem quadro; outorgante em negrito + versalete, poderes em bloco corrido, assinatura centralizada.

---

## 6. Peça-modelo de referência

Peça real do escritório — `Peticao_Prosseguimento_Urgencia_Bradesco.docx`, 08/09/2026 — reproduzida na íntegra, com os dados do caso preservados para servir de referência de registro e de densidade. **Ao reaproveitar, substituir nome do autor, réu, nº do benefício, conta, agência, cartão, valores, datas e número do processo** pelos dados do caso novo — conferir isso antes de protocolar.

> **Excelentíssimo Senhor Doutor Juiz de Direito da Vara dos Feitos Relativos às Relações de Consumo, Cíveis e Comerciais**
> *Comarca de Vitória da Conquista — Estado da Bahia*  ← Goudy Old Style itálico 14 pt
>
> **Processo nº 8019672-83.2026.8.05.0274**
>
> **José Manoel Vieira**, já qualificado nos autos em epígrafe, que move em face de **Banco Bradesco S.A.**, igualmente qualificado, vem, por seu advogado que esta subscreve, requerer o prosseguimento do feito com urgência, pelos fatos e fundamentos a seguir expostos.
>
> ### Síntese Processual
> *(recuo 0,5 cm)* A ação foi distribuída por sorteio em 19/08/2026, com conclusão para despacho no mesmo dia. O autor — pessoa idosa de 76 anos, cujo único sustento é o benefício previdenciário nº 180.479.110-2 (R$ 5.305,22 líquidos mensais) — relatou fraude bancária por falha de segurança do réu, com formação de saldo devedor artificial na conta corrente nº 0388763-4, agência 0270, e compras não reconhecidas junto à Decolar, lançadas no cartão final 8817, cujo débito passou a ser retido diretamente sobre o benefício. A inicial, protocolada com a identificação "URGENTE – DESCONTO NO BENEFÍCIO", requereu tutela de urgência *inaudita altera parte* para suspender a exigibilidade do débito, cessar a retenção sobre o benefício, restituir em 48 horas o valor já retido, suspender as parcelas vincendas das compras impugnadas e vedar a negativação do nome do autor (item IX, "c", c.1 a c.4), além de prioridade de tramitação por idade (item IX, "b"). Passados 20 (vinte) dias corridos da distribuição, os autos seguem sem apreciação dos pedidos urgentes — daí a presente petição.
>
> ### Da Urgência na Apreciação dos Pedidos
>
> *Da impenhorabilidade do benefício previdenciário*
> O benefício tem natureza alimentar e é impenhorável nos termos do art. 833, IV, do CPC e do art. 114 da Lei nº 8.213/91, que só admite desconto por dívida com a Previdência Social, por alimentos ou por autorização do titular — nenhuma hipótese presente nestes autos, o que reforça o *fumus boni iuris* já exposto na inicial.
>
> *Do agravamento mensal do dano*
> O benefício é creditado mensalmente: cada novo crédito é nova oportunidade de retenção indevida, de modo que o mero decurso do tempo agrava o dano, a que se somam o vencimento de novas parcelas impugnadas e o risco iminente de negativação nos cadastros restritivos (SPC/Serasa).
>
> *Da prioridade legal da pessoa idosa*
> Aos 76 anos, o autor tem prioridade absoluta de tramitação, nos termos do art. 71, *caput*, da Lei nº 10.741/2003 (Estatuto da Pessoa Idosa) e do art. 1.048, I, do CPC — já requerida na inicial e ainda pendente de observância.
>
> *Do dever de gestão célere do processo*
> Os arts. 4º, 6º e 139, II, do CPC, e o art. 5º, LXXVIII, da CF impõem duração razoável e gestão célere do processo, dever que se intensifica quando a tutela é requerida *inaudita altera parte* (art. 300, § 2º, do CPC): a própria lógica da medida pressupõe apreciação imediata, sob pena de a decisão tardia perder parte de sua utilidade prática.
>
> ### Requerimentos desta Petição
> | ☑ | o imediato prosseguimento do feito, com urgente apreciação e pronto julgamento dos pedidos de gratuidade da justiça, prioridade de tramitação e, sobretudo, tutela provisória de urgência (itens "a" a "d" do item IX da inicial), dada a natureza alimentar do bem jurídico e o agravamento mensal do dano; |
> | ☑ | caso os pedidos urgentes já estejam em efetiva análise, seja esta petição recebida como reforço e reiteração das razões que os sustentam, sem prejuízo do regular prosseguimento do feito; |
> | ☑ | sejam mantidos, no mais, todos os termos e pedidos da inicial, inclusive quanto à intimação exclusiva em nome do advogado subscritor, Dr. Vilmar Guimarães Júnior, OAB/BA 50.217, sob pena de nulidade. |
>
> Nesses termos, pede deferimento.
> Vitória da Conquista/BA, 8 de setembro de 2026.
>
> **Vilmar Guimarães Júnior**
> OAB/BA 50.217

**O que copiar deste modelo:**

- **Preâmbulo de uma frase.** Em peça incidental não se requalifica ninguém: "já qualificado nos autos em epígrafe" resolve.
- **A síntese é factual e datada.** Ela não argumenta — narra o que aconteceu e termina no travessão que justifica a peça ("— daí a presente petição").
- **Um travessão para carregar a vulnerabilidade.** A qualificação decisiva do autor (idade, natureza alimentar da renda) entra num aposto entre travessões, dentro da síntese, não em seção própria.
- **Subtítulo = uma tese, um parágrafo.** Cada subtítulo é seguido de um único parágrafo denso, com os dispositivos citados no corpo, sem transcrição.
- **Requerimento subsidiário.** O segundo ☑ ("caso os pedidos já estejam em efetiva análise, seja recebida como reforço") evita que a petição soe como cobrança ao juízo.
- **Cláusula de ressalva final.** O último ☑ mantém os termos da inicial e reitera a intimação exclusiva.
- Fecho grafado **"Nesses termos, pede deferimento."**

---

## 7. Regras de conteúdo do escritório

- **Não citar o nome do juiz ou da juíza** em nenhuma peça.
- **PROJUDI/TJBA:** referenciar documentos por **"evento"**, nunca por "Id" (Id só existe no PDF baixado).
- **Juizados Especiais:** peças **enxutas e diretas** — sem firula, sem cara de texto gerado por IA.
- **Negrito com moderação:** nomes das partes na primeira menção e dados essenciais (datas, valores, contas, nº de documento). Nunca frases inteiras por ênfase retórica.
- *Itálico* para latim e estrangeirismos (*inaudita altera parte*, *fumus boni iuris*, *caput*, *data venia*). **Sublinhado nunca.**
- Fundamentar com dispositivo citado (CF, CPC, CC, CDC, CLT, Lei 9.099/95) e jurisprudência atualizada — STJ, TST, TJBA e Turmas Recursais da Bahia; conferir súmulas e teses repetitivas antes de afirmar entendimento dominante.
- Raciocínio na ordem **fato → norma → subsunção → conclusão**.
- **Dados de cliente não viajam entre casos.** O modelo da seção 6 contém dados reais de um caso: ao reusá-lo, conferir que nome, benefício, conta, agência, cartão, valores, datas e número do processo foram todos substituídos antes de protocolar.

### Pontuação, regra absoluta

Duas proibições valem em toda peça, sempre, sem depender de pedido do usuário.

**Travessão: zero.** Nenhum `—` e nenhum `–`. Não serve como ênfase, aposto, respiro nem intervalo. Troque por vírgula, parênteses ou ponto final. Intervalo se escreve com "a" ("fls. 12 a 18", "de 2019 a 2023"). Item de lista nunca abre com travessão. Hífen de palavra composta continua normal.

- Errado: "A ré não juntou o contrato — documento essencial — e ainda assim pede a inversão."
- Certo: "A ré não juntou o contrato, documento essencial, e ainda assim pede a inversão."

**Dois-pontos: zero no texto corrido.** Não abrem enumeração, não anunciam citação, não criam suspense. A frase que antecede uma lista termina em ponto.

- Errado: "Ante o exposto, requer:"
- Certo: "Ante o exposto, a parte autora requer o seguinte."
- Errado: "O ponto é um só: a prescrição já correu."
- Certo: "A prescrição já correu."
- Errado: "Vejamos o que diz o STJ:"
- Certo: "A orientação do STJ é firme nesse sentido." (transcrição em bloco recuado logo abaixo)

O sinal sobrevive num único lugar, e ali ele é layout, não pontuação: separador de campo em bloco estruturado (quadro de requerimentos, síntese processual, ficha, "Processo", "Valor da causa"). No texto corrido, nunca.

Antes de entregar, procure os três sinais no arquivo. O texto corrido tem que devolver zero ocorrência.

---

## 8. Camada OPCIONAL — legal design (método Juridy)

**Não aplicar por padrão.** Só com pedido expresso ("aplica legal design", "método Juridy", "deixa mais legível para o juiz"). A base tipográfica continua sendo o padrão Masterclass; o legal design entra como camada de estrutura e clareza, não como troca de layout.

As cinco etapas do método [Juridy](https://juridy.com/), adaptadas à peça brasileira:

1. **Identificar a necessidade do leitor.** O leitor real é o assessor que triará a peça e o juiz que decidirá — não o cliente, não o adverso. O que essa pessoa precisa achar nos primeiros 30 segundos? Em regra: o que se pede, com que fundamento e o que já está provado.
2. **Reorganizar pela necessidade do leitor, não pela lógica jurídica.** A `Síntese Processual` já é isso. Pode-se antecipar a tese central antes do relato exaustivo e agrupar por questão decisória em vez de por cronologia.
3. **Linguagem clara sem perder rigor.** Frases curtas, parágrafos de poucas linhas, **voz ativa**, sem construções rebuscadas. A precisão técnica e a citação dos dispositivos permanecem integralmente — clareza não é simplificação do direito.
4. **Visualizar o que é complexo.** Linha do tempo dos fatos, tabela comparativa (contratado × cobrado), quadro-síntese de provas, memória de cálculo. Paleta restrita ao que a peça já usa: **0F243E** e **F2F2F2**, filete D9D9D9. Nunca ícone colorido, nunca infográfico decorativo.
5. **Testar a leitura.** Antes de entregar, releia só os títulos, a síntese e o quadro de requerimentos: a peça se explica sozinha nessa leitura? Se não, o problema é de estrutura, não de formatação.

**Limites.** Em Juizado Especial, no máximo um recurso visual, e só se substituir texto. Em juízos conservadores o risco forense do visual law é real — na dúvida, ficar na tipografia. Nunca usar recurso visual que o usuário não pediu.

---

## 9. Produção do .docx

1. **Ler primeiro** `/mnt/skills/public/docx/SKILL.md` (restrições do ambiente).
2. Configurar `Normal` com a especificação da seção 1 e aplicar os demais blocos por formatação direta, conforme a tabela da seção 2.
3. Versalete e espaçamento de caracteres exigem XML no `rPr`:
   ```python
   from docx.oxml.ns import qn
   from docx.oxml import OxmlElement

   def versalete(run, spacing_pt=0.7):
       rPr = run._element.get_or_add_rPr()
       rPr.append(OxmlElement('w:smallCaps'))
       sp = OxmlElement('w:spacing')
       sp.set(qn('w:val'), str(int(round(spacing_pt * 20))))  # 0,7 pt = 14
       rPr.append(sp)
   ```
4. No quadro: remover todas as bordas e deixar **só** `insideV`; sombrear apenas a célula do ☑.
5. Preservar imagens e planilhas já existentes ao reformatar peça pronta.
6. Nome do arquivo: `Tipo_Autor_x_Reu.docx` (ex.: `Peticao_Prosseguimento_Urgencia_Bradesco.docx`).

## 10. Checklist antes de entregar

1. Margens 3 / 3 / 2,5 / 3 cm; `header 227`, `footer 567`?
2. Segoe UI 11 pt justificado, 10 pt antes/depois, **sem recuo de primeira linha**?
3. Títulos em **caixa de título** com `smallCaps` + `spacing 14`, 13 pt (14 pt na síntese)?
4. Subtítulos em *itálico sem negrito*, caixa de frase, `spacing 14`?
5. Endereçamento: juízo em negrito 12 pt recuado 0,5 cm; comarca em Goudy Old Style itálico 14 pt?
6. Bloco da síntese recuado 0,5 cm?
7. Quadro com **apenas** o filete vertical D9D9D9, ☑ em 0F243E sobre F2F2F2, tabela centralizada?
8. Assinatura centralizada — nome negrito 11 pt e OAB 9 pt em 404040; fecho e data **sem** cor?
9. Rodapé centralizado 8 pt com filete dourado C8A050; sem cabeçalho e sem logo?
10. Negrito moderado, zero sublinhado, latim em itálico?
11. **Zero travessão e zero dois-pontos no texto corrido** (`—`, `–` e `:` só sobrevivem como separador de campo em quadro ou síntese)?
12. Nome do juiz ausente; documentos do PROJUDI citados por **evento**?
13. Cumprimento de sentença: só intimação para pagamento, sem multa antecipada, cálculo no corpo?
14. Recurso inominado: peça única, subitens em `a)`, `b)` — nunca "VI.1"?
14. Legal design aplicado **apenas** se pedido expressamente?