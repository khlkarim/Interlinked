import { useContext } from "react";
import { PMContext } from "../contexts/PMContext";

function usePM() {
    return useContext(PMContext);
}

export default usePM;