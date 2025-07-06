function log(...args) {
  console.log("[WebRTC]", ...args);
}
class PluginManager {
  pages = /* @__PURE__ */ new Map();
  constructor() {
    this.loadPages();
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.type === "I_DIED" && sender.tab?.id) {
        this.pages.delete(sender.tab.id);
      }
    });
  }
  async loadPages() {
    chrome.storage.local.get(["pages"], (result) => {
      if (result.pages) {
        const entries = JSON.parse(result.pages);
        this.pages = new Map(entries);
      }
    });
  }
  persistPages() {
    const entries = Array.from(this.pages.entries());
    chrome.storage.local.set({ pages: JSON.stringify(entries) });
  }
  async injectStreamerByUrl(url, script) {
    chrome.tabs.query({ active: true, currentWindow: true, url }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        log("No valid tab found");
        return;
      }
      const tabId = tabs[0].id;
      if (this.pages.has(tabId)) {
        chrome.tabs.reload(tabId, () => {
          const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
              this.injectStreamer(tabId, script);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
      } else {
        this.injectStreamer(tabId, script);
      }
    });
  }
  async injectListenerByUrl(url, script, target) {
    chrome.tabs.query({ active: true, currentWindow: true, url }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        log("No valid tab found");
        return;
      }
      const tabId = tabs[0].id;
      if (this.pages.has(tabId)) {
        chrome.tabs.reload(tabId, () => {
          const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
              this.injectListener(tabId, script, target);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
      } else {
        this.injectListener(tabId, script, target);
      }
    });
  }
  injectStreamer(tabId, script) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: [script]
    }, () => {
      if (chrome.runtime.lastError) {
        log("Failed to inject script");
        return;
      } else {
        log("Successfully injected script");
      }
      this.pages.set(tabId, { script });
      this.persistPages();
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "STREAMER_UUID") {
          this.pages.set(tabId, {
            uuid: message.data.uuid,
            script
          });
          this.persistPages();
        }
      });
    });
  }
  async injectListener(tabId, script, target) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: [script]
    }, () => {
      if (chrome.runtime.lastError) {
        log("Failed to inject script");
        return;
      } else {
        log("Successfully injected script");
      }
      this.pages.set(tabId, { target, script });
      this.persistPages();
      chrome.tabs.sendMessage(tabId, {
        type: "TARGET",
        data: { target }
      });
    });
  }
  async getCurrentPage() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].id) {
      return void 0;
    }
    const tabId = tabs[0].id;
    return this.pages.get(tabId);
  }
  kill(tabId) {
    this.pages.delete(tabId);
    this.persistPages();
    return chrome.tabs.reload(tabId);
  }
}
chrome.runtime.onMessage.addListener((message, sender) => {
  log("MESSAGE :", message);
  if (message.type === "GOTO" && sender.tab?.id && message.data && typeof message.data.href === "string") {
    const tabId = sender.tab.id;
    const href = message.data.href;
    const pluginManager = new PluginManager();
    chrome.tabs.update(tabId, { url: href }, (updatedTab) => {
      if (updatedTab && updatedTab.id) {
        const listener = (updatedTabId, changeInfo) => {
          if (updatedTabId === updatedTab.id && changeInfo.status === "complete") {
            const page = pluginManager.pages.get(tabId);
            if (page && typeof page.script === "string" && typeof page.target === "string") {
              pluginManager.injectListener(updatedTab.id, page.script, page.target);
              chrome.tabs.onUpdated.removeListener(listener);
            }
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      }
    });
  }
});
