import type { Message } from "../../../interfaces/Message";
import { log } from "../../../utils/logger";
import { Peer } from "../../p2p/Peer";

const peer = new Peer();

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
    if(message.type === 'uuid') {
        peer.on('registered', () => {
            peer.listen(message.data.uuid);
            peer.on('test', (message) => {
                console.log(message);
            });
        })

        log('PEER LISTENERS:', peer.listeners);
        log('PEER CONNECTION LISTENERS:', peer.parent?.listeners);
    }

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