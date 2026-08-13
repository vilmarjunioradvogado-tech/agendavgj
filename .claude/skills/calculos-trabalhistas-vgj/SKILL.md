---
name: calculos-trabalhistas-vgj
description: >
  Calcula e estima créditos trabalhistas brasileiros com motor determinístico em Node.js,
  no estilo PJe-Calc: verbas rescisórias de todas as modalidades, horas extras, DSR,
  adicional noturno, intervalo intrajornada, insalubridade, periculosidade, diferenças
  salariais, reflexos em 13º/férias/FGTS, multa de 40%, multas dos arts. 467 e 477 da CLT,
  prescrição quinquenal e bienal, atualização mês a mês pela SELIC, INSS na alíquota
  marginal e IRRF no regime RRA. Use SEMPRE que houver pedido de cálculo, estimativa,
  liquidação, impugnação de cálculo, "quanto vale essa ação", "quanto o cliente recebe",
  planilha de rescisão, valor da causa trabalhista ou conferência de conta de perito —
  ainda que o usuário não use a palavra "cálculo". Gera memória de cálculo aberta,
  CSV e relatório HTML na identidade VGJ pronto para PDF.
---

# Cálculos trabalhistas — SISTEMA VGJ

## Regra Zero

**Nunca calcule por inferência.** Toda aritmética é delegada a `scripts/motor.mjs`.
O papel do assistente é: extrair dados → montar o `caso.json` → executar o motor →
apresentar a saída e os pontos de atenção. Se um parâmetro obrigatório faltar, o motor
para com erro — não invente valor nem "estime por alto".

Nunca apresente resultado sem apresentar os `avisos` retornados. Eles são a parte do
cálculo que protege a peça.

## Ordem de execução

1. `node scripts/testar.mjs` — se qualquer teste falhar, **pare** e corrija antes de calcular.
2. Montar o `caso.json` (esquema abaixo) a partir dos dados do usuário.
3. `node scripts/motor.mjs caso.json` — leitura no terminal.
4. `node scripts/relatorio.mjs caso.json --dir <pasta>` — CSV + HTML.
   Acrescente `--cliente` para suprimir a memória técnica e entregar só o quadro-resumo.
5. Apresentar: quadro-resumo, os três a cinco pontos de atenção mais relevantes e a
   ressalva de que é estimativa.

Se a SELIC estiver desatualizada (aviso de competência faltante), rodar
`node scripts/atualizar-indices.mjs` e repetir o passo 1.

## Intake — o que perguntar

Pergunte em **bloco único**, nunca uma pergunta por vez. Se o usuário anexar TRCT,
CTPS, extrato de FGTS, cartões de ponto ou ficha financeira, extraia primeiro e
pergunte só o que faltou.

**Sempre obrigatório:** admissão, rescisão (ou data-base), último salário, modalidade
da rescisão, situação do aviso prévio.

**Pergunte se houver indício:** períodos de férias já gozados, faltas injustificadas,
saldo do extrato de FGTS, horas extras por mês e divisor, horas noturnas, minutos de
intervalo suprimidos, grau de insalubridade ou periculosidade, diferenças salariais,
data de ajuizamento e de citação, percentual de honorários contratuais, dependentes
para IR.

**Não pergunte** o que dá para inferir do documento anexado nem o que não muda o
resultado do pedido feito.

## Esquema do caso.json

```json
{
  "processo": "0000737-39.2026.5.05.0612",
  "reclamante": "Nome",
  "reclamada": "Empresa Ltda.",
  "contrato": {
    "admissao": "2021-03-15",
    "rescisao": "2026-06-10",
    "salarioBase": 3000,
    "modalidade": "sem_justa_causa | justa_causa | pedido_demissao | acordo_484a | rescisao_indireta | termino_contrato",
    "avisoPrevio": "indenizado | trabalhado | nao_cumprido | dispensado",
    "periodosAquisitivosGozados": 4,
    "faltasInjustificadas": 0,
    "saldoFgtsDepositado": 20000,
    "fgtsRecolhido": true,
    "dependentesIR": 0,
    "historicoSalarial": [{ "desde": "2021-03", "salario": 2200 }, { "desde": "2024-01", "salario": 3000 }]
  },
  "postulacoes": {
    "competenciaInicial": "2021-07",
    "competenciaFinal": "2026-06",
    "horasExtras": { "divisor": 220, "he50PorMes": 20, "he100PorMes": 0, "adicional50": 0.5 },
    "adicionalNoturno": { "horasPorMes": 30, "aplicarHoraFicta": true },
    "intervaloIntrajornada": { "horasPorMes": 11 },
    "insalubridade": { "grau": "medio", "base": "salario_minimo" },
    "periculosidade": false,
    "diferencasSalariais": { "valorMensal": 400 },
    "multa477": true,
    "multa467": false,
    "danoMoral": 0
  },
  "processual": {
    "ajuizamento": "2026-07-01",
    "citacao": "2026-07-20",
    "dataAtualizacao": "2026-08-13",
    "regimeAtualizacao": "selic | adc58 | sem",
    "fatorIpcaEPreJudicial": null,
    "aplicarRedutorLei15270": false,
    "considerarRemuneracaoJaPaga": true,
    "prescricaoQuinquenal": true,
    "honorariosPercentual": 15
  }
}
```

Campos ausentes assumem os padrões documentados em `references/fundamentos.md`.
`saldoFgtsDepositado` ausente força estimativa e dispara aviso — sempre peça o extrato.

## Regime de atualização — decisão consciente

O motor não escolhe sozinho. Padrão é `selic`: SELIC acumulada mês a mês da competência
seguinte ao vencimento até o último mês fechado, sem cumular índice de correção
(EC 113/2021). Use `adc58` quando o título fixar o critério faseado da ADC 58 —
nesse caso informe `citacao` e o `fatorIpcaEPreJudicial` extraído da Tabela Única do
CSJT, sob pena de subestimar o crédito. Use `sem` para valor histórico.

Qualquer saída deve dizer **qual regime foi aplicado e a partir de que data**. É o
ponto que a parte contrária ataca primeiro.

## Limites que o assistente deve declarar

- É estimativa. Não substitui liquidação, conta de perito nem PJe-Calc oficial.
- FGTS estimado ignora a correção da conta vinculada — sempre inferior ao real.
- Reflexos de 13º e férias usam média anual sobre avos do ano-calendário; a apuração
  mês a mês do PJe-Calc pode divergir em alguns reais por competência.
- Normas coletivas (adicional convencional, divisor, base de insalubridade, pisos)
  prevalecem sobre os padrões legais — informe-as pelos campos do esquema.
- Tabelas de INSS anteriores a 2024 estão marcadas `[VERIFICAR]` em `indices.mjs`.

## Referências

- `references/fundamentos.md` — fórmula, fundamento legal e critério adotado em cada rubrica.
- `references/indices.md` — tabelas vigentes, fontes oficiais e como atualizar.
