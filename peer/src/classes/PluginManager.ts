import type { Message } from "../interfaces/Message";
import { log } from "../utils/logger";

interface Streamer {
    uuid?: string;
    script: string;
}
interface Listener {
    target: string;
    script: string;
}

type Page = Streamer | Listener;

export class PluginManager {
    private pages: Map<number, Page> = new Map();

    constructor() {
        this.loadPages();
    }

    private async loadPages() {
        chrome.storage.local.get(['pages'], (result) => {
            if (result.pages) {
                const entries: [number, Page][] = JSON.parse(result.pages);
                this.pages = new Map(entries);
            }
        });
    }

    private persistPages() {
        const entries = Array.from(this.pages.entries());
        chrome.storage.local.set({ pages: JSON.stringify(entries) });
    }

    async injectStreamerByUrl(url: string, script: string) {
        chrome.tabs.query({ active: true, currentWindow: true, url }, (tabs) => {
            if (tabs.length === 0 || !tabs[0].id) {
                log('No valid tab found');
                return;
            }
            const tabId = tabs[0].id;
            this.injectStreamer(tabId, script);
        });
    }

    async injectListenerByUrl(url: string, script: string, target: string) {
        chrome.tabs.query({ active: true, currentWindow: true, url }, (tabs) => {
            if (tabs.length === 0 || !tabs[0].id) {
                log('No valid tab found');
                return;
            }
            const tabId = tabs[0].id;
            this.injectListener(tabId, script, target);
        });
    }

    injectStreamer(tabId: number, script: string) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: [script]
        }, () => {
            if(chrome.runtime.lastError) {
                log('Failed to inject script');
                return;
            } else {
                log('Successfully injected script')
            }

            this.pages.set(tabId, { script });
            this.persistPages();

            chrome.runtime.onMessage.addListener((message: Message) => {
                if(message.type === 'STREAMER_UUID') {
                    this.pages.set(tabId, {
                        uuid: message.data.uuid,
                        script
                    });
                    this.persistPages();
                }
            });
        });
    }

    async injectListener(tabId: number, script: string, target: string) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: [script]
        }, () => {
            if(chrome.runtime.lastError) {
                log('Failed to inject script');
                return;
            } else {
                log('Successfully injected script')
            }

            this.pages.set(tabId, {target, script});
            this.persistPages();

            chrome.tabs.sendMessage(tabId, {
                type: 'TARGET',
                data: { target }
            })
        });
    }

    async getCurrentPage(): Promise<Page | undefined> {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0 || !tabs[0].id) {
            return undefined;
        }
        const tabId = tabs[0].id;
        return this.pages.get(tabId);
    }

    kill(tabId: number) {
        this.pages.delete(tabId);
        this.persistPages();
        return chrome.tabs.reload(tabId);
    }
}