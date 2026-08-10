# VGJ LAW — Aplicativo de Desktop

Sistema operacional do escritório: comercial, jurídico, financeiro, WhatsApp via Zappfy e agente de IA, empacotado como aplicativo desktop com Electron.

## Instalação

O instalador Windows é gerado pelo workflow **Build Desktop App**. Os artefatos são **VGJ-LAW-Windows**, com instalador e versão portátil.

## Desenvolvimento

```bash
npm install
npm start
```

## Configuração

Em **Configurações**, informe a chave da API Anthropic e as credenciais da Zappfy. As credenciais ficam no armazenamento local do computador e não são incluídas no código.

## Dados

O aplicativo mantém os dados operacionais localmente. O backup deve preservar o arquivo de dados da aplicação.

## Operação

O agente pode atender conversas individuais do WhatsApp, realizar triagem, atualizar o CRM, criar tarefas, solicitar documentos, organizar demandas e encaminhar situações que exigem decisão jurídica para Vilmar.

Grupos de WhatsApp são ignorados e não recebem respostas automáticas.

## Identidade do produto

**VGJ LAW** é o nome do produto. Não utilizar mais **NAVE CRM** como nome da aplicação, instalador, título ou identidade visual do sistema.
