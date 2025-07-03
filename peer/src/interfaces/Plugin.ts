export interface Plugin {
    bindEmitters: () => void;
    bindReceivers: () => void;
}