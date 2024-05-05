chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("https://www.sahibinden.com/")) {
      // Perform actions when a new tab is activated
      chrome.tabs.sendMessage(tab.id, { action: "reloadContentScript" });
    }
  });
});
