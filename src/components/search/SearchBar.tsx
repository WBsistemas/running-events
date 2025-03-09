import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchBar = ({
  onSearch = () => { },
  placeholder = "Buscar eventos de corrida...",
  value = "",
  onChange,
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Update internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 bg-white rounded-lg shadow-sm">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleChange}
            className="pl-10 w-full bg-gray-50 border-gray-200 focus:border-blue-500"
          />
        </div>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Buscar
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
