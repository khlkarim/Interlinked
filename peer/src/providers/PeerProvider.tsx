import type { ReactNode } from "react";
import { Peer } from "../classes/Peer";
import { PeerContext } from "../contexts/PeerContext";

function PeerProvider({ children }: { children: ReactNode }) {
    return (
        <PeerContext.Provider value={Peer.getInstance()}>
            { children }
        </PeerContext.Provider>
    );
}

export default PeerProvider;