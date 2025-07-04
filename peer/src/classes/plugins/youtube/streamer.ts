import type { Message } from "../../../interfaces/Message";
import { log } from "../../../utils/logger";
import { Peer } from "../../p2p/Peer";

const peer = new Peer();
peer.stream();

peer.on('registered', (uuid) => {
    chrome.runtime.sendMessage({ type: 'uuid', data: { uuid }});
});

document.addEventListener('click', () => {
    peer.broadcast({
        type: 'test',
        data: {
            test: 'testing'
        }
    });
});

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