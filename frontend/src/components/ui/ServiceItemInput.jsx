import { useMemo, useRef, useState } from "react";

export default function ServiceItemInput({
  value,
  onChange,
  drugs,
  placeholder = "Service or item",
  disabled,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  const normalizedQuery = value?.toLowerCase()?.trim() || "";

  const filteredDrugs = useMemo(() => {
    if (!drugs || drugs.length === 0) return [];

    if (!normalizedQuery) return drugs;

    return drugs.filter((drug) =>
      drug.name.toLowerCase().includes(normalizedQuery),
    );
  }, [drugs, normalizedQuery]);

  const handleSelect = (drugName) => {
    onChange(drugName);
    setIsFocused(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
      />

      {isFocused && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {filteredDrugs.length ? (
            filteredDrugs.map((drug) => (
              <button
                key={drug.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(drug.name);
                }}
                className="w-full text-left px-3 py-2 hover:bg-purple-100"
              >
                {drug.name} (Qty: {drug.presentQuantity ?? 0})
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No matching drug found. Continue typing to use custom value.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
