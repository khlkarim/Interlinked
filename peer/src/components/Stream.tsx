import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useState } from "react";
import { Manager } from "../classes/Manager";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";

function Stream() {
    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    function handleStream() {
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        Manager.inject(plugin, 'streamer', (uuid) => { setUUID(uuid) });
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
    }

    return (
        <div className="flex column">
            <Input 
                type="text" 
                name="stream-from" 
                value={uuid}
                placeholder="Your streamer code will appear here" 
                inputCallback={() => {}} 
                readOnly={true}
            />

            <div className="flex">
                <Select 
                    id="stream-select" 
                    name="stream-select" 
                    value={plugin} 
                    plugins={PLUGINS_LIST} 
                    changeCallback={handlePlugin} 
                />
                <Button name="Stream" handleClick={handleStream} />
            </div>

        </div>
    );
}

export default Stream;