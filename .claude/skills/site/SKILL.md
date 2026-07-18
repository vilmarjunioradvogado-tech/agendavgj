---
name: site
description: Criar e editar sites, landing pages e páginas de captação para o escritório Vilmar Junior Advocacia, em HTML completo com animações, responsivo e pronto para publicar, sem o usuário escrever código. Acionar quando o usuário pedir "site", "página", "landing page", "página de captação" ou alterações em páginas existentes.
---

# Sites e Landing Pages — Vilmar Junior Advocacia

## Processo

1. Ler `base-de-conhecimento/escritorio.md` para usar dados reais
2. Se faltar informação essencial (área, oferta, contato), perguntar antes de criar
3. Criar a página como arquivo único `site/[nome-descritivo].html` — HTML com CSS
   e JavaScript embutidos, sem dependências externas
4. Mostrar o resultado ao chefe (SendUserFile com display render) para aprovação
5. Ajustar até aprovar

## Padrão de qualidade

- Responsivo (perfeito no celular — é onde os clientes vão ver)
- Animações suaves de entrada (fade/slide via IntersectionObserver)
- Paleta sóbria de advocacia: azul-marinho/dourado ou grafite/bronze, salvo pedido contrário
- Botão flutuante de WhatsApp com link `https://wa.me/5531993363665` (ou o número
  que estiver na base de conhecimento) com mensagem pré-preenchida
- SEO básico: title, meta description, headings corretos
- Seções típicas: herói com promessa clara → sobre o advogado → áreas de
  atuação → como funciona → depoimentos (se houver reais) → FAQ → contato

## Regras OAB

- Sem promessa de resultado, sem valores de honorários, sem "o melhor advogado"
- Publicidade sóbria e informativa (Provimento 205/2021)

## Publicação

A página fica pronta no repositório. Para colocar no ar, oferecer ao chefe as
opções gratuitas: GitHub Pages (este repositório), Netlify Drop ou Vercel —
e guiá-lo passo a passo, ou configurar o GitHub Pages diretamente se ele pedir.
