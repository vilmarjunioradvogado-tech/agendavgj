# Módulo 2 — Peças e análise documental com IA

**Pré-requisito:** Módulo 1 (segurança, anonimização e prompts).
**Carga sugerida:** 4 aulas · ~3h de vídeo + exercícios com autos-modelo.
**Resultado esperado:** o aluno analisa processos longos, produz fichamentos padronizados e constrói peças completas com IA — mantendo controle total sobre mérito, fontes e estilo.

---

## Aula 1 — Análise de processos e documentos longos

### Objetivos
- Enviar documentos extensos (PDFs de autos, contratos, laudos) para análise com método.
- Entender limites de contexto e como dividir material grande sem perder o fio.
- Extrair exatamente o que interessa com "leitura dirigida".

### Conteúdo

**1. Antes de enviar: o checklist de 30 segundos**
- O documento é público ou está anonimizado? (Módulo 1, Aula 3)
- Está legível? PDF escaneado de má qualidade → passe OCR antes, ou a análise sai ruim.
- O que exatamente eu quero saber? Enviar autos com "me diga o que tem aí" desperdiça a ferramenta.

**2. Janela de contexto: o "fôlego" da IA**
Cada modelo lê uma quantidade limitada de texto por conversa. Processos de milhares de páginas precisam de estratégia:
- **Divida por blocos lógicos**, não por tamanho: inicial + documentos do autor / contestação + documentos do réu / decisões / laudos.
- **Peça um sumário de cada bloco** e cole os sumários numa conversa final de síntese.
- **Comece pelo que decide**: sentença e decisões interlocutórias primeiro; o resto vira consulta dirigida.

**3. Leitura dirigida: perguntas certas para autos**
Em vez de "resuma", pergunte:
- "Quais os pedidos da inicial e o que a contestação respondeu a cada um? Monte uma tabela pedido × defesa."
- "Liste todas as datas relevantes com a folha/ID do documento em que aparecem."
- "Quais provas cada parte produziu e o que cada uma pretende demonstrar?"
- "Aponte contradições entre o depoimento de fls. X e o documento de fls. Y."
- "O que ainda não foi decidido e está pendente?"

**4. A regra da referência localizável**
Sempre peça: *"para cada afirmação, indique a página/ID do documento de origem"*. Isso transforma a resposta em ferramenta de trabalho conferível — e revela na hora se a IA inventou algo.

### Demonstração em vídeo (roteiro)
Subir um processo-modelo (fictício, ~150 páginas), aplicar o bloco de perguntas dirigidas, conferir duas referências de página ao vivo (uma correta, e mostrar como reagir se uma vier errada).

### Exercício do aluno
Com os autos-modelo do curso, produza: tabela pedido × defesa, linha do tempo com referências e lista de pendências. Compare com o gabarito.

---

## Aula 2 — Sumarização e fichamento jurídico padronizado

### Objetivos
- Criar fichas de processo padronizadas que qualquer pessoa do escritório entende.
- Montar linha do tempo, quadro de provas e resumo executivo para o cliente.
- Padronizar: o mesmo prompt gera a mesma ficha para qualquer processo.

### Conteúdo

**1. A ficha de processo do escritório (modelo do curso)**
Estrutura fixa que a IA preenche a partir dos autos:

```
FICHA DE PROCESSO
1. Identificação: nº (anonimizado no prompt), vara, fase atual
2. Partes e advogados (papéis, não nomes reais no prompt)
3. Objeto em uma frase
4. Pedidos e valores
5. Linha do tempo (data · evento · fls./ID)
6. Quadro de provas (prova · quem produziu · o que demonstra)
7. Decisões já proferidas e resultado de cada uma
8. Pendências e próximos prazos prováveis
9. Riscos e pontos de atenção
10. Estratégia sugerida (rascunho para o advogado avaliar)
```

**2. Três saídas do mesmo fichamento**
Do mesmo material, peça três produtos:
- **Ficha técnica** (acima) — uso interno.
- **Resumo executivo para o cliente** — 15 linhas, sem juridiquês, com "o que acontece agora".
- **Briefing de audiência** — pontos fortes, pontos fracos, perguntas prováveis, documentos para levar.

**3. Sumarização de depoimentos e atas**
Prompt-chave: *"Para cada depoente: o que afirmou de relevante, em que pontos confirma ou contradiz os demais, e trechos literais que merecem citação (entre aspas, com localização)."*

**4. Fichamento de jurisprudência e doutrina para tese**
Ao estudar um tema: peça ficha por julgado (tribunal, resultado, ratio decidendi, distinções do seu caso). **Todo julgado vai para a conferência na fonte antes de entrar na peça** — o fichamento organiza, não substitui a pesquisa nos sites oficiais e nas bases confiáveis.

### Demonstração em vídeo (roteiro)
Gerar a ficha completa do processo-modelo, depois derivar o resumo para cliente e o briefing de audiência na mesma conversa — mostrando o poder do contexto acumulado.

### Exercício do aluno
Fiche um processo real seu (anonimizado) com o modelo do curso. Meça o tempo: a meta é sair de horas para minutos.

---

## Aula 3 — Construção de peças processuais com IA

### Objetivos
- Dominar o fluxo em etapas: análise → esqueleto → redação por blocos → montagem.
- Usar modelos do próprio escritório para a IA escrever "no seu estilo".
- Produzir petição inicial, contestação e recurso com qualidade e controle.

### Conteúdo

**1. Por que não pedir "escreva a petição" de uma vez**
Peça longa gerada em bloco único tende a ser genérica, rasa nos fundamentos e com "cara de IA". O fluxo profissional é em etapas — cada uma revisada antes da seguinte:

```
ETAPA 1 · Análise      → "Com estes fatos, quais as teses viáveis e seus riscos?"
ETAPA 2 · Estratégia   → O ADVOGADO decide teses, pedidos e tom. (Não delegue.)
ETAPA 3 · Esqueleto    → "Monte o roteiro da peça com as teses A e B: tópicos e o que vai em cada um."
ETAPA 4 · Redação      → Um bloco por vez: fatos → cada fundamento → pedidos.
ETAPA 5 · Montagem     → Unir, uniformizar o tom, revisar transições.
ETAPA 6 · Conferência  → Checklist da Aula 4 + fontes verificadas.
```

**2. Ensine seu estilo à IA (few-shot com peças do escritório)**
Cole uma peça sua (anonimizada) e instrua: *"Esta é a estrutura e o tom do meu escritório. Siga exatamente este padrão de títulos, este nível de formalidade e este modo de citar dispositivos."* O resultado muda de patamar — a peça sai com a sua cara, não com a cara da ferramenta.

**3. Blocos que a IA redige melhor (com sua supervisão)**
- **Dos fatos**: a partir da cronologia do fichamento — narrativa clara e ordenada.
- **Fundamentos "de tese consolidada"**: estrutura argumentativa sólida; você insere a jurisprudência que **você** pesquisou e conferiu.
- **Pedidos**: a partir das teses — revisar exaustivamente (é o coração da peça).
- **Contrarrazões ponto a ponto**: cole o argumento adverso e peça a refutação estruturada.

**4. Peças trabalhadas no módulo (uma por demonstração)**
- Petição inicial cível (cobrança/indenização).
- Contestação com preliminares e mérito.
- Recurso: estrutura de apelação com tópicos de reforma.
- *Bônus da Formação Completa: as 4 peças construídas em vídeo do início ao fim.*

### Demonstração em vídeo (roteiro)
Construir uma inicial completa pelo fluxo de 6 etapas, em tempo real, a partir do caso-modelo — incluindo o momento "a IA sugeriu tese frágil e eu descartei", que ensina mais do que o acerto.

### Exercício do aluno
Construa a contestação do caso-modelo pelo fluxo de 6 etapas. Entregue também as respostas da Etapa 1 anotadas com o que você acatou e o que descartou (isso vale mais que a peça).

---

## Aula 4 — Revisão, conferência e controle de qualidade

### Objetivos
- Instalar o checklist final que blinda a peça antes do protocolo.
- Saber verificar citações legais e jurisprudenciais com eficiência.
- Usar a IA contra ela mesma: revisão adversarial.

### Conteúdo

**1. O checklist pré-protocolo do curso**

```
CONFERÊNCIA DE FONTES
[ ] Todo dispositivo legal citado foi aberto e lido na fonte (texto vigente)
[ ] Toda jurisprudência foi localizada no site do tribunal (nº, relator, data, teor)
[ ] Nenhuma citação "órfã" (que só existe na resposta da IA) permaneceu

MÉRITO E ESTRATÉGIA
[ ] As teses são as que EU decidi na Etapa 2
[ ] Os pedidos cobrem tudo e não pedem nada indevido
[ ] Valores, datas e nomes conferidos com os autos reais (fora da IA)

FORMA
[ ] Dados reais das partes reinseridos corretamente (destrocar a anonimização!)
[ ] Endereçamento, qualificação, valor da causa, requerimentos finais
[ ] Formatação no padrão do escritório
```

**2. Revisão adversarial: a IA como advogado do ex adverso**
Antes de protocolar, abra conversa nova e cole a peça (anonimizada): *"Você é o advogado da parte contrária. Ataque esta peça: aponte fragilidades, contradições e as preliminares que você levantaria."* Corrija o que procede. É a revisão mais barata que existe — e frequentemente a mais útil.

**3. O erso mais perigoso: a troca esquecida**
Quem anonimiza precisa **des-anonimizar** com atenção: "AUTOR" esquecido no meio da peça, ou pior, o substituto fictício protocolado. Busca final por todos os termos da tabela de substituição, sempre.

**4. Rotina de melhoria contínua**
- Peça devolvida com ressalva do juiz? Alimente seu documento "Meus prompts" com a correção.
- Compare de tempos em tempos: peça sua antiga × peça no fluxo novo. A evolução é o argumento definitivo para o método.

### Demonstração em vídeo (roteiro)
Aplicar o checklist completo na inicial da Aula 3, rodar a revisão adversarial ao vivo e acatar duas críticas procedentes.

### Encerramento do módulo
- O aluno agora domina: autos longos → fichamento → peça completa → conferência.
- Ponte para o Módulo 3: "tudo o que você fez manualmente aqui pode virar fluxo permanente do escritório — é o que vamos automatizar."
