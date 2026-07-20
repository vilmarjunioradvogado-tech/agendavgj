# Juristec — Software jurídico (projeto do zero, sem dependências)

Recriação, **do zero e sem nenhuma dependência**, de um software jurídico no estilo
[Juridiq](https://www.juridiq.com.br/), construída apenas a partir do que o site
divulga publicamente. Marca própria (**Juristec**) para não copiar identidade de terceiros —
basta renomear para usar.

> Feito 100% em **HTML + CSS + JavaScript puro**. Sem frameworks, sem build, sem `npm install`.

## O que tem

### 1. Landing page (`index.html`)
Página de vendas completa e responsiva, com as seções que o produto de referência apresenta:

- **Hero** com proposta de valor ("Pare de administrar, volte a advogar")
- **Recursos**: monitoramento por OAB, intimações e publicações, resumos com IA,
  controle de prazos, atendimento no WhatsApp, financeiro, automação de documentos,
  análise de dados e servidor MCP para IA
- **Como funciona** em 4 passos
- **IA & WhatsApp** com prévia de conversa e integração com Claude/ChatGPT/Gemini via MCP
- **Planos** (Jovem Advogado, Essencial, Proficiente, Sociedade Jurídica) — pagamento por
  cartão, boleto ou PIX, sem fidelidade e com migração gratuita
- **Segurança**: LGPD, criptografia, backups, normas da OAB
- **FAQ** em acordeão e **CTA** final

### 2. Painel / app demo (`app/index.html`)
Aplicação de demonstração **funcional** com dados fictícios:

- **Painel** com indicadores, prazos próximos e resumos por IA
- **Processos** com importação simulada por número da OAB (busca → cadastro automático)
- **Prazos** ordenados por urgência, com destaque para os vencendo em breve
- **Atendimento**: chat de WhatsApp simulado que responde sobre o processo do cliente
  (novidades, prazos, audiência, pagamento)
- **Financeiro**: honorários e custas com saldo previsto
- **Drawer de detalhe** de cada processo com linha do tempo dos andamentos

## Como rodar

Não precisa instalar nada. Abra o arquivo no navegador:

```bash
# opção 1: abrir direto
xdg-open index.html      # Linux
open index.html          # macOS

# opção 2: servir localmente (recomendado)
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Estrutura

```
.
├── index.html              # landing page
├── app/
│   └── index.html          # painel / app demo
├── assets/
│   ├── css/
│   │   ├── styles.css      # estilos da landing (design system)
│   │   └── app.css         # estilos do painel
│   └── js/
│       ├── main.js         # interações da landing
│       └── app.js          # lógica do painel (dados fictícios)
└── README.md
```

## Observações

- Todos os dados (processos, prazos, valores, conversas) são **fictícios** e servem apenas
  para demonstração. Não há back-end nem integração real com tribunais.
- Para virar produto de verdade, os próximos passos seriam: autenticação, back-end/API,
  integração com os diários oficiais e sistemas judiciais, IA para resumos e um provedor
  de WhatsApp Business.
