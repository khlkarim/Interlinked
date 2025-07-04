import type { Message } from "../interfaces/Message";
import type { Plugin } from "../interfaces/Plugin";
import { log } from "../utils/logger";

type CleanupFn = () => void;

class Manager {
    private static async injectScript(tabId: number, file: string): Promise<void> {
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

    private static sendKillMessage(tabId: number, name: string) {
        chrome.tabs.sendMessage(tabId, { type: "KILL", data: name });
    }

    static async inject(tabId: number, plugin: Plugin, type: "streamer" | "listener", uuidCallback?: (uuid: string) => void, uuid?: string): Promise<CleanupFn> {
        const tab = { id: tabId };
        if (!tab?.id) {
            log("No matching active tab found.");
            return () => {};
        }

        const alreadyInjected = false;
        if (alreadyInjected) {
            log(`Script ${plugin.name} already injected.`);
        } else {
            try {
                const fileToInject = type === "streamer" ? plugin.streamerPath : plugin.listenerPath;
                await this.injectScript(tab.id, fileToInject);
                log(`Script ${plugin.name} injected.`);

                if (type === "listener" && uuid) {
                    chrome.tabs.sendMessage(tab.id, { type: "tabId", data: { tabId: tab.id }});
                    chrome.tabs.sendMessage(tab.id, { type: "uuid", data: { uuid }});
                }
            } catch (err) {
                log(`Injection failed: ${(err as Error).message}`);
            }
        }

        let listener: ((msg: Message, sender: chrome.runtime.MessageSender) => void) | undefined;

        if (type === "streamer" && uuidCallback) {
            listener = (msg, sender) => {
                if (sender.tab?.id === tab.id) {
                    uuidCallback(msg.data.uuid);
                }
            };
            chrome.runtime.onMessage.addListener(listener);
        }

        return () => {
            this.sendKillMessage(tab.id!, plugin.name);
            if (listener) chrome.runtime.onMessage.removeListener(listener);
            log(`Script ${plugin.name} cleanup done.`);
        };
    }
}


chrome.runtime.onMessage.addListener((message: Message) => {
    if(message.type === 'RELOAD_ME') {
        console.log(message);

        const tabId = Number(message.data.tabId);

        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
            log(`Error getting tab: ${chrome.runtime.lastError.message}`);
            return;
            }

            // If the tab is loading, wait for it to finish
            if (tab.status === "loading") {
            const onUpdated = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === "complete") {
                chrome.tabs.onUpdated.removeListener(onUpdated);
                Manager.inject(tabId, {
                    name: message.data.name,
                    targetUrl: message.data.targetUrl,
                    listenerPath: message.data.listenerPath,
                    streamerPath: message.data.streamerPath
                }, 'listener', undefined, message.data.uuid);
                }
            };
            chrome.tabs.onUpdated.addListener(onUpdated);
            } else {
            Manager.inject(tabId, {
                name: message.data.name,
                targetUrl: message.data.targetUrl,
                listenerPath: message.data.listenerPath,
                streamerPath: message.data.streamerPath
            }, 'listener', undefined, message.data.uuid);
            }
        });
    }
});