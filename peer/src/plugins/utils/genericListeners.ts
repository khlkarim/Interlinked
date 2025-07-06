import type { Message } from "../../interfaces/Message";
import { log } from "../../utils/logger";

export function addListeners() {
    chrome.runtime.onMessage.addListener((message: Message) => {
        if(message.type === 'KILL') {
            log('KILL message received');
        }
    });
}