import type { Message } from "../../../interfaces/Message";
import { Peer } from "../../p2p/Peer";

const peer = new Peer();

peer.on('test', (message: unknown) => {
    console.log(message);
});

chrome.runtime.onMessage.addListener((message: Message) => {
    if(message.type === 'uuid') {
        peer.on('registered', () => {
            peer.listen(message.data.uuid);
        })
    }
});
