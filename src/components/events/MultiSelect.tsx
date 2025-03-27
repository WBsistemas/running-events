import React, { useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Selecione as opções",
  className,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Parse the comma-separated value string into an array
  useEffect(() => {
    if (value) {
      setSelectedValues(value.split(",").filter(Boolean));
    } else {
      setSelectedValues([]);
    }
  }, [value]);

  const handleToggleOption = (optionValue: string) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];

    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues.join(","));
  };

  const handleRemoveValue = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedValues = selectedValues.filter((v) => v !== optionValue);
    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues.join(","));
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleOption(optionValue);
    }
  };

  const getSelectedLabels = () => {
    return selectedValues.map(
      (val) => options.find((opt) => opt.value === val)?.label || val,
    );
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
        onClick={handleToggleDropdown}
        onKeyDown={(e) => e.key === 'Enter' && handleToggleDropdown()}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="multiselect-options"
        aria-haspopup="listbox"
        aria-label={placeholder}
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length > 0 ? (
            getSelectedLabels().map((label, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800"
              >
                {label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={(e) => handleRemoveValue(selectedValues[index], e)}
                  aria-label={`Remover ${label}`}
                  role="button"
                  tabIndex={0}
                />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md"
          id="multiselect-options"
          role="listbox"
          aria-label="Opções disponíveis"
        >
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/50",
                  )}
                  onClick={() => handleToggleOption(option.value)}
                  onKeyDown={(e) => handleKeyDown(e, option.value)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                  <span>{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
