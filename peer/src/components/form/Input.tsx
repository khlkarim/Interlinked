import { type ChangeEventHandler } from "react";

interface InputProps
{
    type: string;
    name: string;
    placeholder: string;
    handleChange: ChangeEventHandler<HTMLInputElement>;
}

function Input({ type, name, placeholder, handleChange }: InputProps)
{
    return (
        <input 
            className="box"
            type={type} 
            name={name} 
            placeholder={placeholder}
            onChange={handleChange} 
        />
    );
}

export default Input;