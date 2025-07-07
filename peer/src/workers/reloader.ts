import { PluginManager } from "../classes/PluginManager";
import type { Message } from "../interfaces/Message";

chrome.runtime.onMessage.addListener((message: Message, sender) => {
    if (message.type === 'GOTO' && sender.tab?.id) {
        const pluginManager = new PluginManager();
        const tabId = sender.tab.id;
        const href = message.data.href;

        pluginManager.navigate(tabId, href);
    }
});