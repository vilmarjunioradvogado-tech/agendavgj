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
 * 02 · CONTEÚDO — CARROSSEL (com arte via canvas)
 * ============================================================ */
let slidesAtuais = [];

const SCHEMA_CARROSSEL = {
  type: "object",
  properties: {
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título curto e impactante do slide (máx 60 caracteres)" },
          texto: { type: "string", description: "Texto de apoio do slide (máx 220 caracteres). Vazio se o título basta." },
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
  const preview = document.getElementById("carrossel-preview");
  const acoes = document.getElementById("carrossel-acoes");
  out.classList.remove("hidden");
  out.classList.add("loading");
  out.textContent = "Criando seu carrossel...";
  preview.innerHTML = "";
  acoes.classList.add("hidden");
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

    slidesAtuais = resultado.slides;
    out.classList.remove("loading");
    out.textContent = "LEGENDA DO POST:\n\n" + resultado.legenda;
    adicionarBotaoCopiar(out);

    // renderiza as artes
    preview.innerHTML = "";
    resultado.slides.forEach((slide, i) => {
      const url = desenharSlide(slide, i, resultado.slides.length);
      const img = document.createElement("img");
      img.src = url;
      img.className = "slide-thumb";
      img.title = `Slide ${i + 1}`;
      preview.appendChild(img);
    });
    acoes.classList.remove("hidden");
  } catch (err) {
    out.classList.remove("loading");
    out.textContent = "❌ " + err.message;
  } finally {
    e.target.disabled = false;
  }
});

/** Desenha um slide 1080x1350 no canvas e retorna dataURL PNG. */
function desenharSlide(slide, indice, total) {
  const cfg = getConfig();
  const canvas = document.getElementById("slide-canvas");
  const ctx = canvas.getContext("2d");
  const W = 1080, H = 1350;

  // fundo
  ctx.fillStyle = cfg.corFundo;
  ctx.fillRect(0, 0, W, H);

  // barra de destaque no topo
  ctx.fillStyle = cfg.corDestaque;
  ctx.fillRect(0, 0, W, 18);

  const ehCapa = indice === 0;
  const ehUltimo = indice === total - 1;

  // título
  ctx.fillStyle = cfg.corTexto;
  ctx.textAlign = "left";
  const tamTitulo = ehCapa ? 84 : 64;
  ctx.font = `bold ${tamTitulo}px Arial, sans-serif`;
  const linhasTitulo = quebrarTexto(ctx, slide.titulo, W - 160);
  let y = ehCapa ? 420 : 300;
  for (const linha of linhasTitulo) {
    ctx.fillText(linha, 80, y);
    y += tamTitulo * 1.2;
  }

  // linha decorativa
  ctx.fillStyle = cfg.corDestaque;
  ctx.fillRect(80, y + 10, 140, 8);
  y += 90;

  // texto de apoio
  if (slide.texto) {
    ctx.fillStyle = cfg.corTexto;
    ctx.globalAlpha = 0.92;
    ctx.font = "44px Arial, sans-serif";
    const linhasTexto = quebrarTexto(ctx, slide.texto, W - 160);
    for (const linha of linhasTexto) {
      ctx.fillText(linha, 80, y);
      y += 62;
    }
    ctx.globalAlpha = 1;
  }

  // rodapé
  ctx.font = "34px Arial, sans-serif";
  ctx.fillStyle = cfg.corTexto;
  ctx.globalAlpha = 0.75;
  if (cfg.instagram) ctx.fillText(cfg.instagram, 80, H - 70);
  ctx.textAlign = "right";
  ctx.fillText(ehUltimo ? "" : `${indice + 1}/${total}  →`, W - 80, H - 70);
  ctx.globalAlpha = 1;

  // seta "arraste" na capa
  if (ehCapa) {
    ctx.textAlign = "right";
    ctx.fillStyle = cfg.corDestaque;
    ctx.font = "bold 40px Arial, sans-serif";
    ctx.fillText("ARRASTE  →", W - 80, H - 140);
  }

  return canvas.toDataURL("image/png");
}

function quebrarTexto(ctx, texto, larguraMax) {
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

document.getElementById("btn-baixar-slides").addEventListener("click", () => {
  slidesAtuais.forEach((slide, i) => {
    const url = desenharSlide(slide, i, slidesAtuais.length);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide-${String(i + 1).padStart(2, "0")}.png`;
    a.click();
  });
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
