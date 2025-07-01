import type { MouseEventHandler } from "react";

interface ButtonProps
{
    name: string;
    handleClick: MouseEventHandler<HTMLButtonElement>;
}

function Button({name, handleClick}: ButtonProps) 
{
    return (
        <button
            className="box"
            onClick={handleClick}
        >
            {name}
        </button>
    );
}

export default Button;