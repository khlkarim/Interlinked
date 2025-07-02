import { createContext } from "react";
import { Peer } from "../classes/Peer";

export const PeerContext = createContext(Peer.getInstance());