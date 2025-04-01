import React, { useState, useEffect } from "react";
import { Search, X, ChevronDown, MapPin, Calendar, Route } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface EventFilters {
  distances: string[];
  states: string[];
  cities: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

// Opções de distância pré-definidas
export const distanceOptions = [
  { value: "5K", label: "5K" },
  { value: "10K", label: "10K" },
  { value: "15K", label: "15K" },
  { value: "21K", label: "Meia Maratona (21K)" },
  { value: "42K", label: "Maratona (42K)" },
  { value: "Ultra", label: "Ultra Maratona" },
];

// Opções de período pré-definidas
export const periodOptions = [
  { value: "30dias", label: "Próximos 30 dias" },
  { value: "3meses", label: "Próximos 3 meses" },
  { value: "6meses", label: "Próximos 6 meses" },
  { value: "personalizado", label: "Intervalo personalizado" },
];

interface SearchBarProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  events?: any[]; // Para extrair estados, cidades e distâncias
  onFiltersChange?: (filters: EventFilters) => void;
}

const SearchBar = ({
  onSearch = () => { },
  placeholder = "Buscar eventos de corrida...",
  value = "",
  onChange,
  events = [],
  onFiltersChange,
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [activeFilters, setActiveFilters] = useState<EventFilters>({
    distances: [],
    states: [],
    cities: [],
    dateRange: { from: undefined, to: undefined },
  });
  
  // Estados para os popovers de filtro
  const [distancePopoverOpen, setDistancePopoverOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  
  // Estado para o período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Extrair estados e cidades dos locais dos eventos
  const locationMap = events.reduce((acc: { states: Set<string>, cities: Map<string, Set<string>> }, event) => {
    if (event.location) {
      // Considerando formato "Cidade, Estado" ou similar
      const parts = event.location.split(',').map((part: string) => part.trim());
      if (parts.length >= 2) {
        const city = parts[0];
        const state = parts[parts.length - 1];
        
        acc.states.add(state);
        
        // Mapear cidades para seus estados
        if (!acc.cities.has(state)) {
          acc.cities.set(state, new Set<string>());
        }
        acc.cities.get(state)?.add(city);
      }
    }
    return acc;
  }, { states: new Set<string>(), cities: new Map<string, Set<string>>() });

  // Corrigir o tipo do cityStateMap para evitar o erro
  const cityStateMap: Record<string, string[]> = {};
  
  // Preencher o cityStateMap corretamente
  locationMap.cities.forEach((cities, state) => {
    cityStateMap[state] = Array.from(cities);
  });

  // Cidades disponíveis com base nos estados selecionados
  const availableCities = activeFilters.states.length > 0 
    ? activeFilters.states.flatMap(state => cityStateMap[state] || [])
    : Object.values(cityStateMap).flat();

  // Update internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Efeito para lidar com o período selecionado
  useEffect(() => {
    if (!selectedPeriod) return;
    
    let from: Date | undefined = undefined;
    let to: Date | undefined = undefined;
    
    const today = new Date();
    
    if (selectedPeriod === "30dias") {
      from = today;
      to = new Date(today);
      to.setDate(today.getDate() + 30);
    } else if (selectedPeriod === "3meses") {
      from = today;
      to = new Date(today);
      to.setMonth(today.getMonth() + 3);
    } else if (selectedPeriod === "6meses") {
      from = today;
      to = new Date(today);
      to.setMonth(today.getMonth() + 6);
    }
    
    // Não atualizamos as datas se for personalizado, pois o usuário usará o calendário
    if (selectedPeriod !== "personalizado") {
      setActiveFilters(prev => ({
        ...prev,
        dateRange: { from, to }
      }));
      
      if (onFiltersChange) {
        onFiltersChange({
          ...activeFilters,
          dateRange: { from, to }
        });
      }
    }
  }, [selectedPeriod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleDistanceChange = (distance: string, checked: boolean) => {
    const newDistances = checked
      ? [...activeFilters.distances, distance]
      : activeFilters.distances.filter(d => d !== distance);
    
    const newFilters = {
      ...activeFilters,
      distances: newDistances
    };
    
    setActiveFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleCityChange = (city: string, checked: boolean) => {
    const newCities = checked
      ? [...activeFilters.cities, city]
      : activeFilters.cities.filter(c => c !== city);
    
    const newFilters = {
      ...activeFilters,
      cities: newCities
    };
    
    setActiveFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleStateChange = (state: string, checked: boolean) => {
    const newStates = checked
      ? [...activeFilters.states, state]
      : activeFilters.states.filter(s => s !== state);
    
    // Remover cidades que pertencem ao estado removido
    let newCities = [...activeFilters.cities];
    if (!checked) {
      const stateCities = cityStateMap[state] || [];
      newCities = newCities.filter(city => !stateCities.includes(city));
    }
    
    const newFilters = {
      ...activeFilters,
      states: newStates,
      cities: newCities
    };
    
    setActiveFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    setSelectedPeriod("personalizado");
    
    const newFilters = {
      ...activeFilters,
      dateRange: {
        from: range.from,
        to: range.to,
      },
    };
    
    setActiveFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = {
      distances: [],
      states: [],
      cities: [],
      dateRange: { from: undefined, to: undefined },
    };
    setActiveFilters(resetFilters);
    setSelectedPeriod("");
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const formatDateDisplay = () => {
    const { from, to } = activeFilters.dateRange;
    
    if (selectedPeriod && selectedPeriod !== "personalizado") {
      return periodOptions.find(p => p.value === selectedPeriod)?.label || "Período";
    }
    
    if (from && to) {
      return `${format(from, 'dd/MM/yyyy')} - ${format(to, 'dd/MM/yyyy')}`;
    }
    
    if (from) {
      return `A partir de ${format(from, 'dd/MM/yyyy')}`;
    }
    
    if (to) {
      return `Até ${format(to, 'dd/MM/yyyy')}`;
    }
    
    return "Período";
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-white rounded-xl shadow-md border border-gray-100">
      <div className="p-4 lg:p-5 border-b border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              className="pl-10 w-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-lg"
              aria-label="Search events"
            />
          </div>
          
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200"
            aria-label="Search"
          >
            Buscar
          </Button>
        </form>
      </div>
      
      <div className="p-4 lg:p-5 flex flex-wrap gap-3 sm:gap-4">
        {/* Filtro de Cidade */}
        <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 font-normal border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg shadow-sm"
              size="sm"
            >
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {activeFilters.cities.length > 0 
                  ? `${activeFilters.cities[0]}${activeFilters.cities.length > 1 ? ` +${activeFilters.cities.length - 1}` : ''}` 
                  : 'Cidade'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 rounded-lg shadow-lg border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium mb-2 text-gray-800">Cidades</h3>
              <div className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
                {availableCities.length > 0 ? (
                  availableCities.map((city) => (
                    <div key={city} className="flex items-center space-x-2 mb-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                      <Checkbox 
                        id={`city-${city}`}
                        checked={activeFilters.cities.includes(city)}
                        onCheckedChange={(checked) => 
                          handleCityChange(city, checked === true)
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label 
                        htmlFor={`city-${city}`}
                        className="text-sm font-normal cursor-pointer text-gray-700"
                      >
                        {city}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2 italic">Nenhuma cidade disponível</p>
                )}
              </div>
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocationPopoverOpen(false)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Aplicar
              </Button>
              {activeFilters.cities.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setActiveFilters({...activeFilters, cities: []});
                    if (onFiltersChange) {
                      onFiltersChange({...activeFilters, cities: []});
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Limpar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filtro de Distância */}
        <Popover open={distancePopoverOpen} onOpenChange={setDistancePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 font-normal border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg shadow-sm"
              size="sm"
            >
              <Route className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {activeFilters.distances.length > 0 
                  ? `${activeFilters.distances[0]}${activeFilters.distances.length > 1 ? ` +${activeFilters.distances.length - 1}` : ''}` 
                  : 'Distância'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0 rounded-lg shadow-lg border-gray-200">
            <div className="p-3">
              <h3 className="font-medium mb-3 text-gray-800">Distâncias</h3>
              <div className="space-y-1.5">
                {distanceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                    <Checkbox 
                      id={`distance-${option.value}`}
                      checked={activeFilters.distances.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleDistanceChange(option.value, checked === true)
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label 
                      htmlFor={`distance-${option.value}`}
                      className="text-sm font-normal cursor-pointer text-gray-700"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDistancePopoverOpen(false)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Aplicar
              </Button>
              {activeFilters.distances.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setActiveFilters({...activeFilters, distances: []});
                    if (onFiltersChange) {
                      onFiltersChange({...activeFilters, distances: []});
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Limpar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filtro de Data */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 font-normal border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg shadow-sm"
              size="sm"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{formatDateDisplay()}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0 rounded-lg shadow-lg border-gray-200">
            <div className="p-3">
              <h3 className="font-medium mb-4 text-gray-800">Período</h3>
              <RadioGroup 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
                className="space-y-2"
              >
                {periodOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`period-${option.value}`}
                      className="data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500" 
                    />
                    <Label 
                      htmlFor={`period-${option.value}`}
                      className="text-sm font-normal cursor-pointer text-gray-700"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {selectedPeriod === "personalizado" && (
                <div className="mt-4">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal text-sm border-gray-200 hover:border-gray-300 rounded-lg"
                      >
                        {formatDateDisplay()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-lg border-gray-200" align="start">
                      <CalendarComponent
                        locale={ptBR}
                        mode="range"
                        selected={{
                          from: activeFilters.dateRange.from,
                          to: activeFilters.dateRange.to,
                        }}
                        onSelect={(range) => {
                          handleDateChange(range || { from: undefined, to: undefined });
                          if (range?.to) {
                            setCalendarOpen(false);
                          }
                        }}
                        initialFocus
                        className="rounded-md border-none p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDatePopoverOpen(false)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Aplicar
              </Button>
              {activeFilters.dateRange.from || activeFilters.dateRange.to ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setActiveFilters({...activeFilters, dateRange: { from: undefined, to: undefined }});
                    setSelectedPeriod("");
                    if (onFiltersChange) {
                      onFiltersChange({...activeFilters, dateRange: { from: undefined, to: undefined }});
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Limpar
                </Button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Botão de Limpar todos os filtros */}
        {(activeFilters.distances.length > 0 || 
          activeFilters.cities.length > 0 || 
          activeFilters.states.length > 0 || 
          activeFilters.dateRange.from || 
          activeFilters.dateRange.to) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            <span className="text-sm">Limpar Filtros</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
