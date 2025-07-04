function log(...args) {
  console.log("[WebRTC]", ...args);
}
class Manager {
  static async injectScript(tabId, file) {
    return new Promise((resolve, reject) => {
      chrome.scripting.executeScript(
        { target: { tabId }, files: [file] },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    });
  }
  static sendKillMessage(tabId, name) {
    chrome.tabs.sendMessage(tabId, { type: "KILL", data: name });
  }
  static async inject(tabId, plugin, type, uuidCallback, uuid) {
    const tab = { id: tabId };
    if (!tab?.id) {
      log("No matching active tab found.");
      return () => {
      };
    }
    {
      try {
        const fileToInject = type === "streamer" ? plugin.streamerPath : plugin.listenerPath;
        await this.injectScript(tab.id, fileToInject);
        log(`Script ${plugin.name} injected.`);
        if (type === "listener" && uuid) {
          chrome.tabs.sendMessage(tab.id, { type: "tabId", data: { tabId: tab.id } });
          chrome.tabs.sendMessage(tab.id, { type: "uuid", data: { uuid } });
        }
      } catch (err) {
        log(`Injection failed: ${err.message}`);
      }
    }
    let listener;
    if (type === "streamer" && uuidCallback) {
      listener = (msg, sender) => {
        if (sender.tab?.id === tab.id) {
          uuidCallback(msg.data.uuid);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
    }
    return () => {
      this.sendKillMessage(tab.id, plugin.name);
      if (listener) chrome.runtime.onMessage.removeListener(listener);
      log(`Script ${plugin.name} cleanup done.`);
    };
  }
}
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "RELOAD_ME") {
    console.log(message);
    const tabId = Number(message.data.tabId);
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        log(`Error getting tab: ${chrome.runtime.lastError.message}`);
        return;
      }
      if (tab.status === "loading") {
        const onUpdated = (updatedTabId, changeInfo) => {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            Manager.inject(tabId, {
              name: message.data.name,
              targetUrl: message.data.targetUrl,
              listenerPath: message.data.listenerPath,
              streamerPath: message.data.streamerPath
            }, "listener", void 0, message.data.uuid);
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
      } else {
        Manager.inject(tabId, {
          name: message.data.name,
          targetUrl: message.data.targetUrl,
          listenerPath: message.data.listenerPath,
          streamerPath: message.data.streamerPath
        }, "listener", void 0, message.data.uuid);
      }
    });
  }
});
