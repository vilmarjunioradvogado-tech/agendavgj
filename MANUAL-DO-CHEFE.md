# 📖 Manual do Chefe — Seu Super Funcionário Digital

**Dr. Vilmar, este guia é para o senhor.** Aqui está tudo o que o curso de
R$ 232 prometia ensinar — já montado e funcionando.

## O que é isso?

Este repositório É o seu funcionário digital. Toda vez que o senhor abre o
Claude Code neste projeto (`agendavgj`), o funcionário "bate o ponto": ele lê
automaticamente as instruções (`CLAUDE.md`), a memória do escritório
(`base-de-conhecimento/`) e as habilidades dele (`.claude/skills/`).

O senhor não precisa saber programar. Basta **conversar** — em português,
como falaria com um estagiário muito competente.

## O que ele já sabe fazer

| Pedido | O que acontece |
|---|---|
| "bom dia" ou "minha agenda" | Resumo do dia: compromissos, prazos, audiências e e-mails urgentes |
| "marque reunião com [cliente] quinta às 15h" | Cria o evento no Google Calendar, verificando conflitos |
| "veja meus e-mails" | Triagem: urgentes 🔴, importantes 🟡, resto ⚪ |
| "rascunhe resposta para o e-mail do [cliente]" | Cria rascunho no Gmail (nunca envia sozinho) |
| "faça uma petição inicial de [assunto]" | Gera o .docx completo no timbre do escritório |
| "crie um post sobre [tema]" | Post pronto: texto, legenda, hashtags e sugestão de arte |
| "conteúdo da semana" | 5 posts completos de uma vez |
| "crie uma landing page para [serviço]" | Página profissional pronta, com animações e botão de WhatsApp |
| "novo cliente: [nome]" | Ficha do cliente + sugestão de agendamento |

## Como dar boas ordens (o segredo do curso em 4 regras)

1. **Diga o resultado, não o processo.** ❌ "abra o calendar e clique em..."
   ✅ "marque a audiência do João para dia 25 às 14h no fórum de Contagem"
2. **Dê contexto.** Quanto mais ele sabe, melhor entrega. "post sobre hora extra"
   é bom; "post sobre hora extra para atrair trabalhadores da construção civil" é ótimo.
3. **Peça ajuste sem medo.** "muito formal, deixa mais leve", "encurta", "troca o título".
   Ele refaz quantas vezes precisar, sem reclamar.
4. **Ensine uma vez, use para sempre.** Diga "anote na base de conhecimento que
   [informação]" ou "toda vez que eu pedir X, faça Y" — ele grava e vira rotina.

## Primeira tarefa recomendada

Diga ao funcionário:

> "Vamos preencher a base de conhecimento. Me pergunte tudo o que precisa saber
> sobre o escritório."

Ele vai entrevistar o senhor (áreas de atuação, OAB, diferenciais, público) e
preencher os arquivos sozinho. Depois disso, todo conteúdo, site e e-mail sai
personalizado.

## Criando novas habilidades

Quando o senhor perceber que repete um tipo de pedido, diga:

> "Transforme isso numa habilidade sua: toda vez que eu pedir [X], faça [passo a passo]."

Ele mesmo cria a skill nova — o funcionário se treina sozinho.

## Limites de segurança (já configurados)

- ✅ Nunca envia e-mail/mensagem sem sua aprovação — só rascunhos
- ✅ Nunca inventa lei, jurisprudência ou dado de processo
- ✅ Segue as regras de publicidade da OAB (Provimento 205/2021)
- ✅ Não expõe dados de clientes

## Onde ficam as entregas

- `producao/conteudo/` — posts e conteúdos criados
- `producao/clientes/` — fichas de clientes
- `site/` — páginas criadas (já tem uma pronta de demonstração!)
- Petições — geradas em .docx e enviadas na conversa
