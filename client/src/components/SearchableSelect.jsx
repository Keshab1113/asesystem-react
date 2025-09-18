import { useEffect, useState } from "react";

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  customClass = "",
}) {
  const [search, setSearch] = useState(value || "");
  const [showOptions, setShowOptions] = useState(false);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    setSearch(value || "");
  }, [value]);
  const handleSelect = (option) => {
    setSearch(option);
    onChange(option);
    setShowOptions(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className={`w-full border rounded-md px-3 py-2  dark:bg-input/30 max-h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 ${customClass}`}
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value); // user typed value is always main value
          setShowOptions(true);
        }}
        onBlur={() => {
          // small delay so click can register
          setTimeout(() => setShowOptions(false), 200);
        }}
        onFocus={() => setShowOptions(true)}
      />
      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 bg-slate-100 dark:bg-slate-800 border rounded-md mt-1 w-full max-h-40 overflow-auto shadow">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-slate-900 cursor-pointer"
              onMouseDown={() => handleSelect(opt)} // use onMouseDown to avoid blur before click
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
