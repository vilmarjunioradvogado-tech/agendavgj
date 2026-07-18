# Módulo 1 — Fundamentos: IA generativa com segurança e método

**Público:** advogados, estudantes e profissionais do Direito que nunca usaram (ou usam pouco) IA generativa.
**Carga sugerida:** 5 aulas · ~2h30 de vídeo + exercícios práticos.
**Resultado esperado:** ao final, o aluno usa IA no dia a dia jurídico com conta configurada de forma segura, prompts bem construídos e critérios claros do que pode e do que não pode ser delegado à ferramenta.

---

## Aula 1 — O que a IA generativa faz (e o que ela não faz) no Direito

### Objetivos
- Entender, sem tecnicismo, o que é um modelo de linguagem (LLM).
- Saber em que tarefas jurídicas a IA ajuda de verdade — e onde ela é perigosa.
- Conhecer o conceito de "alucinação" e por que ele importa mais para advogados do que para qualquer outra profissão.

### Conteúdo

**1. O que é um modelo de linguagem, em uma frase**
Um LLM (como Claude, ChatGPT ou Gemini) é um sistema treinado com enormes volumes de texto que aprende padrões de linguagem e os usa para **gerar texto novo** a partir do que você pede. Ele não "consulta um banco de dados de leis": ele **escreve** com base em padrões. Essa diferença explica tudo o que vem a seguir.

**2. O que a IA faz muito bem na advocacia**
- Resumir e organizar textos longos (decisões, contratos, depoimentos, autos).
- Estruturar raciocínios: montar esqueleto de peça, cronologia de fatos, quadro comparativo.
- Redigir primeiras versões: e-mails, notificações, cláusulas, relatórios ao cliente.
- Traduzir "juridiquês" para linguagem acessível ao cliente (e vice-versa).
- Revisar clareza, coesão, gramática e tom de textos prontos.
- Brainstorm de teses, argumentos e contra-argumentos.

**3. Onde a IA falha — e o advogado responde pelo erro**
- **Alucinação de jurisprudência**: a IA pode inventar número de processo, relator, tribunal e até ementa com aparência perfeitamente real. **Regra de ouro do curso: jurisprudência citada por IA só entra em peça depois de conferida na fonte oficial (site do tribunal).**
- **Direito desatualizado**: o modelo tem data de corte de treinamento. Lei nova, tese firmada ontem ou reforma recente podem não estar lá.
- **Nuance do caso concreto**: a IA não conhece o juiz da vara, o histórico do cliente nem a estratégia do processo — a não ser que você informe (com os cuidados do Módulo 1, Aula 3).
- **Cálculos e prazos**: sempre confira em ferramenta própria. IA erra conta com confiança.

**4. O papel do advogado não muda — muda a velocidade**
A IA é um estagiário brilhante, incansável e às vezes mentiroso: produz rascunhos excelentes em segundos, mas **tudo** passa pela revisão de quem assina. Quem assina responde — perante o cliente, a OAB e o juízo.

### Demonstração em vídeo (roteiro)
1. Pedir à IA um resumo de uma decisão real (anonimizada) — mostrar a qualidade.
2. Pedir "jurisprudência do STJ sobre [tema raro]" — mostrar uma citação e **conferir no site do STJ ao vivo**, evidenciando o risco.
3. Fechar com a regra de ouro.

### Exercício do aluno
Escolha um texto jurídico público (um acórdão de tribunal superior). Peça à IA: (a) um resumo em 10 linhas; (b) os 3 fundamentos centrais; (c) uma explicação da decisão para leigo. Compare com sua própria leitura.

---

## Aula 2 — Cadastro seguro e configurações de privacidade

### Objetivos
- Criar a conta da forma certa: e-mail profissional, senha forte, verificação em duas etapas.
- Configurar as opções de privacidade que importam para quem lida com dados de clientes.
- Entender a diferença entre planos gratuitos e pagos sob a ótica do sigilo, não só de recursos.

### Conteúdo

**1. A conta é profissional — trate como tal**
- Use **e-mail profissional** (não a conta pessoal com sua vida inteira vinculada).
- Senha longa e única (gerenciador de senhas) + **verificação em duas etapas ativada**.
- Nunca compartilhe a mesma conta entre pessoas do escritório sem controle: o histórico de conversas contém dados de clientes.

**2. Configurações de privacidade — o passo que quase ninguém faz**
Em cada ferramenta, localize e revise (os nomes mudam, o conceito é o mesmo):
- **Uso das conversas para treinamento do modelo**: desative quando a opção existir, ou prefira planos/modalidades em que os dados não são usados para treinar.
- **Retenção de histórico**: saiba por quanto tempo as conversas ficam armazenadas e como excluí-las.
- **Conversas temporárias/incógnitas**: use para assuntos mais sensíveis.
- **Aplicativos e integrações conectadas**: revise o que tem acesso à conta.

> 📌 *Material de apoio: checklist de configuração passo a passo por ferramenta (atualizar a cada turma — as telas mudam com frequência).*

**3. Plano gratuito ou pago?**
O critério não é só recurso — é **política de dados**. Em geral, planos corporativos/profissionais oferecem compromissos contratuais de não treinamento e mais controle. Para uso com dados reais de clientes, prefira o cenário mais protetivo que o orçamento permitir; para estudo e prática com dados fictícios, o gratuito basta.

**4. Higiene digital básica do escritório**
- Não cole em IA nenhum dado que você não colaria num e-mail para um desconhecido — a menos que anonimize (Aula 3).
- Cuidado com extensões de navegador que "leem" a página: podem capturar o processo aberto no PJe/e-SAJ.
- Computador compartilhado = sessão deslogada ao sair.

### Demonstração em vídeo (roteiro)
Tela gravada: criar conta do zero, ativar 2FA, percorrer cada configuração de privacidade, criar uma conversa temporária.

### Exercício do aluno
Audite sua própria conta com o checklist. Marque o que estava aberto e corrija.

---

## Aula 3 — Sigilo profissional, LGPD e ética no uso de IA

### Objetivos
- Saber exatamente **o que pode e o que não pode** ser enviado a uma IA.
- Dominar a técnica de anonimização/pseudonimização de casos.
- Conhecer o panorama normativo: sigilo profissional (CED-OAB), LGPD e diretrizes sobre IA no Judiciário.

### Conteúdo

**1. O tripé normativo (conferir sempre a versão vigente)**
- **Sigilo profissional**: o Código de Ética e Disciplina da OAB trata o sigilo como dever inerente à profissão. Enviar dados identificáveis do cliente a um serviço externo sem cuidado pode configurar violação.
- **LGPD (Lei 13.709/2018)**: dados pessoais — e especialmente dados sensíveis (saúde, origem, convicções, biometria) — exigem base legal e medidas de segurança para tratamento, o que inclui o envio a plataformas de IA.
- **Diretrizes institucionais**: CNJ e tribunais vêm editando normas sobre uso de IA na atividade judicial; a OAB publicou recomendações sobre IA generativa na advocacia. Acompanhe as atualizações — este é um campo em movimento.

**2. A regra prática do curso: anonimize antes de enviar**
Técnica da **tabela de substituição** (fica só com você, fora da IA):

| Dado real | Substituto no prompt |
|---|---|
| João da Silva (cliente) | AUTOR |
| Empresa XYZ Ltda. | RÉ / EMPRESA |
| CPF, RG, endereço | *(remover — quase nunca são necessários para a tarefa)* |
| Valores exatos, se sensíveis | R$ X / valor aproximado |
| Cidade pequena identificável | "município do interior" |

O caso continua perfeitamente analisável — "AUTOR trabalhou para a RÉ por 4 anos sem registro" — sem expor ninguém.

**3. O que nunca enviar, nem anonimizado**
- Documentos sob segredo de justiça, na íntegra.
- Dados sensíveis desnecessários à tarefa (prontuários, detalhes de intimidade).
- Estratégia sigilosa em caso de grande repercussão, quando o simples enredo identifica as partes.

**4. Transparência com o cliente**
Boa prática (e tendência regulatória): informar no contrato de honorários ou na política de privacidade do escritório que ferramentas de IA podem ser utilizadas como apoio, sempre sob revisão do advogado e com proteção dos dados.

### Demonstração em vídeo (roteiro)
Pegar um relato de cliente fictício cheio de dados pessoais e anonimizá-lo ao vivo com a tabela de substituição; enviar a versão limpa à IA e mostrar que a análise não perde qualidade.

### Exercício do aluno
Anonimize o caso-modelo fornecido (material de apoio) e submeta à IA pedindo a identificação das questões jurídicas. Compare com o gabarito.

---

## Aula 4 — Engenharia de prompts jurídicos

### Objetivos
- Dominar a estrutura de prompt que funciona para tarefas jurídicas.
- Aprender a iterar: o segundo prompt é sempre melhor que o primeiro.
- Construir sua biblioteca pessoal de prompts.

### Conteúdo

**1. A anatomia do prompt jurídico — método P.C.T.F.R.**

| Elemento | O que é | Exemplo |
|---|---|---|
| **P**apel | Quem a IA deve "ser" | "Você é um advogado trabalhista experiente…" |
| **C**ontexto | Os fatos e o cenário | "…AUTOR trabalhou 4 anos sem registro para a RÉ, rede de supermercados…" |
| **T**arefa | O que você quer, com verbo preciso | "…liste as verbas devidas e os fundamentos legais de cada uma…" |
| **F**ormato | Como a resposta deve vir | "…em tabela: verba · fundamento · observações." |
| **R**estrições | Limites e cuidados | "Não invente jurisprudência. Se não tiver certeza de algo, diga expressamente." |

**2. Os erros mais comuns (e o conserto)**
- *Prompt vago*: "me ajuda com um caso trabalhista" → especifique fatos, pedido e formato.
- *Tudo de uma vez*: peça em etapas — primeiro a análise, depois o esqueleto, depois a redação.
- *Aceitar a primeira resposta*: refine — "aprofunde o item 3", "reescreva em tom mais formal", "acrescente o contraponto da defesa".
- *Não dar exemplos*: mostre um modelo do escritório e peça "siga exatamente esta estrutura e este tom" (*few-shot*).

**3. Instruções de segurança que devem virar hábito**
Acrescente ao final dos prompts importantes:
> "Não cite jurisprudência ou dispositivo legal sem indicar que preciso conferir na fonte. Se houver mais de uma corrente sobre o tema, apresente ambas. Aponte expressamente os pontos em que você tem incerteza."

**4. Conversa é contexto**
A IA lembra do que foi dito **na mesma conversa**. Use isso: construa o caso em uma conversa e vá pedindo produtos derivados (resumo → teses → esqueleto → redação). Conversa nova = contexto zerado.

### Demonstração em vídeo (roteiro)
Mesmo caso, dois prompts: um vago e um com P.C.T.F.R. — comparar os resultados lado a lado. Depois, três rodadas de refinamento sobre a resposta boa.

### Exercício do aluno
Transforme este pedido vago em prompt completo: "preciso responder uma notificação do condomínio". Aplique o P.C.T.F.R. e execute na IA.

---

## Aula 5 — Cinco práticas guiadas para o dia a dia

> Nesta aula o aluno executa, junto com o professor, cinco fluxos completos que já saem do curso funcionando no escritório. Todos os prompts estão no [banco de prompts](banco-de-prompts.md).

### Prática 1 — Resumo estruturado de decisão judicial
Entrada: acórdão em PDF ou texto. Saída: ficha com relator, resultado, fundamentos, tese e trechos-chave para citação. *Uso: acompanhar intimações e alimentar o cliente com informação clara.*

### Prática 2 — Cronologia de fatos a partir do relato do cliente
Entrada: relato desorganizado (anonimizado) de atendimento. Saída: linha do tempo datada + lista de documentos a solicitar + questões jurídicas identificadas. *Uso: primeira reunião vira material de trabalho em minutos.*

### Prática 3 — Notificação extrajudicial em três versões
Entrada: fatos do caso. Saída: minuta em tom conciliador, tom firme e tom pré-contencioso — o advogado escolhe e ajusta. *Uso: resposta rápida com controle de estratégia.*

### Prática 4 — Brainstorm de teses (autor × réu)
Entrada: caso anonimizado. Tarefa: "liste as 5 melhores teses do autor, depois as 5 melhores da defesa, depois aponte qual lado está mais frágil e por quê". *Uso: preparar audiência e antecipar o adversário.*

### Prática 5 — Revisão de peça pronta
Entrada: peça já escrita pelo advogado. Tarefa: revisar gramática, clareza, repetições e força argumentativa **sem alterar o mérito**; apontar trechos confusos e sugerir cortes. *Uso: peça mais enxuta e legível — juiz agradece.*

### Encerramento do módulo
- Recapitulação da regra de ouro (conferência de fontes) e da anonimização.
- Orientação: criar um documento pessoal "Meus prompts" e alimentá-lo a cada uso.
- Ponte para o Módulo 2: "agora que você domina o básico com segurança, vamos aos processos longos e às peças completas."
