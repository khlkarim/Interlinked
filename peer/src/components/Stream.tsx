import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";

function Stream()
{
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
                placeholder="Your streaming code will appear here" 
                handleChange={() => {}} 
            />

            <div className="flex">
                <Select id="stream-select" name="stream-select" options={PLUGINS_LIST} />
                <Button name="Go Live" handleClick={() => {}} />
            </div>

        </div>
    );
}

export default Stream;