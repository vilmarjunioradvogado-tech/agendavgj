# calculos-trabalhistas-vgj

Skill de cálculo trabalhista com motor determinístico, para uso interno do escritório.

## Instalação

Claude Code:
```bash
cp -r calculos-trabalhistas-vgj ~/.claude/skills/
```

Claude.ai: Personalizar → Habilidades → enviar o arquivo `.zip`.

Requisito: Node.js 18 ou superior. Nenhuma dependência externa.

## Uso

```bash
node scripts/testar.mjs                                  # 39 asserções — rode sempre primeiro
node scripts/motor.mjs meu-caso.json                     # leitura no terminal
node scripts/motor.mjs meu-caso.json --json              # saída estruturada
node scripts/relatorio.mjs meu-caso.json --dir ./saida   # CSV + HTML na identidade VGJ
node scripts/relatorio.mjs meu-caso.json --cliente       # sem a memória técnica
node scripts/atualizar-indices.mjs                       # rebaixa a SELIC do BCB
```

Comece copiando `evals/caso-teste.json`. O esquema completo está no `SKILL.md`.

## O que este motor não faz

Não substitui o PJe-Calc nem conta de liquidação homologada. FGTS sem extrato é
estimativa por baixo. Reflexos anuais usam média sobre avos do ano-calendário.
Normas coletivas precisam ser informadas pelos campos do esquema.
