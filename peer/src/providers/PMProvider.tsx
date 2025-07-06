import { useMemo, type ReactNode } from "react";
import { PluginManager } from "../classes/PluginManager";
import { PMContext } from "../contexts/PMContext";

function PMProvider({ children }: { children: ReactNode }) {
    const pluginManager = useMemo(() => new PluginManager(), []);

    return (
        <PMContext.Provider value={pluginManager}>
            { children }
        </PMContext.Provider>
    );
}

export default PMProvider;