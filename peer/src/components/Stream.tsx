import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";
import usePeer from "../hooks/usePeer";
import { useState } from "react";

function Stream() {
    const peer = usePeer();
    const [uuid, setUUID] = useState('');

    peer.onRegistration(setUUID);

    function handleStream() {
        peer.stream();
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
                <Select id="stream-select" name="stream-select" options={PLUGINS_LIST} />
                <Button name="Stream" handleClick={handleStream} />
            </div>

        </div>
    );
}

export default Stream;