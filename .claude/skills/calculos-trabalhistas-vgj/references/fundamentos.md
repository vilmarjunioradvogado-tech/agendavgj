# Fundamentos, fórmulas e critérios adotados

Cada rubrica traz: fórmula implementada, fundamento e — quando houver mais de uma
leitura possível — o **critério escolhido** pelo motor. Onde a tese é controvertida,
há marcação `[VERIFICAR]`: confira no portal do tribunal antes de usar em peça.

---

## 1. Verbas rescisórias

### Saldo de salário
`(salário ÷ 30) × dias trabalhados no mês da rescisão` — art. 457 CLT.
Critério: o dia da rescisão conta como dia trabalhado.

### Aviso prévio
`30 dias + 3 dias por ano completo`, teto de 90 — art. 487 CLT e Lei 12.506/2011.
Indenizado: `(salário ÷ 30) × dias`.
Acordo do art. 484-A: metade, sem arredondar dias.
Pedido de demissão sem cumprimento: desconto limitado a **30 dias**, porque a
proporcionalidade da Lei 12.506/2011 é benefício do empregado [VERIFICAR posição do TRT-5].

**Projeção.** O aviso indenizado integra o tempo de serviço para 13º, férias e FGTS
(art. 487, §1º, CLT; Súmula 305 do TST; OJ 82 da SDI-1). O motor projeta a data-base e
recomputa os avos — é a divergência mais comum contra cálculos de escritório, que
costumam esquecer a projeção.

### 13º proporcional
`(salário ÷ 12) × avos`, onde **avo = mês do ano-calendário com 15 dias ou mais de
trabalho** — Lei 4.090/62, art. 1º, §2º. O motor conta mês a mês sobre a data-base
projetada e imprime os dias de cada mês na memória.
Justa causa: indevido (art. 3º da Lei 4.090/62).

### Férias
Períodos aquisitivos contados dos **aniversários da admissão**, não do ano-calendário
(arts. 130 e 134 CLT). Fração final: meses do aquisitivo em curso com 15 dias ou mais
(art. 146, parágrafo único). Terço constitucional sobre tudo (art. 7º, XVII, CF).

- Vencidas: `salário × períodos não gozados × 4/3`.
- **Dobro (art. 137):** aplicado apenas aos períodos remanescentes cujo prazo
  concessivo de 12 meses expirou. Critério: presume-se que os períodos gozados são os
  mais antigos.
- Faltas injustificadas reduzem os dias na escala do art. 130 (5/14/23/32 faltas →
  30/24/18/12/0 dias).
- Pedido de demissão: proporcionais devidas (Súmula 261 do TST).
- Justa causa: perde proporcionais, conserva vencidas.

### FGTS e multa
`8% da remuneração de cada competência` — art. 15 da Lei 8.036/90. O aviso indenizado
integra a base (Súmula 305 do TST). Férias indenizadas não integram (art. 15, §6º).
Multa: 40% sem justa causa e na rescisão indireta; 20% no acordo do art. 484-A;
nenhuma na justa causa e no pedido de demissão — art. 18 da Lei 8.036/90.

**A multa e os depósitos não são valor em espécie na conta do trabalhador.** O motor
os lança em grupo próprio no relatório, separados do líquido — misturar as duas coisas
é o erro que infla estimativa e gera frustração do cliente.

Sem extrato, a base é estimada por `8% × (salário × meses + 13º + aviso)` e **não**
incorpora a correção da conta vinculada: o resultado é sempre inferior ao real.

### Multas
- Art. 477, §8º: um salário, pelo atraso na quitação.
- Art. 467: 50% das verbas rescisórias **incontroversas** não pagas na primeira
  audiência. Condicione ao caso — não é multa automática.

---

## 2. Verbas mensais

Todas apuradas competência a competência, com o salário vigente em cada mês quando
houver `historicoSalarial`.

### Horas extras
`valor-hora = salário ÷ divisor` (220 para 44h, 200 para 40h, 180 para 36h — art. 7º,
XIII, CF; Súmula 431 do TST para o divisor 200).
`HE = valor-hora × (1 + adicional) × quantidade`. Adicional legal mínimo de 50%
(art. 7º, XVI, CF); use `adicional50` para o percentual convencional.

### DSR
`total das verbas variáveis × 6/26` — Súmula 172 do TST.
Critério: 26 dias úteis e 6 repousos por mês, configurável em `CONST`.

### Adicional noturno
`valor-hora × 20% × horas noturnas` — art. 73 CLT. Por padrão as horas são convertidas
pela **hora ficta de 52min30s** (art. 73, §1º), fator 60/52,5. Desative com
`aplicarHoraFicta: false` quando a jornada já estiver computada em horas fictas.

### Intervalo intrajornada
`valor-hora × 1,5 × horas suprimidas` — art. 71, §4º, CLT.
Critério: **parcela indenizatória, sem reflexos**, conforme a redação da Lei
13.467/2017. Para períodos anteriores a 11/11/2017 a natureza é salarial e gera
reflexos [VERIFICAR marco temporal e tese aplicável ao contrato].

### Insalubridade e periculosidade
Insalubridade: 10%, 20% ou 40% sobre o **salário mínimo** (art. 192 CLT; Súmula
Vinculante 4 do STF impede a substituição da base por decisão judicial, mantendo-se o
salário mínimo até lei ou norma coletiva em sentido diverso) [VERIFICAR].
Periculosidade: 30% do salário base (art. 193 CLT).
Cumulação vedada pelo art. 193, §2º — o motor calcula ambas se pedidas, mas avisa.

### Reflexos
Por ano: `média mensal das verbas habituais × (avos do ano ÷ 12)` para o 13º
(Súmula 376 do TST) e o mesmo resultado `× 4/3` para férias.
FGTS de 8% sobre verbas deferidas e reflexo de 13º, mais a multa de 40% — OJ 394 da
SDI-1 quanto aos reflexos.
Critério declarado: reflexo de férias tratado como indenizado, fora da base do FGTS.

---

## 3. Prescrição

- **Bienal:** ajuizamento em até 2 anos da rescisão — art. 7º, XXIX, CF. Ultrapassado,
  o motor emite aviso de prescrição integral.
- **Quinquenal:** exclui competências anteriores a 5 anos do ajuizamento. Aplicada por
  padrão; desative com `prescricaoQuinquenal: false`.
- Sem data de ajuizamento o corte **não** é aplicado e o motor avisa.

---

## 4. Atualização monetária

Convenção da Tabela Única do CSJT: a SELIC do mês do vencimento não incide; a contagem
começa no mês seguinte e termina no último mês fechado. O mês corrente nunca entra.

- `selic` (padrão): SELIC acumulada, sem cumular índice de correção — EC 113/2021.
  Cumular IPCA-E ou INPC com SELIC é bis in idem e é o vício mais explorado em
  impugnação de cálculo.
- `adc58`: critério faseado — IPCA-E na fase pré-judicial e SELIC a partir da citação
  (ADC 58 e ADI 5867 do STF). O fator pré-judicial deve vir da Tabela Única do CSJT
  pelo campo `fatorIpcaEPreJudicial`; sem ele, o motor aplica SELIC só da citação e
  avisa que subestima.
- `sem`: valor histórico.

A Lei 14.905/2024 alterou os arts. 389 e 406 do Código Civil (correção pelo IPCA e
juros pela SELIC deduzido o IPCA). A discussão sobre seu alcance nas dívidas
trabalhistas segue aberta [VERIFICAR] — não está implementada como regime autônomo.

---

## 5. INSS e IRRF

**INSS.** Apuração mês a mês (Súmula 368, III, do TST), na **alíquota marginal**: a
remuneração já paga na competência consome as faixas inferiores da tabela progressiva,
de modo que o crédito deferido é tributado na faixa superior. Desative com
`considerarRemuneracaoJaPaga: false` se o título determinar outro critério.

Não incidem contribuição previdenciária: aviso prévio indenizado [VERIFICAR STJ,
REsp 1.230.957/RS, Tema 478], férias indenizadas e respectivo terço (art. 28, §9º,
da Lei 8.212/91), multa de 40%, multas dos arts. 467 e 477 e indenizações em geral.
O 13º tem base de cálculo própria, apartada da remuneração mensal.

**IRRF.** Regime de rendimentos recebidos acumuladamente — RRA (art. 12-A da Lei
7.713/88): a base tributável é dividida pelo número de competências e a tabela mensal
é aplicada ao resultado, multiplicando-se o imposto pelo mesmo número de meses.

Não incidem: aviso prévio indenizado (Súmula 215 do STJ), férias indenizadas e terço
(Súmula 386 do STJ), FGTS e multa de 40%.

O redutor da Lei 15.270/2025 (isenção efetiva até R$ 5.000,00 mensais e redução
decrescente até R$ 7.350,00) fica **desativado por padrão no RRA**, porque sua
aplicação a rendimentos acumulados é controvertida [VERIFICAR]. Ative com
`aplicarRedutorLei15270: true` se optar pela tese.

---

## 6. Honorários

`percentual × total bruto atualizado`. Padrão de 15%. Honorários sucumbenciais seguem
a faixa de 5% a 15% do art. 791-A da CLT, fixados na sentença — não são estimados aqui.
