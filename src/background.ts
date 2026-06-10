chrome.runtime.onInstalled.addListener(() => {
  if (process.env.NODE_ENV !== 'development') return;

  chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.reload(tab.id);
    }
  });
});
