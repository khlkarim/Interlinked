import type { SDPMessage } from "../interfaces/SDPMessage";
import { log } from "../utils/logger";
import { PeerConnection } from "./PeerConnection";
import { Signaling } from "./Signaling";

export class Peer {
    private signaling: Signaling;

    uuid?: string;
    private parent?: PeerConnection;
    private children: PeerConnection[] = [];

    private static instance: Peer | undefined;
    private registrationCallbacks: Array<(uuid: string) => void> = [];

    constructor() {
        this.signaling = new Signaling();
    
        this.signaling.register(this.setUUID.bind(this));
        this.registerICECandidateHandler();
    }

    static getInstance() {
        if(this.instance) return this.instance;
        this.instance = new Peer();
        return this.instance;
    }

    private setUUID(uuid: string): void {
        this.uuid = uuid;
        log('Assigned local UUID:', this.uuid);

        this.registrationCallbacks.forEach((callback) => {
            callback(uuid);
        });
    }
    onRegistration(callback: (uuid: string) => void) {
        this.registrationCallbacks.push(callback);
    }

    stream(plugin: string): void {
        log('Enabling stream mode');
        this.signaling.on('offer', (msg: SDPMessage) => {
            this.handleOffer(msg, plugin);
        });
    }

    unstream(): void {
        log('Disabling stream mode');
        this.signaling.off('offer');
    }

    listen(uuid: string, plugin: string): void {
        if(!this.uuid) {
            throw new Error('Peer is not registered');
        }
        log('Listening to UUID:', uuid);
        this.parent = new PeerConnection(this.uuid, uuid, plugin);
        this.signaling.on('answer', this.parent.handleAnswer.bind(this.parent));
        this.parent.createDataChannel();
    }

    private handleOffer(msg: SDPMessage, plugin: string): void {
        if(!this.uuid) {
            throw new Error('Peer is not registered');
        }

        log('Offer received for streaming:', msg);
        const pc = new PeerConnection(this.uuid, msg.source, plugin);
        pc.handleOffer(msg);
        this.children.push(pc);
        log('Child PeerConnection added. Total children:', this.children.length);
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
