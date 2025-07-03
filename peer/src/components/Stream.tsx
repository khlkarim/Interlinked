import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import usePeer from "../hooks/usePeer";
import { useState, type ChangeEvent } from "react";

function Stream() {
    const peer = usePeer();

    const [uuid, setUUID] = useState('');
    const [plugin, setPlugin] = useState('0');

    peer.onRegistration(setUUID);

    function handleStream() {
        if(plugin === '0') return;
        peer.stream(plugin);
    }

    function handlePlugin(event: ChangeEvent<HTMLSelectElement>) {
        setPlugin(event.target.value);
    }

    return (
        <div 
            className="stream flex"
            style={{ 
                flexDirection: 'column', 
                alignItems: 'stretch' 
            }}
        >
            <Input 
                type="text" 
                name="stream-from" 
                value={uuid}
                placeholder="Your streamer code will appear here" 
                handleInput={() => {}} 
                readOnly={true}
            />

            <div className="flex">
                <Select 
                    id="stream-select" 
                    name="stream-select" 
                    value={plugin} 
                    options={PLUGINS_LIST} 
                    handleChange={handlePlugin} 
                />
                <Button name="Stream" handleClick={handleStream} />
            </div>

        </div>
    );
}

export default Stream;