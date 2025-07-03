export interface Listener {
    event: string;
    callback: (data: unknown) => void;
}