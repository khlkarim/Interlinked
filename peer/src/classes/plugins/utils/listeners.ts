import type { Message } from "../../../interfaces/Message";
import { log } from "../../../utils/logger";


export function addListeners() {
    chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
        if(message.type === 'IS_INJECTED') {
            log('IS INJECTED MESSAGE RECEIVED');
            sendResponse({
                injected: true
            });
        }
    
        if(message.type === 'KILL') {
            log('KILL MESSAGE RECEIVED');
        }
    });
}