import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";

function Listen() {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    function handleListen() {
        if(!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }
        if(!uuid) {
            log("Input a streamer's UUID");
        } 
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        pluginManager.injectListenerByUrl(plugin.targetUrl, plugin.listenerPath, uuid);
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);

        if (!pluginManager) return;

        pluginManager.getCurrentPage().then((page) => {
            const listener = page as { script: string; target: string };
            if (
                listener &&
                listener.target &&
                listener.script === plugin?.listenerPath
            ) {
            setUUID(listener.target);
            }
        });
    }

    function handleInput(uuid: string) {
        setUUID(uuid);
    }

    return (
        <div className="flex column">
            <Input 
                type="text" 
                name="listener-from" 
                value={uuid}
                placeholder="Enter a streamer's code here" 
                inputCallback={handleInput} 
                readOnly={false}
            />

            <div className="flex">
                <Select 
                    id="listener-select" 
                    name="listener-select" 
                    value={plugin} 
                    plugins={PLUGINS_LIST} 
                    changeCallback={handlePlugin} 
                />
                <Button name="Listen" handleClick={handleListen} />
            </div>

        </div>
    );
}

export default Listen;