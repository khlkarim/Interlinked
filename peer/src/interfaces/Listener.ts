import type { Message } from "./Message";

export interface Listener {
    event: string;
    callback: (message: Message) => void;
}