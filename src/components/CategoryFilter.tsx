
import { useState } from 'react';

interface CategoryOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CategoryFilterProps {
  options: CategoryOption[];
  onChange: (selectedId: string) => void;
  defaultSelected?: string;
}

const CategoryFilter = ({ options, onChange, defaultSelected }: CategoryFilterProps) => {
  const [selected, setSelected] = useState<string>(defaultSelected || options[0].id);
  
  const handleSelect = (id: string) => {
    setSelected(id);
    onChange(id);
  };
  
  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 py-2 px-1 min-w-max">
        {options.map((option) => (
          <button
            key={option.id}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selected === option.id
                ? "bg-book-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleSelect(option.id)}
          >
            <div className="flex items-center gap-1.5">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
