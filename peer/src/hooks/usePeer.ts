import { useContext } from "react";
import { PeerContext } from "../contexts/PeerContext";

function usePeer() {
    return useContext(PeerContext);
}

export default usePeer;