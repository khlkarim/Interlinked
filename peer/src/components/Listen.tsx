import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import { useState } from "react";
import usePeer from "../hooks/usePeer";

function Listen()
{
    const peer = usePeer();
    const [uuid, setUUID] = useState('');

    function handleInput(uuid: string) {
        setUUID(uuid);
    }

    function handleListen() {
        peer.listen(uuid);
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
                <Select id="listen-select" name="listen-select" options={PLUGINS_LIST} />
                <Button name="Listen" handleClick={handleListen} />
            </div>
        </div>
    );
}

export default Listen;