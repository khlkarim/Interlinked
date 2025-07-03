import type { Injectable } from "../interfaces/Injectable";
import { log } from "../utils/logger";

export class Manager {
    private static async findMatchingTab(urlPattern: string): Promise<chrome.tabs.Tab | undefined> {
        log('THE URL: ', urlPattern);
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true, url: urlPattern });
        return tabs[0];
    }

    private static injectScriptIfNeeded(tabId: number, script: Injectable, onInjected?: () => void) {
        chrome.tabs.sendMessage(tabId, { type: "IS_INJECTED", script: script.name }, (response) => {
            if (response?.injected) {
                log(`Script ${script.name} already injected.`);
                onInjected?.();
            } else {
                chrome.scripting.executeScript({
                    target: { tabId },
                    files: [script.name]
                }, () => {
                    if (chrome.runtime.lastError) {
                        log(`Injection failed: ${chrome.runtime.lastError.message}`);
                    } else {
                        log(`Script ${script.name} injected.`);
                        onInjected?.();
                    }
                });
            }
        });
    }

    static injectStreamer(script: Injectable, callback: (uuid: string) => void): () => void {
        let cleanup = () => {};
        log('I INJECT STREAMER');

        Manager.findMatchingTab(script.url).then((tab) => {
            if (!tab || !tab.id) {
                log("No matching active tab found.");
                return;
            }

            const tabId = tab.id;

            // Inject script if needed
            Manager.injectScriptIfNeeded(tabId, script);

            // Add listener for messages from the content script
            const messageListener = (msg: string, sender: chrome.runtime.MessageSender) => {
                log('MANAGER RECEIVED:', msg);
                if (sender.tab?.id === tabId) {
                    callback(JSON.parse(msg).data);
                }
            };
            chrome.runtime.onMessage.addListener(messageListener);

            // Cleanup function
            cleanup = () => {
                chrome.tabs.sendMessage(tabId, { type: "KILL", script: script.name });
                chrome.runtime.onMessage.removeListener(messageListener);
                log(`Script ${script.name} cleanup done.`);
            };
        });

        return () => cleanup();
    }

    static injectListener(script: Injectable, uuid: string): () => void {
        let cleanup = () => {};

        Manager.findMatchingTab(script.url).then((tab) => {
            if (!tab || !tab.id) {
                log("No matching active tab found.");
                return;
            }

            const tabId = tab.id;

            // Inject script if needed, then send UUID
            Manager.injectScriptIfNeeded(tabId, script, () => {
                chrome.tabs.sendMessage(tabId, {
                    type: "uuid",
                    data: uuid
                });
            });

            // Cleanup function
            cleanup = () => {
                chrome.tabs.sendMessage(tabId, { type: "KILL", script: script.name });
                log(`Script ${script.name} cleanup done.`);
            };
        });

        return () => cleanup();
    }
}
