import { iceServers } from "../constants/ICE";
import type { SDPMessage } from "../interfaces/SDPMessage";
import { log } from "../utils/logger";
import { PluginManager } from "./plugins/PluginManager";
import { Signaling } from "./Signaling";

export class PeerConnection {
    private readonly signaling: Signaling;

    readonly source: string;
    readonly destination: string;
    readonly plugin: string;
    private readonly pc: RTCPeerConnection;
    private channel?: RTCDataChannel;

    constructor(source: string, destination: string, plugin: string) {
        this.signaling = new Signaling();
        
        this.source = source;
        this.destination = destination;
        this.plugin = plugin;

        this.pc = new RTCPeerConnection({ iceServers });
        this.setCallbacks();
        log(`PeerConnection created: source=${source}, destination=${destination}`);
    }

    private handleICECandidateEvent(event: RTCPeerConnectionIceEvent): void {
        if (event.candidate) {
            log("Sending ICE candidate:", event.candidate);
            this.signaling.emit({
                type: 'new-ice-candidate',
                source: this.source,
                destination: this.destination,
                content: event.candidate,
            });
        } else {
            log("All ICE candidates have been sent");
        }
    }

    public handleNewICECandidate(msg: SDPMessage): void {
        const candidate = new RTCIceCandidate(msg.content as RTCIceCandidateInit);
        this.pc.addIceCandidate(candidate)
            .then(() => log('ICE candidate added'))
            .catch(e => log('Error adding ICE candidate:', e));
    }

    private handleNegotiationNeededEvent(): void {
        this.pc.createOffer()
            .then((offer: RTCSessionDescriptionInit) => {
                log('Created offer:', offer);
                return this.pc.setLocalDescription(offer);
            })
            .then(() => {
                log("Sending offer:", this.pc.localDescription);
                this.signaling.emit({
                    type: 'offer',
                    source: this.source,
                    destination: this.destination,
                    content: this.pc.localDescription,
                });
            })
            .catch(e => log('Negotiation error:', e));
    }

    public handleOffer(msg: SDPMessage): void {
        const sd = new RTCSessionDescription(msg.content as RTCSessionDescriptionInit);
        this.pc.setRemoteDescription(sd)
            .then(() => {
                log('Remote description set (offer)');
                return this.pc.createAnswer();
            })
            .then((answer: RTCSessionDescriptionInit) => {
                log('Created answer:', answer);
                return this.pc.setLocalDescription(answer);
            })
            .then(() => {
                log('Sending answer:', this.pc.localDescription);
                this.signaling.emit({
                    type: 'answer',
                    source: this.source,
                    destination: this.destination,
                    content: this.pc.localDescription,
                });
            })
            .catch(e => log('Error handling offer:', e));
    }

    public handleAnswer(msg: SDPMessage): void {
        const sd = new RTCSessionDescription(msg.content as RTCSessionDescriptionInit);
        this.pc.setRemoteDescription(sd)
            .then(() => log('Remote description set (answer)'))
            .catch(e => log('Error setting remote description (answer):', e));
    }

    private handleICEConnectionStateChangeEvent(): void {
        log("ICE connection state changed:", this.pc.iceConnectionState);
    }

    private handleICEGatheringStateChangeEvent(): void {
        log("ICE gathering state changed:", this.pc.iceGatheringState);
    }

    private handleSignalingStateChangeEvent(): void {
        log("Signaling state changed:", this.pc.signalingState);
    }

    public createDataChannel(label = 'channel', options?: RTCDataChannelInit): void {
        if (this.channel) {
            log('Data channel already exists, skipping creation.');
            return;
        }
        try {
            this.channel = this.pc.createDataChannel(label, options);
            const plugin = PluginManager.bindPluginByName(this.plugin, this.channel);
            plugin?.bindReceivers();
            this.setupDataChannel();
            log('Data channel created by initiator.');
        } catch (e) {
            log('Error creating data channel:', e);
        }
    }

    private handleDataChannelCreation(event: RTCDataChannelEvent): void {
        this.channel = event.channel;
        const plugin = PluginManager.bindPluginByName(this.plugin, this.channel);
        plugin?.bindEmitters();
        this.setupDataChannel();
        log('Data channel received and set up:', event);
    }

    private setupDataChannel(): void {
        if (!this.channel) return;
        this.channel.onopen = this.handleDataChannelStatusChange.bind(this);
        this.channel.onclose = this.handleDataChannelStatusChange.bind(this);
        this.channel.onerror = (e: Event) => log('Data channel error:', e);
    }

    private handleDataChannelStatusChange(event: Event): void {
        const channel = event.target as RTCDataChannel | null;
        if (channel && channel.readyState) {
            log('Channel status:', channel.readyState);
        }
    }

    public concerned(msg: SDPMessage): boolean {
        return this.source === msg.destination && this.destination === msg.source;
    }

    private setCallbacks(): void {
        this.pc.onicecandidate = this.handleICECandidateEvent.bind(this);
        this.pc.onnegotiationneeded = this.handleNegotiationNeededEvent.bind(this);
        this.pc.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent.bind(this);
        this.pc.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent.bind(this);
        this.pc.onsignalingstatechange = this.handleSignalingStateChangeEvent.bind(this);
        this.pc.ondatachannel = this.handleDataChannelCreation.bind(this);
    }
}
