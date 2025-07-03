import type { Plugin } from "../../interfaces/Plugin";
import { log } from "../../utils/logger";

export class YoutubePlugin implements Plugin {
    private channel: RTCDataChannel;
    private target?: { tabId: number };

    constructor(channel: RTCDataChannel) {
        this.channel = channel;
    }

    bindEmitters() {
        if (!chrome?.tabs || !chrome?.scripting) {
            log('Chrome extension APIs are not available.');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true, url: "*://www.youtube.com/*" }, (tabs) => {
            if (tabs.length === 0 || !tabs[0].id) {
                log('No active tab found');
                return;
            }

            this.target = { tabId: tabs[0].id };

            chrome.scripting.executeScript({
                target: this.target,
                func: emitterContentScript,
            });

            chrome.runtime.onMessage.removeListener(this.messageListener);
            chrome.runtime.onMessage.addListener(this.messageListener);
        });
    }

    private messageListener = (message: unknown) => {
        this.channel.send(JSON.stringify(message));
    };

    bindReceivers() {
        if (!chrome?.tabs || !chrome?.scripting) {
            log('Chrome extension APIs are not available.');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true, url: "*://www.youtube.com/*" }, (tabs) => {
            if (tabs.length === 0 || !tabs[0].id) {
                log('No active tab found');
                return;
            }

            this.target = { tabId: tabs[0].id };

            chrome.scripting.executeScript({
                target: this.target,
                func: receiverContentScript,
            });

            this.channel.onmessage = (event) => {
                const message = JSON.parse(event.data);
                chrome.tabs.sendMessage(this.target!.tabId, message);
            };
        });
    }
}

function emitterContentScript() {
    console.log('INJECTED (emitter)');
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'a') {
            chrome.runtime.sendMessage({ data: "key pressed" });
        }
    });
}

function receiverContentScript() {
    console.log('INJECTED (receiver)');
    chrome.runtime.onMessage.addListener((message) => {
        console.log("Received in receiver content script:", message);
    });
}
