# PJe → Markdown

Extensão de navegador (Chrome/Edge, Manifest V3) que converte um trecho de um
processo aberto no PJe (ou a página inteira) em **Markdown**, pronto para
colar em uma IA (ChatGPT, Claude, etc.) para gerar resumos e análises.

Como o PJe é operado por dezenas de tribunais diferentes (TJs, TRTs, TRFs...),
cada um com sua própria versão e estrutura de tela, esta extensão **não tenta
adivinhar** onde está cada informação. Em vez disso, ela deixa você **selecionar
visualmente** o bloco que quer converter (andamentos, partes, documentos etc.),
o que funciona em qualquer instância do PJe.

## Instalação (modo desenvolvedor)

Não está publicada na Chrome Web Store — é carregada localmente:

1. Baixe/clone esta pasta (`extensao-pje-markdown`) para o seu computador.
2. Abra o Chrome (ou Edge) e vá em `chrome://extensions` (ou `edge://extensions`).
3. Ative o **"Modo do desenvolvedor"** (canto superior direito).
4. Clique em **"Carregar sem compactação"** ("Load unpacked").
5. Selecione a pasta `extensao-pje-markdown`.
6. O ícone da extensão aparecerá na barra de ferramentas.

## Como usar

1. Abra o processo desejado no site do PJe do seu tribunal.
2. Você verá um botão flutuante **"PJe → MD"** no canto inferior direito da
   página (ou clique no ícone da extensão na barra de ferramentas e depois em
   **"Selecionar trecho na página"**).
3. Passe o mouse sobre a tela: o trecho sob o cursor fica destacado com uma
   borda azul. Clique no bloco que você quer converter (ex.: a tabela de
   movimentações, a lista de partes, um documento aberto).
   - Pressione `Esc` a qualquer momento para cancelar a seleção.
4. Um painel abre com o Markdown gerado. Você pode:
   - **Copiar** — para colar direto em uma conversa com uma IA.
   - **Baixar .md** — para salvar o arquivo.
   - **Selecionar outro trecho** — para repetir a captura.
5. Alternativamente, use **"Converter página inteira"** no popup da extensão
   para converter tudo o que está visível na página de uma vez (gera um
   Markdown mais longo e menos organizado que uma seleção pontual).

O último Markdown capturado fica salvo localmente (via `chrome.storage`) e
reaparece no popup da extensão até você capturar outro.

## Limitações conhecidas

- **Grids virtualizados**: se a lista de movimentações do processo carregar
  itens conforme você rola a tela (grid virtualizado), apenas os itens já
  renderizados no momento da captura entram no Markdown. Role a tela até
  carregar tudo que precisa antes de selecionar.
- **Conteúdo dentro de `<iframe>`**: o botão flutuante e o seletor funcionam
  no documento principal da aba. Conteúdo dentro de quadros incorporados de
  outra origem pode não ser alcançado pelo seletor.
- **Nenhum dado é enviado para fora do seu navegador**: a extensão não faz
  nenhuma chamada de rede própria; ela só lê a página, gera o texto e deixa
  você copiar/baixar. O que você faz com o Markdown depois (colar em uma IA,
  por exemplo) é por sua conta.

## Estrutura dos arquivos

- `manifest.json` — configuração da extensão (Manifest V3).
- `converter.js` — conversor genérico de um elemento HTML para Markdown
  (títulos, tabelas, listas, negrito/itálico, links; reconhece tanto tabelas
  HTML quanto grids baseados em ARIA roles, comuns em telas Vaadin).
- `content.js` — roda dentro da página do PJe: botão flutuante, seletor
  visual e painel de resultado.
- `overlay.css` — estilos do botão, destaque de seleção e painel.
- `popup.html` / `popup.js` / `popup.css` — janela da extensão (barra de
  ferramentas), com atalhos para os dois modos de captura e para
  copiar/baixar o último Markdown gerado.
- `background.js` — service worker mínimo (inicialização de storage).
- `icons/` — ícones da extensão.
