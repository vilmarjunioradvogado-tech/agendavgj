// Injeta um botão flutuante nas páginas do PJe, permite selecionar
// visualmente um trecho da tela (modo "picker") e converte o trecho
// escolhido para Markdown usando o conversor de converter.js.
(function () {
  if (window.__pjeMdInjected) return;
  window.__pjeMdInjected = true;

  const isTopFrame = window.self === window.top;
  let pickerActive = false;
  let lastHovered = null;
  let panelEl = null;

  function createFloatingButton() {
    const btn = document.createElement('button');
    btn.id = 'pje-md-fab';
    btn.type = 'button';
    btn.textContent = 'PJe → MD';
    btn.title = 'Selecionar trecho do processo e converter para Markdown';
    btn.addEventListener('click', togglePicker);
    document.documentElement.appendChild(btn);
  }

  function togglePicker() {
    if (pickerActive) stopPicker();
    else startPicker();
  }

  function startPicker() {
    pickerActive = true;
    document.body.classList.add('pje-md-picking');
    document.addEventListener('mouseover', onHover, true);
    document.addEventListener('click', onPick, true);
    document.addEventListener('keydown', onKeyDown, true);
    showHint('Passe o mouse sobre o trecho do processo e clique para selecionar. Esc para cancelar.');
  }

  function stopPicker() {
    pickerActive = false;
    document.body.classList.remove('pje-md-picking');
    document.removeEventListener('mouseover', onHover, true);
    document.removeEventListener('click', onPick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    if (lastHovered) {
      lastHovered.classList.remove('pje-md-hover');
      lastHovered = null;
    }
    hideHint();
  }

  function isOwnUi(el) {
    return !!(el.closest('#pje-md-panel') || el.closest('#pje-md-hint') || el.id === 'pje-md-fab');
  }

  function onHover(e) {
    const el = e.target;
    if (!el || isOwnUi(el)) return;
    if (lastHovered && lastHovered !== el) lastHovered.classList.remove('pje-md-hover');
    el.classList.add('pje-md-hover');
    lastHovered = el;
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') stopPicker();
  }

  function onPick(e) {
    const el = e.target;
    if (!el || isOwnUi(el)) return;
    e.preventDefault();
    e.stopPropagation();
    const target = el;
    stopPicker();
    convertAndShow(target);
  }

  function convertAndShow(el) {
    const markdown = window.PjeMdConverter.htmlElementToMarkdown(el);
    showPanel(markdown);
    persist(markdown);
  }

  function persist(markdown) {
    try {
      chrome.storage.local.set({
        pjeMdLast: markdown,
        pjeMdUrl: location.href,
        pjeMdCapturedAt: new Date().toISOString(),
      });
    } catch (e) { /* contexto sem chrome.storage disponível */ }
  }

  function showHint(text) {
    hideHint();
    const hint = document.createElement('div');
    hint.id = 'pje-md-hint';
    hint.textContent = text;
    document.documentElement.appendChild(hint);
  }

  function hideHint() {
    const hint = document.getElementById('pje-md-hint');
    if (hint) hint.remove();
  }

  function showPanel(markdown) {
    closePanel();
    panelEl = document.createElement('div');
    panelEl.id = 'pje-md-panel';
    panelEl.innerHTML = `
      <div id="pje-md-panel-header">
        <span>Markdown gerado</span>
        <button type="button" data-action="close" title="Fechar">✕</button>
      </div>
      <textarea id="pje-md-panel-text" spellcheck="false"></textarea>
      <div id="pje-md-panel-actions">
        <button type="button" data-action="copy">Copiar</button>
        <button type="button" data-action="download">Baixar .md</button>
        <button type="button" data-action="reselect">Selecionar outro trecho</button>
      </div>
    `;
    document.documentElement.appendChild(panelEl);
    const textarea = panelEl.querySelector('#pje-md-panel-text');
    textarea.value = markdown;

    panelEl.querySelector('[data-action="close"]').addEventListener('click', closePanel);
    panelEl.querySelector('[data-action="copy"]').addEventListener('click', () => {
      textarea.select();
      navigator.clipboard.writeText(textarea.value).then(() => flashButton('copy', 'Copiado!'));
    });
    panelEl.querySelector('[data-action="download"]').addEventListener('click', () => {
      downloadMarkdown(textarea.value);
    });
    panelEl.querySelector('[data-action="reselect"]').addEventListener('click', () => {
      closePanel();
      startPicker();
    });
  }

  function flashButton(action, text) {
    const btn = panelEl && panelEl.querySelector(`[data-action="${action}"]`);
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, 1200);
  }

  function closePanel() {
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
  }

  function downloadMarkdown(markdown) {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestFileName();
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function suggestFileName() {
    const match = document.title.match(/\d[\d.\-/]{10,}\d/);
    const base = match ? match[0].replace(/[^0-9.\-]/g, '') : 'processo';
    return `${base}-pje.md`;
  }

  if (isTopFrame) {
    createFloatingButton();
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === 'pje-md-ping') {
      sendResponse({ ok: true });
      return true;
    }
    if (!isTopFrame) return undefined;
    if (message && message.action === 'pje-md-activate-picker') {
      startPicker();
      sendResponse({ ok: true });
    } else if (message && message.action === 'pje-md-convert-page') {
      convertAndShow(document.body);
      sendResponse({ ok: true });
    }
    return true;
  });
})();
