import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useEffect, useState } from "react";
import { log } from "../utils/logger";
import type { Plugin } from "../interfaces/Plugin";
import usePM from "../hooks/usePM";
import type { Action } from "../App";

interface StreamProps {
    action: Action;
    handleAction: (action: Action) => void;
}

function Stream({ action, handleAction }: StreamProps) {
    const pluginManager = usePM();

    const [uuid, setUUID] = useState<string | null>(null);
    const [plugin, setPlugin] = useState<Plugin | null>(null);
    const [streaming, setStreaming] = useState<boolean>(false);

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
                                handleAction('streaming');
                                setStreaming(true);
                            }
                        });
                }
            });
    }, [pluginManager, plugin, handleAction]);

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
                        setUUID(uuid);
                        handleAction('streaming');
                        setStreaming(true);
                    });
                }
            });
    }

    function handlePlugin(plugin: Plugin | null) {
        setPlugin(plugin);
        if(!plugin) {
            setUUID(null);
            return;
        }
        if (!pluginManager) {
            log('Inaccessible plugin manager');
            return;
        }
        
        handleStreaming();
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
                            setStreaming(false);
                        });
                }
            });
    }

    async function handleStreaming() {
        if(!pluginManager || !plugin) {
            setStreaming(false);
            return;
        }

        const tabId = await pluginManager.activeTabId(plugin.targetUrl);
        const injection = await pluginManager.queryInjections(tabId, 'streamer', plugin);

        if(injection) {
            setUUID(injection.uuid);
            setStreaming(true);
        } else {
            setStreaming(false);
        }
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

                {
                    streaming ?
                    <Button name="Stop" disabled={false} handleClick={handleStop} />
                    : <Button name="Stream" disabled={action != null} handleClick={handleStream} />
                }
            </div>
        </div>
    );
}

export default Stream;