import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useEffect, useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";
import type { Action } from "../App";

interface ListenProps {
    action: Action;
    handleAction: (action: Action) => void;
}

function Listen({ action, handleAction }: ListenProps) {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState<string | null>(null);
    const [plugin, setPlugin] = useState<Plugin | null>(null);
    const [listening, setListening] = useState<boolean>(false);

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
                                handleAction('listening');
                                setListening(true);
                            }
                        });
                }
            });
    }, [pluginManager, plugin, handleAction]);
   

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
                    pluginManager.inject(tabId, 'listener', plugin, uuid, () => {
                        handleAction('listening');
                        setListening(true);
                    });
                }
            });
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
        if(!plugin) {
            setUUID(null);
            setListening(false);
            return;
        }
        if (!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }

        log('handle listening: ');

        pluginManager.activeTabId(plugin.targetUrl)
            .then((tabId) => {
                return pluginManager.queryInjections(tabId, 'listener', plugin);
            })
            .then((injection) => {
                if(injection) {
                    setUUID(injection.uuid);
                    setListening(true);
                    log(true);
                } else {
                    setUUID(null);
                    setListening(false);
                    log(false);    
                }
            });
    }

    function handleInput(uuid: string) {
        setUUID(uuid);
    }

    function handleStop() {
        if(!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }

        pluginManager.activeTabId()
            .then((tabId) => {
                if(tabId) {
                    pluginManager.kill(tabId)
                        .then(() => {
                            setUUID(null);
                            handleAction(null);
                            setListening(false);
                        });
                }
            });
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
                {
                    listening ?
                    <Button name="Stop" disabled={false} handleClick={handleStop} />
                    : <Button name="Listen" disabled={action !== null} handleClick={handleListen} />
                }
            </div>

        </div>
    );
}

export default Listen;