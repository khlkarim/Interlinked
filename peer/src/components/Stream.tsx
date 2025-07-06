import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useEffect, useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";
import type { Message } from "../interfaces/Message";

function Stream() {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    useEffect(() => {
        const handleMessage = (message: Message) => {
            if(message.type === 'STREAMER_UUID') {
                setUUID(message.data.uuid);
            }
        }

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        }
    }, []);

    function handleStream() {
        if(!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        pluginManager.injectStreamerByUrl(plugin.targetUrl, plugin.streamerPath);
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);

        if (!pluginManager) return;

        pluginManager.getCurrentPage().then((page) => {
            const streamer = page as { script: string; uuid: string };
            if (
                streamer &&
                streamer.uuid &&
                streamer.script === plugin?.streamerPath
            ) {
                setUUID(streamer.uuid);
            }
        });
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