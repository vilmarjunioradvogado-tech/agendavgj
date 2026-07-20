/* ============================================================
 * api.js — comunicação com a API da Anthropic (Claude)
 * Chamada direta do navegador com a chave do próprio usuário.
 * ============================================================ */

const API_URL = "https://api.anthropic.com/v1/messages";

function getConfig() {
  return {
    apiKey: localStorage.getItem("cfg_api_key") || "",
    model: localStorage.getItem("cfg_model") || "claude-opus-4-8",
    corFundo: localStorage.getItem("cfg_cor_fundo") || "#14213d",
    corTexto: localStorage.getItem("cfg_cor_texto") || "#ffffff",
    corDestaque: localStorage.getItem("cfg_cor_destaque") || "#c9a227",
    instagram: localStorage.getItem("cfg_instagram") || "",
  };
}

function getPosicionamento() {
  return localStorage.getItem("posicionamento_doc") || "";
}

/**
 * Contexto de posicionamento injetado em todos os prompts das outras seções.
 */
function contextoPosicionamento() {
  const doc = getPosicionamento();
  if (!doc) return "";
  return (
    "\n\n<posicionamento_do_negocio>\n" +
    doc +
    "\n</posicionamento_do_negocio>\n\n" +
    "Todo o conteúdo gerado deve seguir fielmente esse posicionamento: " +
    "tom de voz, público-alvo, promessa e identidade da marca."
  );
}

/**
 * Chamada com streaming (SSE). Chama onDelta(textoParcial) a cada trecho
 * e resolve com o texto completo ao final.
 */
async function chamarClaude({ system, messages, maxTokens = 8000, jsonSchema = null, onDelta = null }) {
  const cfg = getConfig();
  if (!cfg.apiKey) {
    throw new Error("Configure sua chave da API Anthropic em ⚙️ Configurações.");
  }

  const body = {
    model: cfg.model,
    max_tokens: maxTokens,
    stream: true,
    system,
    messages,
  };

  // Adaptive thinking nos modelos que suportam (Haiku 4.5 não usa adaptive)
  if (!cfg.model.includes("haiku")) {
    body.thinking = { type: "adaptive" };
  }

  // Saída estruturada (JSON garantido) quando um schema é passado
  if (jsonSchema) {
    body.output_config = { format: { type: "json_schema", schema: jsonSchema } };
  }

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    let msg = `Erro ${resp.status} na API.`;
    try {
      const err = await resp.json();
      if (err?.error?.message) msg = err.error.message;
    } catch (_) { /* corpo não-JSON */ }
    if (resp.status === 401) msg = "Chave de API inválida. Verifique em ⚙️ Configurações.";
    if (resp.status === 429) msg = "Limite de requisições atingido. Aguarde um minuto e tente de novo.";
    throw new Error(msg);
  }

  // Leitura do stream SSE
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let texto = "";
  let stopReason = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const linhas = buffer.split("\n");
    buffer = linhas.pop(); // última linha pode estar incompleta

    for (const linha of linhas) {
      if (!linha.startsWith("data: ")) continue;
      const payload = linha.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      let ev;
      try { ev = JSON.parse(payload); } catch (_) { continue; }

      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
        texto += ev.delta.text;
        if (onDelta) onDelta(texto);
      } else if (ev.type === "message_delta" && ev.delta?.stop_reason) {
        stopReason = ev.delta.stop_reason;
      } else if (ev.type === "error") {
        throw new Error(ev.error?.message || "Erro no stream da API.");
      }
    }
  }

  if (stopReason === "refusal") {
    throw new Error("A IA recusou esta solicitação. Reformule o pedido e tente novamente.");
  }
  if (stopReason === "max_tokens") {
    texto += "\n\n[⚠️ Resposta truncada por limite de tamanho]";
  }

  return texto;
}

/**
 * Variante que espera JSON estruturado e devolve o objeto parseado.
 */
async function chamarClaudeJSON(opts) {
  const texto = await chamarClaude(opts);
  try {
    return JSON.parse(texto);
  } catch (_) {
    // fallback: tenta extrair o primeiro bloco JSON do texto
    const m = texto.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("A IA não retornou um JSON válido. Tente novamente.");
  }
}
