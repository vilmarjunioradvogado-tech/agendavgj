# Módulo 3 — Automação jurídica e assistentes especializados

**Pré-requisito:** Módulos 1 e 2.
**Carga sugerida:** 4 aulas · ~2h30 de vídeo + projeto final.
**Resultado esperado:** o aluno transforma os fluxos manuais dos módulos anteriores em estruturas permanentes: bases de conhecimento do escritório, assistentes especializados por área e rotinas padronizadas de produção de documentos.

---

## Aula 1 — Projetos e bases de conhecimento privadas

### Objetivos
- Sair da "conversa avulsa" e criar espaços de trabalho permanentes com instruções fixas.
- Montar a base de conhecimento do escritório: modelos, teses e padrões sempre à mão da IA.
- Organizar projetos por cliente, por área ou por rotina — e saber qual arranjo escolher.

### Conteúdo

**1. O salto de produtividade: instruções que não se repetem**
As principais ferramentas permitem criar **projetos/espaços com instruções permanentes** (Projects no Claude e no ChatGPT, por exemplo — os nomes e recursos evoluem; o conceito é o mesmo). Tudo o que você repetia em cada conversa — "escreva no padrão do escritório", "não invente jurisprudência", "use esta estrutura de peça" — vira configuração escrita uma única vez.

**2. O que colocar na instrução permanente do escritório (modelo do curso)**

```
INSTRUÇÃO PERMANENTE — [ESCRITÓRIO]
1. Você apoia um escritório de advocacia. Tom: formal, claro, direto.
2. Estrutura de peças: siga os modelos anexados a este projeto.
3. Nunca cite jurisprudência ou lei sem alertar que exigem conferência na fonte.
4. Aponte expressamente incertezas e correntes divergentes.
5. Trate os nomes AUTOR, RÉ, EMPRESA etc. como marcadores de anonimização;
   jamais invente dados pessoais para substituí-los.
6. Em textos ao cliente: linguagem acessível, sem juridiquês, com "próximos passos".
```

**3. A base de conhecimento: quais arquivos anexar**
- 3 a 5 **peças-modelo** do escritório (anonimizadas) — o "livro de estilo".
- **Checklists** dos Módulos 1 e 2 (conferência, anonimização).
- **Tabelas de teses** por área: tese · requisitos · fundamentos · observações.
- Modelos de **contratos, procurações e comunicações** padrão.
> ⚠️ Base de conhecimento também é dado: só anexe material anonimizado ou não sigiloso, e prefira planos com política de dados adequada (Módulo 1, Aula 2).

**4. Como organizar: três arranjos possíveis**
- **Por rotina** (recomendado para começar): "Produção de Peças", "Atendimento e Triagem", "Contratos".
- **Por área**: Trabalhista, Cível, Família — quando os padrões divergem muito.
- **Por caso complexo**: um projeto só para aquele processo grande, com os sumários dos autos anexados.

### Demonstração em vídeo (roteiro)
Criar do zero o projeto "Produção de Peças": escrever a instrução permanente, anexar dois modelos, e mostrar a mesma tarefa executada com e sem o projeto — a diferença vende a aula sozinha.

### Exercício do aluno
Monte seu primeiro projeto com instrução permanente + 2 modelos anexados. Rode a Prática 5 do Módulo 1 (revisão de peça) dentro dele.

---

## Aula 2 — Automação de minutas e documentos recorrentes

### Objetivos
- Padronizar os documentos que o escritório produz toda semana.
- Criar o fluxo "formulário de entrada → minuta pronta para revisão".
- Reduzir o tempo de documentos recorrentes de horas para minutos, sem perder controle.

### Conteúdo

**1. Identifique os candidatos à automação**
Critério: **alto volume + estrutura estável + baixo grau de estratégia**. Exemplos clássicos:
- Contratos de honorários e procurações.
- Notificações extrajudiciais recorrentes (cobrança, vizinhança, consumo).
- Contratos padronizados (locação, prestação de serviços) com cláusulas variáveis.
- Comunicações a clientes: andamento processual, resultado de audiência, orientações iniciais.

**2. A técnica do formulário de entrada**
Para cada documento recorrente, crie um bloco fixo de variáveis:

```
GERAR: Notificação extrajudicial de cobrança
DEVEDOR: [papel — ex.: locatário]
ORIGEM DA DÍVIDA: [contrato/fatos em 2 linhas]
VALOR E PERÍODO: [R$ X — meses Y a Z]
PRAZO PARA PAGAMENTO: [dias]
TOM: [conciliador / firme / pré-contencioso]
PROVIDÊNCIA ANUNCIADA: [protesto / ação / rescisão]
```

Preencher o formulário e enviá-lo ao projeto (que já tem o modelo anexado) gera a minuta no padrão do escritório em segundos. **A revisão do advogado continua obrigatória** — o que se automatiza é a digitação, não a responsabilidade.

**3. Minutas de andamento e comunicação com o cliente**
Fluxo: cole a decisão/ato (anonimizado) → "explique ao cliente em linguagem simples: o que aconteceu, o que significa, próximos passos e prazos" → revise → envie. Clientes entendem mais, ligam menos, confiam mais.

**4. Onde a automação para**
- Documento com estratégia relevante → volta ao fluxo de 6 etapas do Módulo 2.
- Nada de envio automático ao cliente ou protocolo sem revisão humana. Automação sem supervisão não é produtividade — é risco disciplinar.

### Demonstração em vídeo (roteiro)
Montar o formulário da notificação de cobrança, rodar três casos diferentes no mesmo formulário e cronometrar: três minutas revisáveis em menos de dez minutos.

### Exercício do aluno
Escolha o documento mais repetitivo do seu escritório, crie o formulário de entrada e gere duas minutas com dados fictícios.

---

## Aula 3 — Assistentes especializados por área do Direito

### Objetivos
- Construir assistentes dedicados: Trabalhista, Cível, Família — ou a área do aluno.
- Escrever instruções de sistema que capturam o método de trabalho da área.
- Testar e calibrar o assistente antes de adotá-lo na rotina.

### Conteúdo

**1. O que é um "assistente especializado" na prática**
Um projeto permanente com três camadas:
1. **Instrução de sistema da área** (o "cérebro"): como a área raciocina, o que sempre verificar, armadilhas típicas.
2. **Base de conhecimento da área** (a "memória"): modelos, tabelas de teses, checklists específicos.
3. **Fluxos prontos** (as "mãos"): os formulários e prompts padrão da área.

**2. Modelo de instrução — exemplo: assistente trabalhista**

```
Você é o assistente trabalhista do escritório.
SEMPRE que analisar um caso:
1. Identifique: vínculo, período, função, jornada alegada, forma de remuneração
   e causa da rescisão — se algo faltar, PERGUNTE antes de opinar.
2. Verifique de ofício: prescrição bienal e quinquenal (alerta com datas).
3. Nas verbas: monte tabela verba · fundamento · base de cálculo · observações.
4. Considere sempre os dois lados: o que a defesa alegaria contra cada pedido.
5. Alerte para: necessidade de liquidação, documentos indispensáveis e
   provas que o cliente precisa providenciar.
Regras gerais do escritório: [herda a instrução permanente da Aula 1].
```

*(O curso fornece modelos equivalentes para Cível/Consumidor e Família — e ensina o aluno a escrever o da própria área.)*

**3. Como escrever a instrução da SUA área — método em 4 passos**
1. Liste as 5 perguntas que você sempre faz num caso novo da área.
2. Liste os 3 erros que um estagiário cometeria — vire "verificações de ofício".
3. Defina o formato-padrão das saídas (tabelas, fichas, esqueletos).
4. Anexe os modelos da área e rode os testes do passo seguinte.

**4. Calibragem: teste antes de confiar**
Bateria de testes com casos fictícios de resposta conhecida:
- Um caso típico (tem que acertar com folga).
- Um caso com pegadinha (prescrição, ilegitimidade, decadência — tem que alertar).
- Um caso com dados faltando (tem que perguntar, não inventar).
Falhou? Ajuste a instrução e rode de novo. Assistente é software: itera até estabilizar.

### Demonstração em vídeo (roteiro)
Construir o assistente trabalhista completo e rodar a bateria de três testes ao vivo, incluindo um em que ele falha e a instrução é corrigida na hora.

### Exercício do aluno (projeto do módulo)
Construa o assistente da sua área com o método dos 4 passos e entregue: instrução de sistema + resultado da bateria de testes.

---

## Aula 4 — A rotina do escritório com IA: integração e limites

### Objetivos
- Desenhar a semana de trabalho com os fluxos dos três módulos integrados.
- Definir a política interna de uso de IA do escritório (equipe, estagiários, terceirizados).
- Consolidar limites éticos e visão de futuro.

### Conteúdo

**1. O mapa da rotina integrada**

| Momento | Fluxo | Origem |
|---|---|---|
| Caso novo chega | Cronologia + questões jurídicas (Prática 2) | Módulo 1 |
| Estudo do processo | Fichamento padronizado + briefing | Módulo 2, Aula 2 |
| Produção de peça | Fluxo de 6 etapas no projeto da área | Módulo 2 + 3 |
| Documentos recorrentes | Formulários de entrada | Módulo 3, Aula 2 |
| Comunicação com cliente | Minutas de andamento em linguagem simples | Módulo 3, Aula 2 |
| Véspera de audiência | Briefing + revisão adversarial | Módulo 2 |

**2. Política interna de uso de IA (modelo fornecido no curso)**
Pontos mínimos do documento que todo escritório deveria ter:
- Ferramentas autorizadas e configuração obrigatória de privacidade.
- Regra de anonimização (tabela de substituição) como norma da equipe.
- Proibições: segredo de justiça na íntegra, envio sem anonimizar, protocolo sem revisão.
- Responsável por manter modelos, projetos e a política atualizados.
- Treinamento obrigatório para quem entra (este curso como onboarding).

**3. Limites que não se negociam**
- IA não atende cliente sozinha, não protocola sozinha, não decide estratégia.
- O advogado responde pelo produto final — sempre. A ferramenta não divide OAB com ninguém.
- Transparência com o cliente sobre o uso de IA como apoio.

**4. E daqui para frente?**
As ferramentas mudam a cada semestre; **o método não**: segurança → contexto de qualidade → produção em etapas → conferência → padronização. Quem domina o método troca de ferramenta sem trocar de competência. Atualizações do curso dentro do período de acesso cobrem as novidades relevantes.

### Demonstração em vídeo (roteiro)
Simular "uma segunda-feira no escritório": caso novo, intimação recebida e contrato recorrente — resolvidos em sequência com os fluxos do mapa.

### Projeto final do curso
Entregar: (1) o projeto/assistente da sua área configurado; (2) um documento recorrente automatizado com formulário; (3) uma peça produzida pelo fluxo de 6 etapas com o checklist de conferência preenchido. *Certificado emitido após a entrega.*
