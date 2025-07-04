import type { ChangeEvent } from "react";

interface InputProps
{
    type: string;
    name: string;
    value: string;
    readOnly: boolean;
    placeholder: string;
    inputCallback: (uuid: string) => void;
}

function Input({ type, name, value, readOnly, placeholder, inputCallback }: InputProps)
{
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        inputCallback(e.target.value);
    }

    return (
        <input 
            className="box"
            type={type} 
            name={name} 
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            readOnly={readOnly}
        />
    );
}

export default Input;