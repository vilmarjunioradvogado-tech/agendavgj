# Índices e tabelas — vigência e fontes

Aferição desta versão: **13/08/2026**. Toda alteração deve registrar fonte e data.

## Salário mínimo nacional
| Ano | Valor |
|---|---|
| 2026 | R$ 1.621,00 |
| 2025 | R$ 1.518,00 |
| 2024 | R$ 1.412,00 |
| 2023 | R$ 1.320,00 |
| 2022 | R$ 1.212,00 |
| 2021 | R$ 1.100,00 |

Anos anteriores a 2017 não estão na tabela: o motor lança erro em vez de estimar.

## INSS 2026 — Portaria Interministerial MPS/MF nº 13/2026
| Faixa | Alíquota |
|---|---|
| até R$ 1.621,00 | 7,5% |
| de R$ 1.621,01 a R$ 2.902,84 | 9% |
| de R$ 2.902,85 a R$ 4.354,27 | 12% |
| de R$ 4.354,28 a R$ 8.475,55 | 14% |

Teto de contribuição: R$ 8.475,55. Desconto máximo: R$ 988,09.
Cálculo progressivo, faixa a faixa — nunca alíquota única sobre o total.

Tabelas de 2025 e 2024 conferidas. **Tabelas de 2023, 2022 e 2021 marcadas `[VERIFICAR]`
em `indices.mjs`**: foram inseridas para permitir a apuração mês a mês de competências
antigas, mas não foram conferidas em portaria nesta versão.

## IRRF 2026 — tabela progressiva mensal
| Base de cálculo | Alíquota | Parcela a deduzir |
|---|---|---|
| até R$ 2.428,80 | isento | — |
| de R$ 2.428,81 a R$ 2.826,65 | 7,5% | R$ 182,16 |
| de R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 394,16 |
| de R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 675,49 |
| acima de R$ 4.664,68 | 27,5% | R$ 908,73 |

Dedução por dependente: R$ 189,59. Desconto simplificado mensal: R$ 607,20.

**Redutor da Lei 15.270/2025:** isenção integral até R$ 5.000,00 de rendimento
tributável mensal; redução decrescente até R$ 7.350,00, pela fórmula
`978,62 − 0,133145 × rendimento`. Desativado por padrão no regime RRA.

A continuidade das faixas foi validada no autoteste: nos limites de R$ 2.826,65,
R$ 3.751,05 e R$ 4.664,68 as duas alíquotas produzem o mesmo imposto. Se uma alteração
futura quebrar essa identidade, a tabela foi digitada errado.

## SELIC — BCB/SGS série 4390 (acumulada no mês)
Série embarcada de janeiro/2012 a **julho/2026** (último mês fechado na data de aferição).
Agosto/2026 foi descartado por ser mês incompleto.

Atualização: `node scripts/atualizar-indices.mjs` (exige rede liberada para
`api.bcb.gov.br`). Depois, obrigatoriamente `node scripts/testar.mjs`.

Endpoint: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json&dataInicial=01/01/2012&dataFinal=31/12/2026`

Outras séries úteis: 226 (TR mensal), 188 (INPC), 433 (IPCA).
Para o IPCA-E da fase pré-judicial da ADC 58, o caminho seguro é a **Tabela Única de
Atualização Monetária do CSJT**, informada pelo campo `fatorIpcaEPreJudicial`.

## Constantes
| Constante | Valor | Fundamento |
|---|---|---|
| FGTS | 8% | art. 15 da Lei 8.036/90 |
| Multa do FGTS | 40% / 20% no art. 484-A | art. 18 da Lei 8.036/90 |
| Aviso prévio | 30 dias + 3 por ano, teto 90 | art. 487 CLT; Lei 12.506/2011 |
| Terço de férias | 1/3 | art. 7º, XVII, CF |
| DSR | 6/26 | Súmula 172 do TST |
| Adicional noturno | 20%; hora ficta de 52min30s | art. 73 CLT |
| Insalubridade | 10% / 20% / 40% do mínimo | art. 192 CLT; SV 4 do STF |
| Periculosidade | 30% do salário base | art. 193 CLT |
| Intervalo intrajornada | 50%, indenizatório | art. 71, §4º, CLT |
