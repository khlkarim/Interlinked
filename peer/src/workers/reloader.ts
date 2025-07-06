import { PluginManager } from "../classes/PluginManager";
import type { Message } from "../interfaces/Message";
import { log } from "../utils/logger";

chrome.runtime.onMessage.addListener((message: Message, sender) => {
    log('MESSAGE :', message);

    if (message.type === 'GOTO' && sender.tab?.id && message.data && typeof message.data.href === 'string') {
        const tabId = sender.tab.id;
        const href = message.data.href;

        const pluginManager = new PluginManager();

        chrome.tabs.update(tabId, { url: href }, (updatedTab) => {
            if (updatedTab && updatedTab.id) {
                const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                    if (updatedTabId === updatedTab.id && changeInfo.status === 'complete') {
                        const page = pluginManager.pages.get(tabId) as { script: string, target: string } | undefined;

                        if (page && typeof page.script === 'string' && typeof page.target === 'string') {
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