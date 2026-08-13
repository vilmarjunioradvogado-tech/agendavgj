const statusEl = document.getElementById('status');
const outputEl = document.getElementById('markdown-output');

function setStatus(text) {
  statusEl.textContent = text;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'pje-md-ping' });
    return true;
  } catch (e) {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['converter.js', 'content.js'] });
      await chrome.scripting.insertCSS({ target: { tabId }, files: ['overlay.css'] });
      return true;
    } catch (err) {
      return false;
    }
  }
}

async function sendAction(action) {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    setStatus('Não foi possível identificar a aba atual.');
    return;
  }
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
    setStatus('Abra a página do processo no PJe antes de usar a extensão.');
    return;
  }
  const ready = await ensureContentScript(tab.id);
  if (!ready) {
    setStatus('Não foi possível acessar esta página. Recarregue a aba e tente novamente.');
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { action });
    window.close();
  } catch (e) {
    setStatus('Erro ao comunicar com a página. Recarregue a aba e tente novamente.');
  }
}

async function loadLastMarkdown() {
  const data = await chrome.storage.local.get(['pjeMdLast', 'pjeMdCapturedAt']);
  if (data.pjeMdLast) {
    outputEl.value = data.pjeMdLast;
    const when = data.pjeMdCapturedAt ? new Date(data.pjeMdCapturedAt).toLocaleString('pt-BR') : '';
    setStatus(when ? `Última captura: ${when}` : '');
  }
}

document.getElementById('btn-select').addEventListener('click', () => sendAction('pje-md-activate-picker'));
document.getElementById('btn-whole-page').addEventListener('click', () => sendAction('pje-md-convert-page'));

document.getElementById('btn-copy').addEventListener('click', async () => {
  if (!outputEl.value) return;
  await navigator.clipboard.writeText(outputEl.value);
  setStatus('Copiado para a área de transferência.');
});

document.getElementById('btn-download').addEventListener('click', () => {
  if (!outputEl.value) return;
  const blob = new Blob([outputEl.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: 'processo-pje.md', saveAs: true }, () => {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
});

loadLastMarkdown();
