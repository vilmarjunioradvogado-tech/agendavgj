/* ============================================================
 * app.js — navegação, configurações e geradores de conteúdo
 * ============================================================ */

/* ---------- navegação lateral ---------- */
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => irParaSecao(btn.dataset.section));
});

function irParaSecao(id) {
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.section === id)
  );
  document.querySelectorAll(".section").forEach((s) =>
    s.classList.toggle("active", s.id === id)
  );
  window.scrollTo(0, 0);
}

/* ---------- abas ---------- */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const grupo = btn.closest(".section");
    grupo.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    grupo.querySelectorAll(".tab-panel").forEach((p) =>
      p.classList.toggle("active", p.id === btn.dataset.tab)
    );
  });
});

/* ---------- configurações ---------- */
const CFG_CAMPOS = [
  ["cfg-api-key", "cfg_api_key"],
  ["cfg-model", "cfg_model"],
  ["cfg-cor-fundo", "cfg_cor_fundo"],
  ["cfg-cor-texto", "cfg_cor_texto"],
  ["cfg-cor-destaque", "cfg_cor_destaque"],
  ["cfg-instagram", "cfg_instagram"],
];

function carregarConfig() {
  for (const [elId, key] of CFG_CAMPOS) {
    const v = localStorage.getItem(key);
    if (v !== null) document.getElementById(elId).value = v;
  }
  atualizarBadges();
}

document.getElementById("btn-salvar-config").addEventListener("click", () => {
  for (const [elId, key] of CFG_CAMPOS) {
    localStorage.setItem(key, document.getElementById(elId).value.trim());
  }
  const ok = document.getElementById("cfg-salvo");
  ok.classList.remove("hidden");
  setTimeout(() => ok.classList.add("hidden"), 2500);
  atualizarBadges();
});

function atualizarBadges() {
  const bApi = document.getElementById("status-api");
  const temChave = !!localStorage.getItem("cfg_api_key");
  bApi.textContent = temChave ? "API conectada" : "Sem chave de API";
  bApi.className = "badge " + (temChave ? "badge-on" : "badge-off");

  const bPos = document.getElementById("status-posicionamento");
  const temPos = !!localStorage.getItem("posicionamento_doc");
  bPos.textContent = temPos ? "Posicionamento ativo" : "Sem posicionamento";
  bPos.className = "badge " + (temPos ? "badge-on" : "badge-off");
}

/* ---------- helper de geração com streaming ---------- */
async function gerarTexto({ botao, outputId, system, user, aoFinalizar = null }) {
  const out = document.getElementById(outputId);
  out.classList.remove("hidden");
  out.classList.add("loading");
  out.textContent = "";
  botao.disabled = true;

  try {
    const texto = await chamarClaude({
      system,
      messages: [{ role: "user", content: user }],
      onDelta: (t) => { out.textContent = t; },
    });
    out.textContent = texto;
    adicionarBotaoCopiar(out);
    if (aoFinalizar) aoFinalizar(texto);
    return texto;
  } catch (e) {
    out.textContent = "❌ " + e.message;
    return null;
  } finally {
    out.classList.remove("loading");
    botao.disabled = false;
  }
}

function adicionarBotaoCopiar(out) {
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "Copiar";
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(out.textContent.replace(/Copiar$/, "").trim());
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = "Copiar"), 2000);
  });
  out.appendChild(btn);
}

const REGRAS_ESTILO =
  "Escreva em português do Brasil. Seja direto e prático — nada de introduções genéricas. " +
  "Formate com títulos e listas em texto simples (sem markdown com #), fáceis de copiar e usar.";

/* ============================================================
 * 01 · POSICIONAMENTO
 * ============================================================ */
document.getElementById("btn-gerar-posicionamento").addEventListener("click", async (e) => {
  const dados = {
    nome: v("pos-nome"),
    nicho: v("pos-nicho"),
    publico: v("pos-publico"),
    servicos: v("pos-servicos"),
    diferenciais: v("pos-diferenciais"),
    tom: v("pos-tom"),
  };
  if (!dados.nicho) return alert("Preencha pelo menos o nicho de atuação.");

  const texto = await gerarTexto({
    botao: e.target,
    outputId: "out-posicionamento",
    system:
      "Você é um estrategista de marca sênior, especialista em posicionamento digital para prestadores de serviço " +
      "(não influenciadores). " + REGRAS_ESTILO,
    user:
      "Crie o documento de posicionamento completo deste negócio, pronto para uso:\n\n" +
      `Negócio: ${dados.nome}\nNicho: ${dados.nicho}\nPúblico-alvo: ${dados.publico}\n` +
      `Serviços: ${dados.servicos}\nDiferenciais: ${dados.diferenciais}\nTom de voz desejado: ${dados.tom}\n\n` +
      "O documento deve conter estas seções:\n" +
      "1. PROMESSA CENTRAL (a transformação que o negócio entrega, em 1 frase)\n" +
      "2. BIO DO INSTAGRAM (pronta para colar, com quebras de linha e CTA)\n" +
      "3. TOM DE VOZ (como falar e como NÃO falar, com exemplos)\n" +
      "4. LINHA EDITORIAL (4 pilares de conteúdo, com % de frequência e exemplos de temas para cada um)\n" +
      "5. PÚBLICO-ALVO DETALHADO (dores, desejos, objeções principais)\n" +
      "6. DIFERENCIAIS COMPETITIVOS (como comunicá-los sem parecer arrogante)\n" +
      "7. 10 IDEIAS DE CONTEÚDO alinhadas à linha editorial",
  });

  if (texto) {
    localStorage.setItem("posicionamento_doc", texto);
    localStorage.setItem("posicionamento_form", JSON.stringify(dados));
    atualizarBadges();
  }
});

function v(id) { return document.getElementById(id).value.trim(); }

/* ============================================================
 * 02 · CONTEÚDO — EDITOR DE CARROSSEL (estilo Canva, VGJ)
 * ============================================================ */

const FORMATOS = { "4x5": [1080, 1350], "1x1": [1080, 1080], "9x16": [1080, 1920] };

// estado do editor
const carrossel = {
  slides: [{ titulo: "Título da capa", texto: "", badge: true }],
  legenda: "",
  template: "classico",
  formato: "4x5",
  atual: 0,
};

/* ---------- utilidades de desenho ---------- */
function envolver(ctx, texto, larguraMax) {
  const palavras = (texto || "").split(/\s+/);
  const linhas = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? atual + " " + p : p;
    if (ctx.measureText(teste).width > larguraMax && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function paleta(cfg) {
  return {
    navy: cfg.corFundo,
    texto: cfg.corTexto,
    ouro: cfg.corDestaque,
    creme: "#f5f0e6",
    cremeTexto: "#1c2740",
    branco: "#ffffff",
    handle: cfg.instagram || "",
  };
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

function kicker(ctx, x, y, texto, cor) {
  if (!texto) return;
  ctx.save();
  ctx.fillStyle = cor;
  ctx.font = `600 26px ${SANS}`;
  try { ctx.letterSpacing = "4px"; } catch (_) {}
  ctx.fillText(texto.toUpperCase(), x, y);
  ctx.restore();
}

/* ---------- os 5 modelos VGJ ---------- */
const TEMPLATES = {
  classico: {
    nome: "Clássico",
    swatch: (c) => [c.navy, c.ouro],
    draw(ctx, W, H, s, idx, total, p) {
      ctx.fillStyle = p.navy; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.ouro; ctx.fillRect(0, 0, W, 14);
      ctx.textAlign = "left";
      kicker(ctx, 90, 150, p.handle.replace("@", "") || "VGJ", p.ouro);
      const tam = idx === 0 ? 92 : 68;
      ctx.fillStyle = p.texto;
      ctx.font = `bold ${tam}px ${SERIF}`;
      let y = idx === 0 ? H * 0.4 : 300;
      for (const l of envolver(ctx, s.titulo, W - 180)) { ctx.fillText(l, 90, y); y += tam * 1.18; }
      ctx.fillStyle = p.ouro; ctx.fillRect(90, y - 20, 130, 6); y += 70;
      if (s.texto) {
        ctx.fillStyle = p.texto; ctx.globalAlpha = 0.9; ctx.font = `44px ${SANS}`;
        for (const l of envolver(ctx, s.texto, W - 180)) { ctx.fillText(l, 90, y); y += 62; }
        ctx.globalAlpha = 1;
      }
      rodape(ctx, W, H, s, idx, total, p, p.texto);
    },
  },

  editorial: {
    nome: "Editorial",
    swatch: (c) => [c.creme, c.navy],
    draw(ctx, W, H, s, idx, total, p) {
      ctx.fillStyle = p.creme; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = p.ouro; ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, W - 96, H - 96);
      ctx.textAlign = "left";
      kicker(ctx, 100, 170, p.handle.replace("@", "") || "ARTIGO", p.ouro);
      const tam = idx === 0 ? 88 : 64;
      ctx.fillStyle = p.cremeTexto; ctx.font = `bold ${tam}px ${SERIF}`;
      let y = 290;
      for (const l of envolver(ctx, s.titulo, W - 220)) { ctx.fillText(l, 100, y); y += tam * 1.16; }
      y += 24;
      if (s.texto) {
        ctx.fillStyle = "#3a4a63"; ctx.font = `italic 44px ${SERIF}`;
        for (const l of envolver(ctx, s.texto, W - 220)) { ctx.fillText(l, 100, y); y += 62; }
      }
      rodape(ctx, W, H, s, idx, total, p, p.cremeTexto);
    },
  },

  destaque: {
    nome: "Destaque",
    swatch: (c) => [c.navy, c.ouro],
    draw(ctx, W, H, s, idx, total, p) {
      ctx.fillStyle = p.navy; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.ouro; ctx.fillRect(90, H * 0.28, 12, H * 0.44);
      ctx.textAlign = "left";
      const tam = idx === 0 ? 96 : 74;
      ctx.fillStyle = p.texto; ctx.font = `bold ${tam}px ${SERIF}`;
      const linhas = envolver(ctx, s.titulo, W - 280);
      let y = H / 2 - (linhas.length - 1) * tam * 0.58;
      for (const l of linhas) { ctx.fillText(l, 150, y); y += tam * 1.16; }
      if (s.texto) {
        ctx.fillStyle = p.ouro; ctx.globalAlpha = 0.95; ctx.font = `40px ${SANS}`;
        y += 20;
        for (const l of envolver(ctx, s.texto, W - 280)) { ctx.fillText(l, 150, y); y += 56; }
        ctx.globalAlpha = 1;
      }
      rodape(ctx, W, H, s, idx, total, p, p.texto);
    },
  },

  minimal: {
    nome: "Minimal",
    swatch: (c) => [c.branco, c.ouro],
    draw(ctx, W, H, s, idx, total, p) {
      ctx.fillStyle = p.branco; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.ouro; ctx.fillRect(90, 150, 70, 6);
      ctx.textAlign = "left";
      const tam = idx === 0 ? 90 : 66;
      ctx.fillStyle = "#12203a"; ctx.font = `bold ${tam}px ${SERIF}`;
      let y = 320;
      for (const l of envolver(ctx, s.titulo, W - 180)) { ctx.fillText(l, 90, y); y += tam * 1.16; }
      y += 30;
      if (s.texto) {
        ctx.fillStyle = "#4a5877"; ctx.font = `44px ${SANS}`;
        for (const l of envolver(ctx, s.texto, W - 180)) { ctx.fillText(l, 90, y); y += 62; }
      }
      rodape(ctx, W, H, s, idx, total, p, "#12203a");
    },
  },

  depoimento: {
    nome: "Depoimento",
    swatch: (c) => [c.navy, c.ouro],
    draw(ctx, W, H, s, idx, total, p) {
      ctx.fillStyle = p.navy; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.ouro; ctx.font = `bold 260px ${SERIF}`;
      ctx.textAlign = "left"; ctx.globalAlpha = 0.85;
      ctx.fillText("“", 70, 300); ctx.globalAlpha = 1;
      const tam = 62;
      ctx.fillStyle = p.texto; ctx.font = `italic ${tam}px ${SERIF}`;
      let y = 420;
      for (const l of envolver(ctx, s.titulo, W - 200)) { ctx.fillText(l, 100, y); y += tam * 1.2; }
      y += 30;
      if (s.texto) {
        ctx.fillStyle = p.ouro; ctx.font = `600 40px ${SANS}`;
        for (const l of envolver(ctx, s.texto, W - 200)) { ctx.fillText(l, 100, y); y += 54; }
      }
      rodape(ctx, W, H, s, idx, total, p, p.texto);
    },
  },
};

function rodape(ctx, W, H, s, idx, total, p, corTexto) {
  ctx.textAlign = "left";
  ctx.font = `34px ${SANS}`;
  ctx.fillStyle = corTexto; ctx.globalAlpha = 0.7;
  if (p.handle) ctx.fillText(p.handle, 90, H - 70);
  ctx.textAlign = "right";
  if (idx < total - 1) ctx.fillText(`${idx + 1}/${total}`, W - 90, H - 70);
  ctx.globalAlpha = 1;
  if (s.badge) {
    ctx.textAlign = "right";
    ctx.fillStyle = p.ouro;
    ctx.font = `bold 40px ${SANS}`;
    ctx.fillText("ARRASTE  →", W - 90, H - 140);
  }
  ctx.textAlign = "left";
}

/* ---------- desenho num canvas alvo ---------- */
function desenharEm(canvas, slide, idx) {
  const [W, H] = FORMATOS[carrossel.formato];
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const p = paleta(getConfig());
  (TEMPLATES[carrossel.template] || TEMPLATES.classico).draw(ctx, W, H, slide, idx, carrossel.slides.length, p);
}

/* ---------- render do editor ---------- */
function renderEditor() {
  desenharEm(document.getElementById("edit-canvas"), carrossel.slides[carrossel.atual], carrossel.atual);
  const s = carrossel.slides[carrossel.atual];
  document.getElementById("edit-titulo").value = s.titulo;
  document.getElementById("edit-texto").value = s.texto;
  document.getElementById("edit-badge").checked = !!s.badge;
  document.getElementById("edit-slide-tag").textContent =
    `Slide ${carrossel.atual + 1} de ${carrossel.slides.length}` +
    (carrossel.atual === 0 ? " · capa" : carrossel.atual === carrossel.slides.length - 1 ? " · CTA" : "");
  renderTira();
}

function renderTira() {
  const tira = document.getElementById("slides-strip");
  tira.innerHTML = "";
  carrossel.slides.forEach((slide, i) => {
    const tmp = document.createElement("canvas");
    desenharEm(tmp, slide, i);
    const wrap = document.createElement("div");
    wrap.className = "strip-thumb" + (i === carrossel.atual ? " active" : "");
    wrap.draggable = true;
    wrap.dataset.i = i;
    const img = document.createElement("img");
    img.src = tmp.toDataURL("image/png");
    wrap.appendChild(img);
    const num = document.createElement("span");
    num.className = "num"; num.textContent = i + 1;
    wrap.appendChild(num);
    if (carrossel.slides.length > 1) {
      const del = document.createElement("button");
      del.className = "del"; del.textContent = "×"; del.title = "Excluir";
      del.addEventListener("click", (ev) => { ev.stopPropagation(); excluirSlide(i); });
      wrap.appendChild(del);
    }
    wrap.addEventListener("click", () => { carrossel.atual = i; renderEditor(); });
    wrap.addEventListener("dragstart", (ev) => ev.dataTransfer.setData("i", i));
    wrap.addEventListener("dragover", (ev) => ev.preventDefault());
    wrap.addEventListener("drop", (ev) => {
      ev.preventDefault();
      moverSlide(Number(ev.dataTransfer.getData("i")), i);
    });
    tira.appendChild(wrap);
  });
}

function renderTemplateList() {
  const lista = document.getElementById("template-list");
  lista.innerHTML = "";
  const p = paleta(getConfig());
  Object.entries(TEMPLATES).forEach(([id, t]) => {
    const card = document.createElement("div");
    card.className = "template-card" + (id === carrossel.template ? " active" : "");
    const [c1, c2] = t.swatch(p);
    const sw = document.createElement("div");
    sw.className = "template-swatch";
    sw.style.background = `linear-gradient(135deg, ${c1} 60%, ${c2} 60%)`;
    card.appendChild(sw);
    card.appendChild(document.createTextNode(t.nome));
    card.addEventListener("click", () => {
      carrossel.template = id;
      renderTemplateList();
      renderEditor();
    });
    lista.appendChild(card);
  });
}

function abrirEditorCarrossel() {
  document.getElementById("editor-carrossel").classList.remove("hidden");
  document.getElementById("slides-strip").classList.remove("hidden");
  document.getElementById("carrossel-acoes").classList.remove("hidden");
  renderTemplateList();
  renderEditor();
}

function excluirSlide(i) {
  carrossel.slides.splice(i, 1);
  if (carrossel.atual >= carrossel.slides.length) carrossel.atual = carrossel.slides.length - 1;
  renderEditor();
}

function moverSlide(de, para) {
  if (de === para) return;
  const [item] = carrossel.slides.splice(de, 1);
  carrossel.slides.splice(para, 0, item);
  carrossel.atual = para;
  renderEditor();
}

/* ---------- edição ao vivo dos campos ---------- */
document.getElementById("edit-titulo").addEventListener("input", (e) => {
  carrossel.slides[carrossel.atual].titulo = e.target.value;
  desenharEm(document.getElementById("edit-canvas"), carrossel.slides[carrossel.atual], carrossel.atual);
  renderTira();
});
document.getElementById("edit-texto").addEventListener("input", (e) => {
  carrossel.slides[carrossel.atual].texto = e.target.value;
  desenharEm(document.getElementById("edit-canvas"), carrossel.slides[carrossel.atual], carrossel.atual);
  renderTira();
});
document.getElementById("edit-badge").addEventListener("change", (e) => {
  carrossel.slides[carrossel.atual].badge = e.target.checked;
  renderEditor();
});
document.getElementById("edit-formato").addEventListener("change", (e) => {
  carrossel.formato = e.target.value;
  renderEditor();
});

/* ---------- botões ---------- */
document.getElementById("btn-add-slide").addEventListener("click", () => {
  carrossel.slides.push({ titulo: "Novo slide", texto: "", badge: false });
  carrossel.atual = carrossel.slides.length - 1;
  renderEditor();
});

document.getElementById("btn-carrossel-branco").addEventListener("click", () => {
  carrossel.slides = [
    { titulo: "Título da capa", texto: "Subtítulo de apoio", badge: true },
    { titulo: "Slide 2", texto: "", badge: false },
    { titulo: "Fale comigo no direct", texto: "Chamada para ação", badge: false },
  ];
  carrossel.atual = 0;
  abrirEditorCarrossel();
});

document.getElementById("btn-baixar-slide").addEventListener("click", () => {
  const tmp = document.createElement("canvas");
  desenharEm(tmp, carrossel.slides[carrossel.atual], carrossel.atual);
  baixarCanvas(tmp, `slide-${String(carrossel.atual + 1).padStart(2, "0")}.png`);
});

document.getElementById("btn-baixar-slides").addEventListener("click", () => {
  carrossel.slides.forEach((slide, i) => {
    const tmp = document.createElement("canvas");
    desenharEm(tmp, slide, i);
    baixarCanvas(tmp, `slide-${String(i + 1).padStart(2, "0")}.png`);
  });
});

function baixarCanvas(canvas, nome) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = nome;
  a.click();
}

const SCHEMA_CARROSSEL = {
  type: "object",
  properties: {
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título curto e impactante do slide (máx 60 caracteres)" },
          texto: { type: "string", description: "Texto de apoio do slide (máx 180 caracteres). Vazio se o título basta." },
        },
        required: ["titulo", "texto"],
        additionalProperties: false,
      },
    },
    legenda: { type: "string", description: "Legenda completa do post com hashtags" },
  },
  required: ["slides", "legenda"],
  additionalProperties: false,
};

document.getElementById("btn-gerar-carrossel").addEventListener("click", async (e) => {
  const tema = v("carrossel-tema");
  if (!tema) return alert("Informe o tema do carrossel.");

  const out = document.getElementById("out-carrossel");
  out.classList.remove("hidden");
  out.classList.add("loading");
  out.textContent = "Criando seu carrossel...";
  e.target.disabled = true;

  try {
    const resultado = await chamarClaudeJSON({
      system:
        "Você é um copywriter especialista em carrosséis virais de Instagram para prestadores de serviço. " +
        "Crie carrosséis de 7 a 9 slides: o 1º é a capa (gancho forte), os do meio desenvolvem o conteúdo " +
        "com UMA ideia por slide, e o último é CTA claro. Escreva em português do Brasil." +
        contextoPosicionamento(),
      messages: [{ role: "user", content: `Crie um carrossel sobre: ${tema}` }],
      jsonSchema: SCHEMA_CARROSSEL,
    });

    carrossel.slides = resultado.slides.map((s, i) => ({
      titulo: s.titulo,
      texto: s.texto,
      badge: i === 0,
    }));
    carrossel.legenda = resultado.legenda;
    carrossel.atual = 0;

    out.classList.remove("loading");
    out.textContent = "LEGENDA DO POST:\n\n" + resultado.legenda;
    adicionarBotaoCopiar(out);
    abrirEditorCarrossel();
  } catch (err) {
    out.classList.remove("loading");
    out.textContent = "❌ " + err.message;
  } finally {
    e.target.disabled = false;
  }
});

/* ============================================================
 * 02 · CONTEÚDO — REEL
 * ============================================================ */
let roteiroReelAtual = "";

document.getElementById("btn-gerar-reel").addEventListener("click", async (e) => {
  const tema = v("reel-tema");
  if (!tema) return alert("Informe o tema do reel.");
  const duracao = v("reel-duracao");

  const texto = await gerarTexto({
    botao: e.target,
    outputId: "out-reel",
    system:
      "Você é um roteirista especialista em Reels que convertem para prestadores de serviço. " +
      REGRAS_ESTILO + contextoPosicionamento(),
    user:
      `Crie um roteiro de Reel de ~${duracao} segundos sobre: ${tema}\n\n` +
      "Estrutura obrigatória:\n" +
      "GANCHO (0-3s): frase que impede a pessoa de rolar o feed\n" +
      "DESENVOLVIMENTO: conteúdo em frases curtas, faladas naturalmente\n" +
      "CTA: chamada para ação clara no final\n\n" +
      "Depois do roteiro, inclua:\n" +
      "- TEXTO NA TELA: sugestão de legendas/textos para aparecer no vídeo\n" +
      "- LEGENDA DO POST: legenda completa com hashtags\n\n" +
      "IMPORTANTE: o roteiro falado deve ser escrito exatamente como será dito em voz alta, " +
      "pronto para ler num teleprompter.",
    aoFinalizar: (t) => { roteiroReelAtual = t; },
  });

  if (texto) document.getElementById("btn-abrir-estudio").classList.remove("hidden");
});

document.getElementById("btn-abrir-estudio").addEventListener("click", () => {
  // extrai só a parte falada (antes de "TEXTO NA TELA"), se existir
  let roteiro = roteiroReelAtual;
  const corte = roteiro.search(/TEXTO NA TELA/i);
  if (corte > 0) roteiro = roteiro.slice(0, corte).trim();
  document.getElementById("estudio-roteiro").value = roteiro;
  localStorage.setItem("estudio_script", roteiro);
  irParaSecao("estudio");
});

/* ============================================================
 * 02 · CONTEÚDO — STORIES
 * ============================================================ */
document.getElementById("btn-gerar-stories").addEventListener("click", (e) => {
  const tema = v("stories-tema");
  if (!tema) return alert("Informe o objetivo da sequência.");
  gerarTexto({
    botao: e.target,
    outputId: "out-stories",
    system:
      "Você é um estrategista de stories de Instagram que geram conversas no direct e vendas para prestadores de serviço. " +
      REGRAS_ESTILO + contextoPosicionamento(),
    user:
      `Crie uma sequência de 5 a 8 stories com o objetivo: ${tema}\n\n` +
      "Para cada story, descreva:\n" +
      "- FORMATO (falando pra câmera, texto na tela, enquete, caixa de perguntas, etc.)\n" +
      "- O QUE MOSTRAR/DIZER (texto exato ou fala)\n" +
      "- INTERAÇÃO (sticker, enquete, CTA)\n\n" +
      "A sequência deve criar curiosidade, gerar interação e terminar com uma chamada clara para o direct ou link.",
  });
});

/* ============================================================
 * 03 · FUNIS
 * ============================================================ */
document.getElementById("btn-gerar-funil").addEventListener("click", (e) => {
  const objetivo = v("funil-objetivo");
  if (!objetivo) return alert("Informe o objetivo do funil.");
  gerarTexto({
    botao: e.target,
    outputId: "out-funil",
    system:
      "Você é um estrategista digital sênior, especialista em funis de venda para prestadores de serviço " +
      "(advogados, médicos, consultores, etc.) — não infoprodutores. " +
      REGRAS_ESTILO + contextoPosicionamento(),
    user:
      `Monte o funil de vendas ideal para este objetivo: ${objetivo}\n\n` +
      "Entregue:\n" +
      "1. VISÃO GERAL DO FUNIL (desenho das etapas em texto: de onde vem a pessoa → até a compra)\n" +
      "2. ETAPA POR ETAPA: para cada etapa, explique o objetivo, o conteúdo/página necessária e a métrica a acompanhar\n" +
      "3. ISCA/ENTRADA recomendada para este nicho (e por quê)\n" +
      "4. SEQUÊNCIA DE MENSAGENS/EMAILS (esboço de 3 a 5 mensagens de acompanhamento)\n" +
      "5. ERROS COMUNS a evitar neste tipo de funil\n" +
      "6. O QUE IMPLEMENTAR PRIMEIRO se estiver começando do zero (plano de 7 dias)",
  });
});

/* ============================================================
 * 04 · ATIVOS
 * ============================================================ */
const PROMPTS_ATIVOS = {
  vsl:
    "Escreva o roteiro completo de uma VSL (vídeo de vendas) seguindo estrutura comprovada: " +
    "gancho, identificação da dor, agitação, apresentação da solução, prova/autoridade, oferta, " +
    "quebra de objeções, garantia, CTA. Escreva o texto exatamente como será falado, com marcações de seção.",
  pagina:
    "Escreva a copy completa de uma página de vendas/captura: headline, subheadline, dores, solução, " +
    "benefícios em bullets, prova social (com placeholders), oferta, quebra de objeções, FAQ (5 perguntas) e CTAs. " +
    "Indique a estrutura visual sugerida de cada bloco.",
  aula:
    "Escreva o roteiro de uma aula/masterclass de 30-45 minutos que gera valor real e termina vendendo naturalmente: " +
    "abertura com promessa, 3 blocos de conteúdo com viradas de percepção, transição para a oferta, oferta e fechamento com CTA.",
  webinar:
    "Escreva o roteiro de um webinar ao vivo de ~60 minutos: abertura, promessa, história pessoal, conteúdo em 3 pilares, " +
    "transição, oferta detalhada, bônus, urgência real, quebra de objeções ao vivo e fechamento. Inclua sugestões de interação com o público.",
};

document.getElementById("btn-gerar-ativo").addEventListener("click", (e) => {
  const tipo = v("ativo-tipo");
  const oferta = v("ativo-oferta");
  if (!oferta) return alert("Informe a oferta/serviço.");
  gerarTexto({
    botao: e.target,
    outputId: "out-ativo",
    system:
      "Você é um copywriter sênior de resposta direta, especialista em vender serviços de alto valor com ética " +
      "(sem promessas exageradas — considere restrições de publicidade de profissões regulamentadas quando aplicável). " +
      REGRAS_ESTILO + contextoPosicionamento(),
    user: `${PROMPTS_ATIVOS[tipo]}\n\nOferta/serviço: ${oferta}`,
  });
});

/* ============================================================
 * 05 · VENDAS — SCRIPTS
 * ============================================================ */
const PROMPTS_SCRIPTS = {
  prospeccao: "script de prospecção/primeiro contato (mensagem fria e resposta a quem chegou pelo conteúdo)",
  qualificacao: "script de qualificação (perguntas para entender se o lead tem o problema, urgência e condições de contratar)",
  reuniao: "script de condução de reunião/consulta (abertura, diagnóstico, apresentação da solução, próximos passos)",
  fechamento: "script de fechamento (como apresentar preço, criar segurança e conduzir ao sim)",
  objecoes: "guia de quebra das 8 objeções mais comuns do nicho, com resposta pronta para cada uma",
  followup: "sequência de follow-up (5 mensagens espaçadas para retomar leads que sumiram, sem parecer insistente)",
};

document.getElementById("btn-gerar-script").addEventListener("click", (e) => {
  const etapa = v("script-etapa");
  gerarTexto({
    botao: e.target,
    outputId: "out-script",
    system:
      "Você é um treinador de vendas consultivas para prestadores de serviço de alto valor. " +
      "Os scripts devem soar humanos e naturais no WhatsApp/telefone do Brasil — nunca robóticos. " +
      REGRAS_ESTILO + contextoPosicionamento(),
    user:
      `Crie um ${PROMPTS_SCRIPTS[etapa]}.\n\n` +
      "Formato: mensagens/falas prontas para usar (entre aspas), com orientação curta antes de cada uma " +
      "explicando quando e por que usar. Inclua variações para WhatsApp e para conversa por voz quando fizer sentido.",
  });
});

/* ============================================================
 * 05 · VENDAS — COPILOTO (chat multi-turno)
 * ============================================================ */
let copilotoMensagens = [];

const SYSTEM_COPILOTO =
  "Você é um copiloto de vendas em tempo real para um prestador de serviço. " +
  "O usuário vai colar situações reais de negociação (mensagens de clientes, objeções, dúvidas) " +
  "e você responde com: 1) leitura rápida da situação (1-2 frases), 2) a resposta pronta para enviar " +
  "ao cliente (entre aspas, tom natural de WhatsApp brasileiro), 3) próximo passo estratégico. " +
  "Seja rápido e prático — o usuário pode estar no meio da conversa com o cliente agora.";

document.getElementById("btn-copiloto-enviar").addEventListener("click", enviarCopiloto);
document.getElementById("copiloto-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviarCopiloto();
});

async function enviarCopiloto() {
  const input = document.getElementById("copiloto-input");
  const texto = input.value.trim();
  if (!texto) return;
  input.value = "";

  copilotoMensagens.push({ role: "user", content: texto });
  desenharChat();

  const chat = document.getElementById("copiloto-chat");
  const bolha = document.createElement("div");
  bolha.className = "chat-msg assistant";
  bolha.textContent = "…";
  chat.appendChild(bolha);
  chat.scrollTop = chat.scrollHeight;

  try {
    const resposta = await chamarClaude({
      system: SYSTEM_COPILOTO + contextoPosicionamento(),
      messages: copilotoMensagens,
      maxTokens: 2000,
      onDelta: (t) => { bolha.textContent = t; chat.scrollTop = chat.scrollHeight; },
    });
    copilotoMensagens.push({ role: "assistant", content: resposta });
    bolha.textContent = resposta;
  } catch (e) {
    bolha.textContent = "❌ " + e.message;
    copilotoMensagens.pop(); // remove o turno do usuário que falhou
  }
  chat.scrollTop = chat.scrollHeight;
}

function desenharChat() {
  const chat = document.getElementById("copiloto-chat");
  chat.innerHTML = "";
  for (const m of copilotoMensagens) {
    const div = document.createElement("div");
    div.className = "chat-msg " + (m.role === "user" ? "user" : "assistant");
    div.textContent = m.content;
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("btn-copiloto-limpar").addEventListener("click", () => {
  copilotoMensagens = [];
  desenharChat();
});

/* ---------- inicialização ---------- */
carregarConfig();

// restaura formulário e documento de posicionamento
try {
  const form = JSON.parse(localStorage.getItem("posicionamento_form") || "null");
  if (form) {
    document.getElementById("pos-nome").value = form.nome || "";
    document.getElementById("pos-nicho").value = form.nicho || "";
    document.getElementById("pos-publico").value = form.publico || "";
    document.getElementById("pos-servicos").value = form.servicos || "";
    document.getElementById("pos-diferenciais").value = form.diferenciais || "";
    document.getElementById("pos-tom").value = form.tom || "";
  }
} catch (_) { /* ignora */ }

const posDoc = localStorage.getItem("posicionamento_doc");
if (posDoc) {
  const out = document.getElementById("out-posicionamento");
  out.textContent = posDoc;
  out.classList.remove("hidden");
  adicionarBotaoCopiar(out);
}
