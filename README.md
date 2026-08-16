# VGJ LAW — Sistema Operacional do Escritório

## ✍️ Copywriting Engine — como usar via chat (celular e computador)

O repositório inclui a skill **copywriting** (`.claude/skills/copywriting/`): um copywriter estratégico sênior com 30 módulos e 42 frameworks, incluindo modos específicos para publicidade da advocacia (OAB) e Direito da Saúde.

**Duas formas de usar:**

1. **Em qualquer conversa do Claude (recomendado)** — instale a skill na sua conta:
   app do Claude ou [claude.ai](https://claude.ai) → **Configurações → Recursos (Capabilities) → Skills → Carregar skill** → envie o arquivo `copywriting-skill.zip`. Depois disso, é só pedir copy em qualquer chat, no celular ou no computador.
2. **Em sessões do Claude Code neste repositório** — a skill já está instalada e ativa automaticamente (via `CLAUDE.md`): abra uma sessão no repositório `agendavgj` e digite `/auto` seguido do seu briefing, ou simplesmente peça o texto que precisa.

**Comandos principais:** `/auto` (cadeia completa — o principal) · `/copy` · `/oferta` · `/diagnostico` · `/critica` · `/ab` · `/juridico` · `/saude` · formatos: `/headline`, `/anuncio`, `/pagina`, `/email`, `/carrossel`, `/video`, `/whatsapp`.

---

CRM jurídico com **agente de IA autônomo** que opera o sistema: identifica o cliente no WhatsApp, faz triagem por área, qualifica, coleta e organiza documentos, movimenta o funil, agenda, cria tarefas e entrega um **resumo estruturado para o advogado** — encaminhando para análise humana tudo que exige decisão jurídica.

```
CLIENTE → WHATSAPP → AGENTE DE IA → IDENTIFICAÇÃO → TRIAGEM → QUALIFICAÇÃO
→ DOCUMENTOS → CRM/FUNIL → TAREFAS → AGENDA → RESUMO → VILMAR DECIDE
→ EXECUÇÃO → ACOMPANHAMENTO → PÓS-ATENDIMENTO
```

> **Identidade do produto:** VGJ LAW é o nome do produto (aplicação, instalador, título e identidade visual). "NAVE" permanece apenas como namespace interno do código (`window.NAVE`).

## Módulos

| Tela | O que faz |
|---|---|
| **Painel** | "O que precisa da minha atenção agora?" — aprovações, handoffs, tarefas vencidas, reuniões, prazos, conversão por origem |
| **Inbox** | Caixa de entrada unificada com filtros (IA atendendo, aguardando humano, urgente, sem resposta...), handoff IA↔humano explícito e resumo do caso na conversa |
| **Funil** | Kanban de demandas com estágios **editáveis** (novo contato → triagem → ... → concluído); mudanças disparam automações |
| **Clientes** | Contatos (PF, dedupe por telefone/CPF) e Empresas (PJ, N:N com contatos), com demandas, documentos, tarefas e histórico completo |
| **Agenda** | Slots por expediente, agendar/confirmar/remarcar/cancelar; o agente agenda sozinho quando o cliente pede |
| **Tarefas** | Central de tarefas + fila de **aprovações da IA** |
| **Jurídico / Financeiro** | Processos, prazos, contratos e parcelas (módulos originais preservados) |
| **Assistente** | IA com contexto real do escritório para textos e diagnósticos |
| **Sistema** | Automações configuráveis, fluxos de triagem por área, base de conhecimento, permissões da IA e **auditoria completa** |

## O agente de IA

- Opera por **ferramentas** (motor de ações): `find_contact`, `create_case`, `move_pipeline`, `request_document`, `create_appointment`, `handoff_to_human`, `generate_case_summary` etc. — cada ação é validada, autorizada e **auditada**.
- **Permissões por ferramenta** (Sistema → Permissões): *permitido*, *exige aprovação* (vira pendência para Vilmar) ou *bloqueado*. Ações críticas (petições, acordos, honorários, estratégia) não existem como ferramenta — são sempre humanas.
- **Identidade institucional neutra** — sem nome de pessoa, sem fingir ser humano; se perguntarem, informa que é o canal automatizado do escritório.
- **Regras anti-invenção**: nunca inventa jurisprudência, prazos, valores, andamentos ou documentos; na dúvida, registra e encaminha (conversa fica **AGUARDANDO VILMAR**).
- Triagem **configurável por área** (planos de saúde, consumidor, bancário, golpes, trabalhista, cível, empresarial, previdenciário...) com perguntas, documentos, critérios e gatilhos de handoff próprios.
- Grupos de WhatsApp nunca são atendidos.

## Automações (Sistema → Automações)

Novo lead → triagem · docs solicitados → "aguardando documentos" · documentação completa → avança estágio + tarefa de análise · reunião agendada → lembrete · reunião amanhã → confirmação ao cliente · cliente sem resposta → follow-up · docs pendentes há N dias → cobrança · prazo próximo → alerta · contratação → tarefas de estruturação · handoff → pendência para Vilmar. Todas editáveis/desativáveis, e é possível criar novas.

## Testes

```bash
npm test          # 12 cenários E2E (novo cliente, 2ª demanda, documentos, agenda,
                  # handoff, fora de escopo, Vilmar assume/conclui, funil, retorno,
                  # isolamento de demandas, aprovação humana) + persistência + UI
```

Os testes rodam com um "cérebro" de IA roteirizado (`window.__NAVE_TEST_BRAIN`) — exercitam o orquestrador, as ferramentas, as automações e a auditoria reais, sem depender de rede. O CI executa a suíte antes de gerar os instaladores. Localmente sem o pacote `playwright`: `PW_CHROMIUM=/caminho/para/chromium npm test`.

## Instalador / desenvolvimento

- **Instalador Windows**: aba **Actions → Build Desktop App** → artefato **VGJ-LAW-Windows** (gerado após os testes passarem). Tags `v*` anexam os binários a uma release.
- **Desenvolvimento**: `npm install && npm start` (Electron). O `app/index.html` também abre direto no navegador (dados no `localStorage`).

## Configuração (⚙ no app)

- **IA (Anthropic)** — chave `sk-ant-...` de [platform.claude.com](https://platform.claude.com/). Sem a chave, o agente e o assistente ficam desativados; todo o resto funciona.
- **WhatsApp (Zappfy)** — token/instância/número. **Sem a Zappfy o sistema roda em "modo local"**: use *Inbox → Simular mensagem* para demonstrar o fluxo completo. Este é o **único ponto do sistema que depende de credencial externa** além da chave de IA.
- **Agenda** — expediente e duração dos slots.

As credenciais ficam **apenas no arquivo local de dados** (`%APPDATA%\vgj-law\nave-data.json` no Windows) — nunca no código nem no repositório. Para backup, copie esse arquivo.

## Limitações conhecidas (por dependerem de serviço externo)

- **Atendimento 24/7 com o app fechado** exige um relay/backend público para webhook da Zappfy — a arquitetura já separa o adapter (`app/js/whatsapp.js`), mas o sistema não finge ter esse serviço; com o app aberto, o loop de sincronização opera o agente continuamente.
- **Transcrição de áudio** — áudios são registrados e marcados; a transcrição automática requer um serviço de STT (adapter identificado no código). O agente pede ao cliente para escrever quando recebe áudio.
