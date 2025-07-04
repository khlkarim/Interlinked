import type { ChangeEvent } from "react";
import type { Plugin } from "../../interfaces/Plugin";

interface SelectProps {
    id: string;
    name: string;
    value: Plugin | null;
    plugins: Plugin[];
    changeCallback: (plugin: Plugin | null) => void;
}

function Select({ id, name, value, plugins, changeCallback }: SelectProps) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const plugin = plugins.find(p => p.name === event.target.value) || null;
        changeCallback(plugin);
    };

    return (
        <select
            className="box"
            id={id}
            name={name}
            value={value ? value.name : ''}
            onChange={handleChange}
        >
            <option value="" disabled>
                Select Plugin
            </option>
            {plugins.map(plugin => (
                <option key={plugin.name} value={plugin.name}>
                    {plugin.name}
                </option>
            ))}
        </select>
    );
}

export default Select;
