import Input from "./form/Input";
import Button from "./form/Button";
import Select from "./form/Select";
import { PLUGINS_LIST } from "../constants/PluginList";

function Listen()
{
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
                placeholder="Enter a streaming code here" 
                handleChange={() => {}} 
            />
            <div className="flex">
                <Select id="listen-select" name="listen-select" options={PLUGINS_LIST} />
                <Button name="Connect" handleClick={() => {}} />
            </div>
        </div>
    );
}

export default Listen;