import type { MouseEventHandler } from "react";

interface ButtonProps
{
    name: string;
    disabled: boolean;
    handleClick: MouseEventHandler<HTMLButtonElement>;
}

function Button({name, disabled, handleClick}: ButtonProps) 
{
    return (
        <button
            className="box"
            onClick={handleClick}
            disabled={disabled}
        >
            {name}
        </button>
    );
}

export default Button;