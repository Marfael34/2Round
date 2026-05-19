const CustomInput = ({
  label,
  value,
  onChange,
  state,
  callable,
  type = "text",
  placeholder = "",
  className = "",
  rightElement,
  ...props
}) => {
  const inputValue = value !== undefined ? value : state;
  const inputOnChange = onChange || callable;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-inter text-xs uppercase text-gray-400">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type={type}
          value={inputValue}
          onChange={inputOnChange}
          placeholder={placeholder}
          className={`w-full bg-[#1A1A1A] border border-white/10 rounded-sm p-3 text-white focus:border-red-600 focus:outline-none font-inter text-sm ${rightElement ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInput;