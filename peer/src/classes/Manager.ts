import type { Message } from "../interfaces/Message";
import type { Plugin } from "../interfaces/Plugin";
import { log } from "../utils/logger";

type CleanupFn = () => void;

export class Manager {
    private static async findTab(url: string): Promise<chrome.tabs.Tab | undefined> {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true, url: [url] });
        return tabs[0];
    }

    private static async isInjected(tabId: number, name: string): Promise<boolean> {
        return new Promise(resolve => {
            chrome.tabs.sendMessage(tabId, { type: "IS_INJECTED", data: name }, response => {
                resolve(response?.injected ?? false);
            });
        });
    }

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

    static async inject(plugin: Plugin, type: "streamer" | "listener", uuidCallback?: (uuid: string) => void, uuid?: string): Promise<CleanupFn> {
        const tab = await this.findTab(plugin.targetUrl);
        if (!tab?.id) {
            log("No matching active tab found.");
            return () => {};
        }

        const alreadyInjected = await this.isInjected(tab.id, plugin.name);
        if (alreadyInjected) {
            log(`Script ${plugin.name} already injected.`);
        } else {
            try {
                const fileToInject = type === "streamer" ? plugin.streamerPath : plugin.listenerPath;
                await this.injectScript(tab.id, fileToInject);
                log(`Script ${plugin.name} injected.`);

                if (type === "listener" && uuid) {
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
