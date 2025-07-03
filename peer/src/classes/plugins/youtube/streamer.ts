import { Peer } from "../../p2p/Peer";

const peer = new Peer();
peer.stream();

peer.on('registered', (uuid) => {
    chrome.runtime.sendMessage({ type: 'uuid', data: uuid });
});

document.addEventListener('click', () => {
    peer.broadcast({
        type:'test',
        data: {
            test: 'testing'
        }
    });
});