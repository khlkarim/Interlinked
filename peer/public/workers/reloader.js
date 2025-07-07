function log(...args) {
  console.log("[WebRTC]", ...args);
}
class PluginManager {
  ready;
  injections = /* @__PURE__ */ new Map();
  constructor() {
    this.ready = this.loadInjections();
  }
  async loadInjections() {
    log("Trying to load");
    return new Promise((resolve) => {
      chrome.storage.local.get(["injections"], (result) => {
        if (result.injections) {
          const entries = JSON.parse(result.injections);
          this.injections = new Map(entries);
        }
        log("Loading :", this.injections);
        resolve();
      });
    });
  }
  persistInjections() {
    log("Persisting: ", this.injections);
    const entries = Array.from(this.injections.entries());
    chrome.storage.local.set({ injections: JSON.stringify(entries) });
  }
  async activeTabId(url) {
    const query = { active: true, currentWindow: true };
    if (url) query.url = url;
    const tabs = await chrome.tabs.query(query);
    if (!tabs.length || typeof tabs[0].id === "undefined") {
      throw new Error("No active tab found" + (url ? ` with the specified URL (${url})` : "."));
    }
    return tabs[0].id;
  }
  async queryInjections(tabId, type, plugin) {
    await this.ready;
    const injection = this.injections.get(tabId);
    if (injection && injection.type === type && (!plugin || injection.plugin.name === plugin.name)) {
      return injection;
    }
  }
  async inject(tabId, type, plugin, uuid, onInjected) {
    await this.ready;
    const fileToInject = type === "streamer" ? plugin.streamerPath : plugin.listenerPath;
    chrome.scripting.executeScript({
      target: { tabId },
      files: [fileToInject]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to inject script:", chrome.runtime.lastError);
        return;
      }
      console.log("Script injected successfully.");
      if (type === "streamer") {
        const listener = (message, sender) => {
          if (message.type === "STREAMER_UUID" && sender.tab?.id === tabId) {
            const receivedUuid = message.data.uuid;
            if (onInjected) onInjected(receivedUuid);
            this.injections.set(tabId, { uuid: receivedUuid, type, plugin });
            this.persistInjections();
            log(this.injections);
            chrome.runtime.onMessage.removeListener(listener);
          }
        };
        chrome.runtime.onMessage.addListener(listener);
      } else if (uuid) {
        chrome.tabs.sendMessage(tabId, {
          type: "TARGET",
          data: { target: uuid }
        }, () => {
          this.injections.set(tabId, { uuid, type, plugin });
          this.persistInjections();
          log(this.injections);
        });
      }
    });
  }
  async navigate(tabId, href) {
    await this.ready;
    log(this.injections);
    const injection = this.injections.get(tabId);
    if (!injection || injection.type !== "listener") return;
    chrome.tabs.update(tabId, { url: href }, (updatedTab) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to update tab:", chrome.runtime.lastError);
        return;
      }
      if (updatedTab?.id != null) {
        const listener = (updatedTabId, changeInfo) => {
          if (updatedTabId === updatedTab.id && changeInfo.status === "complete") {
            this.inject(updatedTab.id, injection.type, injection.plugin, injection.uuid);
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      }
    });
  }
  async kill(tabId) {
    await this.ready;
    this.injections.delete(tabId);
    this.persistInjections();
    chrome.tabs.reload(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to reload tab:", chrome.runtime.lastError);
      }
    });
  }
}
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "GOTO" && sender.tab?.id) {
    const pluginManager = new PluginManager();
    const tabId = sender.tab.id;
    const href = message.data.href;
    pluginManager.navigate(tabId, href);
  }
});
