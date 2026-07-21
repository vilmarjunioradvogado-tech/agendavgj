# Como usar o Sistema A.L.A. — Guia do Dia a Dia

## Configuração inicial (faça uma vez)

### Passo 1 — Preencha o contexto do escritório
Abra `/kit-juridico/contexto-do-escritorio.md` e preencha todos os campos.
Este arquivo é a "memória" que personaliza todas as entregas.

### Passo 2 — Configure o Claude
1. Baixe o [Claude Desktop](https://claude.ai/download) (gratuito)
2. Crie um **Projeto** no Claude Desktop
3. Cole o conteúdo de `CLAUDE.md` nas instruções do projeto
4. Opcionalmente, adicione o contexto do escritório como documento do projeto

### Passo 3 — Teste com um pedido simples
Abra o Claude e escreva:
> "Cria um post sobre prazo prescricional trabalhista para o Instagram"

Se o Claude responder com um post formatado, está funcionando.

---

## Comandos do dia a dia

### Criar post para Instagram
```
Cria um post [carrossel/imagem única/Reels] sobre [tema] para o Instagram
```

Exemplos:
- "Cria um carrossel sobre os direitos do trabalhador demitido sem justa causa"
- "Cria um post sobre prazo para reclamar produto com defeito"
- "Roteiro de Reels sobre o que fazer quando o plano de saúde nega"

---

### Responder WhatsApp de cliente
```
Redige resposta para esse WhatsApp de cliente: [cole a mensagem do cliente]
```

Exemplos:
- "Redige resposta: 'Olá, fui demitido hoje. Tenho direito a alguma coisa?'"
- "Cliente perguntou isso: [mensagem]. Redige resposta qualificando para consulta."

---

### Gerar proposta de honorários
```
Gera proposta de honorários para: [descreva o caso brevemente]
```

Exemplos:
- "Gera proposta: trabalhista, demissão sem justa causa, 3 anos de empresa, sem aviso prévio, valor estimado R$15k"
- "Proposta para divórcio consensual, sem filhos, apartamento a partilhar"

---

### Montar calendário de conteúdo
```
Monta calendário de conteúdo para [período] focado em [área]
```

Exemplos:
- "Monta calendário da semana focado em direito do consumidor, 4 posts"
- "Calendário de agosto com mix de trabalhista e previdenciário"

---

### Criar mensagem de follow-up
```
Cria follow-up para: [situação do lead/cliente]
```

Exemplos:
- "Follow-up para cliente que consultou há 3 dias sobre trabalhista e não respondeu"
- "Mensagem de reativação para contato de 2 meses atrás"

---

### Escrever artigo educativo
```
Escreve artigo sobre [tema] para [LinkedIn/blog]
```

Exemplos:
- "Artigo sobre o que é vício oculto e como reclamar, para LinkedIn"
- "Texto educativo sobre pensão alimentícia para o blog"

---

### Criar roteiro de vídeo
```
Roteiro de Reels sobre [tema], [duração]
```

Exemplos:
- "Roteiro de Reels de 45 segundos sobre FGTS depois de demissão sem justa causa"
- "Roteiro de vídeo longo (10 min) sobre como fazer inventário"

---

### Relatório de andamento para cliente
```
Gera relatório de andamento para o cliente [nome]:
- Processo: [número]
- Status atual: [descreva]
- Próximos passos: [descreva]
```

---

## Ativando agentes específicos

Para tarefas complexas, carregue o arquivo do agente correspondente no Claude:

| Tarefa | Arquivo |
|--------|---------|
| Posts Instagram/LinkedIn | `/agentes/social-media.md` |
| WhatsApp | `/agentes/whatsapp.md` |
| Propostas | `/agentes/proposta.md` |
| Calendário | `/agentes/calendario.md` |
| Artigos/conteúdo | `/agentes/conteudo.md` |
| Follow-up | `/agentes/followup.md` |
| Anúncios | `/agentes/anuncio.md` |
| Relatórios | `/agentes/relatorio.md` |
| Vídeos | `/agentes/video.md` |

---

## Fluxo ideal de uma semana

**Segunda-feira (15 min):**
- Pede o calendário da semana
- Aprova as pautas

**Terça a quinta (10 min cada):**
- Pede o post do dia baseado no calendário
- Revisa, ajusta se necessário
- Publica

**Ao longo da semana (2-5 min por lead):**
- Copia mensagem do WhatsApp
- Pede a resposta ao Claude
- Revisa e manda para o cliente

**Quando chega lead de consulta:**
- Pede proposta com os dados do caso
- Envia ao cliente

**Quando cliente some:**
- Pede follow-up adequado para a situação

---

## Regras de ouro

1. **Sempre revise antes de enviar** — especialmente propostas e respostas de WhatsApp
2. **Personalize o mínimo** — nome, área, valor — antes de enviar
3. **O Claude é o rascunhador, você é o autor** — sua voz final sempre prevalece
4. **Preencha o contexto do escritório** — quanto mais detalhado, menos você edita

---

## Problemas comuns

**"O post ficou genérico"**
→ Preencha o contexto do escritório e peça novamente mencionando sua cidade e especialidade

**"A proposta não tem o valor certo"**
→ Informe o valor desejado: "Gera proposta com honorários de 30% e adiantamento de R$500"

**"O WhatsApp ficou muito formal"**
→ Adicione no pedido: "tom informal, como se fosse uma conversa"

**"O post não segue as regras da OAB"**
→ Carregue o arquivo `/kit-juridico/restricoes-oab.md` e peça revisão
