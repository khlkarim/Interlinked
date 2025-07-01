interface Option
{
    value: string;
    name: string;
}

interface SelectProps
{
    id: string;
    name: string;
    options: Option[]
}

function Select({ id, name, options }: SelectProps)
{
    return (
        <select 
            className="box"
            name={name} 
            id={id}
        >
            <option value="" disabled selected>Select Plugin</option>
            {options.map((option, index) => {
                return <option key={index} value={option.value}>{option.name}</option>
            })}
        </select>
    );
}

export default Select;