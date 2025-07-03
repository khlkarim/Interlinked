import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useState, type ChangeEvent } from "react";
import { Manager } from "../classes/Manager";

function Listen()
{
    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState('0');

    function handleInput(uuid: string) {
        setUUID(uuid);
    }

    function handleListen() {
        if(plugin === '0' || uuid === '') return;
        if(plugin === 'youtube') {
            Manager.injectListener(
                {
                    url: '*://www.youtube.com/*',
                    name: 'plugins/youtube/listener-Y3LLUoFb.js'
                }
            , uuid);
        }
    }

    function handlePlugin(event: ChangeEvent<HTMLSelectElement>) {
        setPlugin(event.target.value);
    }

    return (
        <div 
            className="listen flex"
            style={{ 
                flexDirection: 'column', 
                alignItems: 'stretch' 
            }}
        >
            <Input 
                type="text" 
                name="listen-from" 
                value={uuid}
                placeholder="Enter a streamer's code here" 
                handleInput={handleInput} 
                readOnly={false}
            />
            <div className="flex">
                <Select 
                    id="listen-select" 
                    name="listen-select" 
                    value={plugin}
                    options={PLUGINS_LIST} 
                    handleChange={handlePlugin}
                />
                <Button name="Listen" handleClick={handleListen} />
            </div>
        </div>
    );
}

export default Listen;