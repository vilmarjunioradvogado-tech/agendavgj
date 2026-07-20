# 🎬 Meu Estúdio — Conteúdo & Vendas com IA

Sistema próprio de criação de conteúdo e vendas com IA — **do roteiro à gravação, sem sair da plataforma**. Alternativa pessoal a ferramentas de assinatura mensal (como a Squader), rodando 100% no seu navegador, com custo apenas do uso da IA.

## O que ele faz

| Módulo | O que entrega |
|---|---|
| **01 · Posicionamento** | Documento completo: promessa, bio do Instagram, tom de voz, linha editorial, público-alvo — e ele alimenta todas as outras seções |
| **02 · Conteúdo** | Carrosséis **com arte pronta para postar** (PNG 1080×1350 na sua identidade visual), roteiros de reels e sequências de stories |
| **03 · Funis** | Funil de vendas completo sob medida para o seu nicho, etapa por etapa |
| **04 · Ativos** | Roteiros de VSL, copy de páginas de venda/captura, aulas e webinars |
| **05 · Vendas** | Scripts para cada etapa (prospecção → fechamento) + **copiloto em tempo real**: cole a situação e receba a resposta pronta |
| **🎥 Estúdio** | Grave seus reels no navegador com **teleprompter integrado**, espelhamento, controle de velocidade e download do vídeo — sem OBS, sem CapCut |

## Quanto custa

- **O sistema: R$ 0.** É seu, roda no navegador, sem assinatura.
- **A IA: paga por uso** com sua própria chave da Anthropic (Claude). Para uso individual (alguns conteúdos por dia), o custo típico fica em **R$ 10–40/mês** — contra R$ 97–127/mês de plataformas prontas. No modelo Haiku, sai ainda mais barato.

## Como começar (5 minutos)

1. **Crie sua chave de API** em [platform.claude.com](https://platform.claude.com) → API Keys → Create Key. Adicione um crédito inicial (ex.: US$ 5).
2. **Abra o sistema**: acesse o `index.html` (veja hospedagem abaixo).
3. Vá em **⚙️ Configurações**, cole a chave, escolha o modelo e as cores da sua marca. Salve.
4. Preencha o **01 · Posicionamento** e gere seu documento — ele passa a personalizar tudo.
5. Crie seu primeiro carrossel ou reel. 🚀

## Hospedagem gratuita (GitHub Pages)

No repositório: **Settings → Pages → Source: Deploy from a branch → selecione a branch e a pasta `/ (root)` → Save**. Em ~1 minuto o sistema fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

> ⚠️ O **Estúdio** (câmera) exige `https://` ou `localhost` — o GitHub Pages já usa https, então funciona. Abrir o arquivo direto do disco (`file://`) funciona para os geradores de texto, mas o navegador pode bloquear a câmera.

Alternativa local: `python3 -m http.server 8000` na pasta do projeto e acesse `http://localhost:8000`.

## Privacidade e segurança

- Sua chave de API fica salva **apenas no localStorage do seu navegador** — nunca é enviada a nenhum servidor além da própria Anthropic.
- Não use este sistema em computadores compartilhados sem depois limpar os dados do site.
- Seu posicionamento e configurações também ficam só no navegador.

## O que ficou de fora (e por quê)

- **"Módulo Espião"** (raspar posts/anúncios de concorrentes): a coleta automatizada de dados do Instagram e da Meta viola os termos de uso das plataformas e pode derrubar sua conta. Alternativa manual e segura: a [Biblioteca de Anúncios da Meta](https://www.facebook.com/ads/library) é pública e gratuita — você pode colar manualmente um anúncio interessante no gerador de conteúdo e pedir uma adaptação para o seu nicho.
- **Cortes automáticos / B-roll automático**: exigem processamento pesado de vídeo em servidor. O CapCut gratuito cobre essa etapa, e o teleprompter do Estúdio reduz muito a necessidade de cortes (você erra menos lendo o roteiro).

## Estrutura do projeto

```
index.html        → aplicação (todas as telas)
css/style.css     → visual
js/api.js         → conexão com a API da Anthropic (streaming)
js/app.js         → geradores de conteúdo, carrossel em canvas, copiloto
js/estudio.js     → câmera, teleprompter e gravação
```
