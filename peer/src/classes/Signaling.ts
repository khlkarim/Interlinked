import { io, type Socket } from "socket.io-client";
import type { SDPMessage } from "../interfaces/SDPMessage";
import { log } from "../utils/logger";

export class Signaling {
    static BASE_URL = 'ws://localhost:3000';
    private ws: Socket;

    constructor() {
        this.ws = io(Signaling.BASE_URL);
        this.ws.on("error", (err) => {
            log('Socket error:', err);
        });
    }

    register(callback: (uuid: string) => void) {
        this.ws.on("registered", (message) => {
            callback(message.uuid);
        });
        log('Emitting register event');
        this.ws.emit("register");
    }

    emit(payload: SDPMessage) {
        log('Emitting message:', payload.type, payload);
        this.ws.emit('message', payload);
    }

    on(event: string, callback: (msg: SDPMessage) => void) {
        log('Listening for event:', event);
        this.ws.on(event, callback);
    }

    off(event: string) {
        log('Stopped listening for event:', event);
        this.ws.off(event);
    }

    disconnect() {
        log('Disconnecting signaling');
        this.ws.disconnect();
    }
}