import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useEffect, useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";

function Stream() {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState<string | null>(null);
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    useEffect(() => {
        if(plugin || !pluginManager) return;

        pluginManager.activeTabId()
            .then((tabId) => {
                if(tabId) {
                    pluginManager.queryInjections(tabId, 'streamer')
                        .then((injection) => {
                            if(injection) {
                                setUUID(injection.uuid);
                                setPlugin(injection.plugin);
                            }
                        });
                }
            });
    }, [pluginManager, plugin]);

    function handleStream() {
        if(!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        pluginManager.activeTabId(plugin.targetUrl)
            .then((tabId) => {
                if(tabId) {
                    pluginManager.inject(tabId, 'streamer', plugin, undefined, (uuid) => {
                        setUUID(uuid)
                    });
                }
            });
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
        if (!pluginManager || !plugin) return;

        pluginManager.activeTabId()
            .then((tabId) => {
                if(tabId) {
                    pluginManager.queryInjections(tabId, 'streamer', plugin)
                        .then((injection) => {
                            if(injection) {
                                setUUID(injection.uuid);
                            }
                        });
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