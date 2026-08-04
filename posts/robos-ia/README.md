# Post "Eu e a minha equipe" — Claude, GPT e Jus IA

Versão própria do post de referência (`referencia.jpeg`, do @blogentendendodireito),
usando a sua foto e **três robôs diferentes**, cada um com identidade visual própria:

| Robô       | Identidade                                                                 |
|------------|----------------------------------------------------------------------------|
| **Claude** | Terracota, cabeça arredondada, crista de três raios, asterisco no peito. É o que passa o braço no meu ombro. |
| **GPT**    | Grafite e branco, o mais alto, cabeça angular, visor único em barra, antena com led e nó hexagonal no peito. |
| **Jus IA** | Metal claro com visor verde, capacete, emblema nas cores do JusBrasil e pasta de processos na mão. |

## Arquivos

- `post.html` — arte editável (os robôs são gerados em SVG por um script na própria página).
- `post-feed.png` — 1080 × 1350 (feed, 4:5).
- `post-story.png` — 1080 × 1920 (story / reels).
- `legenda.md` — legenda pronta, com variação para story e primeiro comentário.
- `foto-vilmar.jpg` — foto usada na arte.
- `referencia.jpeg` — print do post que serviu de referência.

## Como editar e gerar de novo

Abra o `post.html` no navegador para ver o resultado. `post.html?story` mostra a versão 9:16.

O que costuma ser ajustado:

- **@ do perfil**: `<div class="handle">@vilmarjunior.adv</div>` — troque pelo seu usuário real.
- **Texto do post**: bloco `<div class="quote">`.
- **Etiquetas**: lista no final do script (`label: 'Claude'`, `'GPT'`, `'Jus IA'`).
- **Cor/pose de cada robô**: objetos `CLAUDE`, `GPT` e `JUSIA` no script.
  `hi`/`mid`/`lo` são o metal, `accent` é a luz; `armL`/`armR` giram o braço todo e
  `foreL`/`foreR` dobram o antebraço (graus, positivo gira para a esquerda da imagem).
- **Posição na fila**: `shift` de cada robô (margem negativa, em px).

Para exportar os PNGs de novo:

```bash
CH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome   # ou o Chrome/Chromium local

"$CH" --headless --no-sandbox --hide-scrollbars --window-size=1080,1350 \
  --screenshot=post-feed.png --virtual-time-budget=3000 "file://$PWD/post.html"

"$CH" --headless --no-sandbox --hide-scrollbars --window-size=1080,1920 \
  --screenshot=post-story.png --virtual-time-budget=3000 "file://$PWD/post.html?story"
```

## Observação

Os robôs são ilustrações vetoriais feitas aqui — não são fotos nem renders 3D, então o
acabamento é "cartoon premium", diferente do robô fotorrealista da referência. Se quiser o
visual fotorrealista (estilo Exterminador do Futuro), o caminho é gerar as imagens dos robôs
em uma ferramenta de imagem e trocar os `<svg>` por `<img>` no mesmo layout — a moldura, o
texto e as etiquetas continuam funcionando igual.
