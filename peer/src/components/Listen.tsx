import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useState } from "react";
import { Manager } from "../classes/Manager";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";

function Listen() {
    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    function handleListen() {
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        Manager.inject(plugin, 'listener', undefined, uuid);
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
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