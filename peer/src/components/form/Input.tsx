import type { ChangeEvent } from "react";

interface InputProps
{
    type: string;
    name: string;
    value: string;
    readOnly: boolean;
    placeholder: string;
    handleInput: (uuid: string) => void;
}

function Input({ type, name, value, readOnly, placeholder, handleInput }: InputProps)
{
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        handleInput(e.target.value);
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