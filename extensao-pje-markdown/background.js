chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['pjeMdLast'], (data) => {
    if (data.pjeMdLast === undefined) {
      chrome.storage.local.set({ pjeMdLast: '' });
    }
  });
});
