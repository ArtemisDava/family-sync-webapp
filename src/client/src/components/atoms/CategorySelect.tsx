import { useState, useRef, useEffect } from "react";

interface Category {
  value: string;
  label: string;
  color: string;
}

const categories: Category[] = [
  { value: "appointment", label: "Appointment", color: "#3B82F6" },
  { value: "school", label: "School", color: "#F59E0B" },
  { value: "activity", label: "Activity", color: "#10B981" },
  { value: "birthday", label: "Birthday", color: "#EC4899" },
  { value: "other", label: "Other", color: "#6B7280" },
];

interface CategorySelectProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export function CategorySelect({
  name,
  value,
  onChange,
  required,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(
    value ? categories.find((c) => c.value === value) || null : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category: Category) => {
    setSelected(category);
    onChange?.(category.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="hidden"
        name={name}
        value={selected?.value || ""}
        required={required}
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mt-2 border border-gray-300 rounded px-3 py-2 bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            {selected.label}
          </span>
        ) : (
          <span className="text-gray-500">Select a category</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          {categories.map((category) => (
            <div
              key={category.value}
              onClick={() => handleSelect(category)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                selected?.value === category.value ? "bg-gray-50" : ""
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
