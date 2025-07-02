export interface SDPMessage {
    type: string;
    source: string;
    destination: string;
    content: unknown;
}