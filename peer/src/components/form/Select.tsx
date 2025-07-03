import type { ChangeEventHandler } from "react";

interface Option
{
    value: string;
    name: string;
}

interface SelectProps
{
    id: string;
    name: string;
    value: string;
    options: Option[];
    handleChange: ChangeEventHandler<HTMLSelectElement>;
}

function Select({ id, name, value, options, handleChange }: SelectProps)
{
    return (
        <select 
            className="box"
            name={name} 
            id={id}
            value={value}
            onChange={handleChange}
        >
            <option value='0' disabled>Select Plugin</option>
            {options.map((option, index) => {
                return <option key={index} value={option.value}>{option.name}</option>
            })}
        </select>
    );
}

export default Select;