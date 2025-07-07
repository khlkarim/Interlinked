import type { Listener } from "../../interfaces/Listener";
import type { Message } from "../../interfaces/Message";
import type { SDPMessage } from "../../interfaces/SDPMessage";
import { log } from "../../utils/logger";
import { PeerConnection } from "./PeerConnection";
import { Signaling } from "./Signaling";

export class Peer {
    private signaling: Signaling;

    uuid?: string;
    parent?: PeerConnection;
    private children: PeerConnection[] = [];

    listeners: Array<Listener> = [];

    constructor() {
        this.signaling = new Signaling();
    
        this.signaling.register(this.setUUID.bind(this));
        this.registerICECandidateHandler();
    }

    private setUUID(uuid: string): void {
        this.uuid = uuid;
        log('Assigned local UUID:', this.uuid);

        this.listeners.forEach((listener) => {
            if(listener.event === 'REGISTERED') {
                listener.callback({ type: 'UUID', data: { uuid } });
            }
        });
    }

    on(event: string, callback: (message: Message) => void) {
        if(event === 'REGISTERED' || event === 'NEW_CHILD') {
            this.listeners.push({ event, callback });
            return;
        }
        if(this.parent) {
            this.parent.on(event, callback);
        }
    }

    send(uuid: string, message: Message) {
        this.children.forEach((child) => {
            if(child.destination === uuid) {
                child.send(message);
            }
        });
    }

    broadcast(message: Message) {
        this.children.forEach((child) => {
            child.send(message);
        });
    }

    stream(): void {
        log('Enabling stream mode');
        this.signaling.on('offer', this.handleOffer.bind(this));
    }

    listen(uuid: string): void {
        if(!this.uuid) {
            throw new Error('Peer is not registered');
        }
        log('Listening to UUID:', uuid);
     
        this.parent = new PeerConnection(this.uuid, uuid);
        this.parent.createDataChannel();
     
        this.signaling.on('answer', this.parent.handleAnswer.bind(this.parent));
    }

    private handleOffer(msg: SDPMessage): void {
        if (!this.uuid) {
            throw new Error('Peer is not registered');
        }
        log('Offer received for streaming:', msg);

        const pc = new PeerConnection(this.uuid, msg.source);
        pc.handleOffer(msg);
        this.children.push(pc);
        log(`Child PeerConnection added. Total children: ${this.children.length}`);

        const removeChild = () => {
            const idx = this.children.indexOf(pc);
            if (idx !== -1) {
                this.children.splice(idx, 1);
                log(`Child PeerConnection removed. Total children: ${this.children.length}`);
            }
        };

        pc.on('CHANNEL_CLOSED', removeChild);

        pc.on('CHANNEL_OPENED', () => {
            this.listeners
                .filter(listener => listener.event === 'NEW_CHILD')
                .forEach(listener => {
                    listener.callback({
                        type: 'NEW_CHILD',
                        data: { uuid: pc.destination }
                    });
                });
        });
    }

    private registerICECandidateHandler(): void {
        this.signaling.on('new-ice-candidate', this.handleICECandidate.bind(this));
    }

    private handleICECandidate(msg: SDPMessage): void {
        if (this.parent && this.parent.concerned(msg)) {
            this.parent.handleNewICECandidate(msg);
            return;
        }

        for (const child of this.children) {
            if (child.concerned(msg)) {
                child.handleNewICECandidate(msg);
                return;
            }
        }
        log('No matching PeerConnection found for ICE candidate', msg);
    }
}
