# Playbook: Atendimento Inicial / Intake de Lead

**Delegável?** SIM (triagem automatizada) — Júlia executa, Vilmar fecha contrato

## O que envolve

Primeiro contato via WhatsApp: identificar o problema, qualificar o lead,
marcar consulta ou descartar educadamente.

## Fluxo atual (quando Júlia estiver em produção)

1. **Júlia (agente WhatsApp)** recebe a mensagem, classifica em 4 rotas:
   - `CASO_POTENCIAL` → registra lead, oferece agendamento
   - `CLIENTE_ATIVO` → notifica Vilmar diretamente
   - `CONSULTA_RAPIDA` → responde e encerra
   - `DESCARTE` → declina educadamente

2. **Vilmar recebe** o resumo do lead qualificado e confirma ou não a consulta

3. **Consulta** (30–60 min, paga ou cortesia conforme política) — exclusivo Vilmar

4. **Proposta** — Vilmar apresenta condições, honorários, forma de pagamento

5. **Contrato** — Vilmar assina digitalmente, cliente assina (DocuSign ou equivalente)

## O que Vilmar não delega aqui

- A consulta em si
- A decisão de aceitar ou recusar o caso
- A precificação dos honorários
- A assinatura do contrato

## Status atual

Júlia está construída mas **bloqueada**: o arquivo `prompts/julia-vgj.txt` é um placeholder.
**Ação necessária: escrever o prompt real da Júlia** (≈ 1–2 horas).

## Checklist handoff Júlia → Vilmar

- [ ] Nome e contato do lead
- [ ] Problema narrado em 1–2 frases
- [ ] Área do direito identificada (Consumidor / Digital / Saúde)
- [ ] Urgência percebida (prazo judicial, internação, etc.)
- [ ] Lead já qualificado (tem caso, tem interesse, tem condição de contratar)
