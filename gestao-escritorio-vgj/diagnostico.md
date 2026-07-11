# Diagnóstico — Escritório VGJ
*Gerado em: 11 de julho de 2026*

---

## Inventário Real do Repositório

### O que existe (em código, neste repositório)

| Projeto | Pilar | Status |
|---|---|---|
| Site institucional (Next.js) | Comercial / Aquisição | Pronto — aguardando merge PR #1 |
| Júlia — recepcionista WhatsApp (Python/FastAPI) | Atendimento / CRM | Construído, **bloqueado** (prompt ausente) |
| Dashboard Executivo (Streamlit) | Decisão / Governança | Criado agora (ver `dashboard-executivo/`) |
| Playbooks de Delegação | Pessoas / Delegação | Criado agora (ver `playbooks-delegacao/`) |
| Ritual Semanal | Decisão / Governança | Criado agora (ver `ritual-semanal.md`) |

### O que não existe

| Pilar | Situação |
|---|---|
| Jurídico-Operacional | **Zero** — sem painel de prazos, sem integração DJEN/DataJud |
| Financeiro | **Zero** — nenhum registro de honorários, custo fixo, fluxo de caixa |

---

## Qual pilar está mais atrasado?

**Financeiro.**

Não é o mais fraco por ser difícil — é o mais fraco porque nunca foi iniciado.
Os outros pilares têm ao menos um sistema construído (mesmo que bloqueado).
O financeiro não tem absolutamente nada: nenhum número, nenhum registro,
nenhuma consciência de quanto está a receber ou qual é o custo fixo mensal.

Um escritório sem dados financeiros não tem gestão — tem sensação de gestão.

---

## Qual ação (máx. 2 horas) resolve a maior parte desse atraso?

### Ação: Primeiro preenchimento do dashboard financeiro

**Tempo estimado: 90 minutos**

1. **(10 min)** Rodar o dashboard: `pip install streamlit pandas && streamlit run gestao-escritorio-vgj/dashboard-executivo/app.py`

2. **(20 min)** Preencher os custos fixos reais na aba Financeiro:
   - Aluguel / coworking
   - Internet e celular
   - Software jurídico (Jusbrasil, gestão, etc.)
   - Marketing digital
   - Anuidade OAB (rateio mensal)

3. **(30 min)** Lançar todos os contratos ativos com valor e vencimento:
   - Cada cliente com honorário mensal: um lançamento recorrente
   - Cada honorário de êxito esperado: um lançamento estimado

4. **(20 min)** Lançar o que foi recebido neste mês (extrato bancário do escritório)

5. **(10 min)** Ler o resultado: saldo líquido, ponto de equilíbrio, inadimplência

Ao final desta sessão de 90 minutos você terá, pela primeira vez, a resposta para:
*"O escritório está cobrindo os custos este mês?"*

---

## Observações críticas (independentes do pilar)

### 1. Júlia está a 1–2 horas de funcionar

O arquivo `prompts/julia-vgj.txt` no branch `claude/julia-whatsapp-plugin-n4h41o`
é um placeholder. Toda a infraestrutura (FastAPI, testes, webhook, roteamento)
está pronta e testada. Escrever o prompt real da Júlia é a segunda ação de maior
retorno imediato.

### 2. O site precisa do número de WhatsApp real

Em `src/lib/constants.ts` o `SITE.whatsapp` está como `'31999999999'`.
Antes de mergear PR #1, substituir pelo número real do escritório.

### 3. Discrepância de OAB

O arquivo `main.py` da Júlia menciona OAB/BA 50.217 (Vitória da Conquista/BA).
O site diz OAB/MG (Belo Horizonte/MG). Um deles está errado — corrigir antes
de colocar qualquer sistema em produção.

---

## Próximas 4 semanas (sequência sugerida)

| Semana | Ação | Pilar | Tempo |
|---|---|---|---|
| Semana 1 | Preencher dashboard financeiro (esta ação) | Financeiro | 90 min |
| Semana 1 | Escrever prompt da Júlia + configurar .env | Atendimento/CRM | 2 h |
| Semana 2 | Mergear site + corrigir número WhatsApp | Comercial | 30 min |
| Semana 2 | Fazer o primeiro ritual semanal com dados reais | Governança | 30 min |
| Semana 3 | Lançar Júlia em produção (testar com número real) | Atendimento/CRM | 1 h |
| Semana 4 | Revisar dashboard com 4 semanas de dados | Governança | 30 min |

**Nenhuma dessas ações cria um sistema novo. Todas ativam o que já existe.**
