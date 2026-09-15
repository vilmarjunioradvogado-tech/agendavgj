# Instruções do projeto

## Redação de peças jurídicas

Toda peça escrita ou revisada aqui passa obrigatoriamente pela skill `humanizer`
(`.claude/skills/humanizer/SKILL.md`), incluindo a seção "Peças jurídicas (pt-BR)".
Vale para petição inicial, contestação, impugnação, réplica, recurso, agravo,
embargos, manifestação, parecer, notificação, contrato e procuração, mesmo quando
o pedido não menciona "humanizar".

Limites de estilo que não se negociam:

- Negrito no corpo do texto: no máximo uma expressão por parágrafo, reservada à
  tese, ao pedido, a um valor ou a um prazo decisivo. O negrito estrutural do
  padrão da casa (endereçamento, partes, títulos de seção, assinatura) permanece.
- Travessão: zero, sempre. Nenhum `—`, nenhum `–`. Vírgula, parênteses ou ponto final
  resolvem. Intervalo se escreve com "a" ("fls. 12 a 18").
- Dois-pontos: zero no texto corrido. A frase antes de uma lista termina em ponto.
  O sinal só sobrevive como separador de campo em bloco estruturado (quadro de
  requerimentos, síntese processual), onde é layout e não pontuação.
- Sem muletas repetidas ("cumpre destacar", "resta demonstrado", "nesse diapasão"),
  sem tríade de adjetivos, sem parágrafo de fecho genérico.

As mesmas duas proibições de pontuação estão gravadas nas skills de formatação,
para valerem também quando só uma delas for acionada:

- `tipografia-juridica`, padrão da casa (Times New Roman 12, justificado, 1,5).
- `padrao-masterclass`, padrão Masterclass (Segoe UI 11, versalete, quadro de requerimentos).

Divisão de trabalho: as skills de formatação cuidam da forma, a `humanizer` cuida do
texto. Nenhuma delas altera fonte, margem ou estrutura sem pedido expresso.
