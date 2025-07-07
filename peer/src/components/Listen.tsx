import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useEffect, useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";

function Listen() {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState<string | null>(null);
    const [plugin, setPlugin] = useState<Plugin | null>(null);

    useEffect(() => {
        if(plugin || !pluginManager) return;

        pluginManager.activeTabId()
            .then((tabId) => {
                if(tabId) {
                    pluginManager.queryInjections(tabId, 'listener')
                        .then((injection) => {
                            if(injection) {
                                setUUID(injection.uuid);
                                setPlugin(injection.plugin);
                            }
                        });
                }
            });
    }, [pluginManager, plugin]);
   

    function handleListen() {
        if(!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }
        if(!uuid) {
            log("Input a streamer's UUID");
            return;
        } 
        if(!plugin) {
            log('Select a plugin');
            return;
        }

        pluginManager.activeTabId(plugin.targetUrl)
            .then((tabId) => {
                if(tabId) {
                    pluginManager.inject(tabId, 'listener', plugin, uuid);
                }
            });
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
        if (!pluginManager || !plugin) return;

        pluginManager.activeTabId()
            .then((tabId) => {
                if(tabId) {
                    pluginManager.queryInjections(tabId, 'listener', plugin)
                        .then((injection) => {
                            if(injection) {
                                setUUID(injection.uuid);
                            }
                        });
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