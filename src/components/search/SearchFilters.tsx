import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EventFilters, distanceOptions } from "./SearchBar";

interface SearchFiltersProps {
  activeFilters: EventFilters;
  onChange: (filters: EventFilters) => void;
  stateOptions: string[];
  cityStateMap: Record<string, string[]>;
  onClose?: () => void;
  expandDirection?: "vertical" | "popover";
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFilters,
  onChange,
  stateOptions,
  cityStateMap,
  onClose,
  expandDirection = "popover",
}) => {
  const [localFilters, setLocalFilters] = useState<EventFilters>(activeFilters);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>(activeFilters.states);

  // Sincronizar estados locais com os filtros ativos
  useEffect(() => {
    setLocalFilters(activeFilters);
    setSelectedStates(activeFilters.states);
  }, [activeFilters]);

  // Obter cidades disponíveis com base nos estados selecionados
  const availableCities = selectedStates.flatMap(state => 
    cityStateMap[state] || []
  );

  const handleDistanceChange = (distance: string, checked: boolean) => {
    const newDistances = checked
      ? [...localFilters.distances, distance]
      : localFilters.distances.filter(d => d !== distance);
    
    const newFilters = {
      ...localFilters,
      distances: newDistances
    };
    
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleStateChange = (state: string, checked: boolean) => {
    const newStates = checked
      ? [...localFilters.states, state]
      : localFilters.states.filter(s => s !== state);
    
    // Remover cidades que pertencem ao estado removido
    let newCities = [...localFilters.cities];
    if (!checked) {
      const stateCities = cityStateMap[state] || [];
      newCities = newCities.filter(city => !stateCities.includes(city));
    }
    
    const newFilters = {
      ...localFilters,
      states: newStates,
      cities: newCities
    };
    
    setLocalFilters(newFilters);
    setSelectedStates(newStates);
    onChange(newFilters);
  };

  const handleCityChange = (city: string, checked: boolean) => {
    const newCities = checked
      ? [...localFilters.cities, city]
      : localFilters.cities.filter(c => c !== city);
    
    const newFilters = {
      ...localFilters,
      cities: newCities
    };
    
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    const newFilters = {
      ...localFilters,
      dateRange: {
        from: range.from,
        to: range.to,
      },
    };
    
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const formatDateDisplay = () => {
    const { from, to } = localFilters.dateRange;
    
    if (from && to) {
      return `${format(from, 'dd/MM/yyyy')} - ${format(to, 'dd/MM/yyyy')}`;
    }
    
    if (from) {
      return `A partir de ${format(from, 'dd/MM/yyyy')}`;
    }
    
    if (to) {
      return `Até ${format(to, 'dd/MM/yyyy')}`;
    }
    
    return "Selecionar datas";
  };

  // Componente de calendário que pode ser usado tanto em modo popover quanto expandido
  const CalendarComponent = () => (
    <Calendar
      locale={ptBR}
      mode="range"
      selected={{
        from: localFilters.dateRange.from,
        to: localFilters.dateRange.to,
      }}
      onSelect={(range) => {
        handleDateChange(range || { from: undefined, to: undefined });
        if (range?.to && expandDirection === "popover") {
          setCalendarOpen(false);
        }
      }}
      className={expandDirection === "vertical" ? "mx-auto" : ""}
      initialFocus
    />
  );

  // Layout de filtros diferentes com base na direção de expansão
  const renderFilters = () => {
    const accordionDefaultValues = ["distances", "states", "cities", "dates"];

    return (
      <Accordion 
        type="multiple" 
        defaultValue={accordionDefaultValues} 
        className="w-full"
      >
        {/* Distâncias */}
        <AccordionItem value="distances" className="border-b">
          <AccordionTrigger className={cn(
            "py-3 px-2 hover:no-underline",
            expandDirection === "vertical" && "bg-gray-50 rounded-md mb-1"
          )}>
            <span>Distâncias</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <div className="space-y-2">
              {distanceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`distance-${option.value}`}
                    checked={localFilters.distances.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleDistanceChange(option.value, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`distance-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Estados */}
        <AccordionItem value="states" className="border-b">
          <AccordionTrigger className={cn(
            "py-3 px-2 hover:no-underline",
            expandDirection === "vertical" && "bg-gray-50 rounded-md mb-1"
          )}>
            <span>Estados</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <div className="space-y-2">
              {stateOptions.map((state) => (
                <div key={state} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`state-${state}`}
                    checked={localFilters.states.includes(state)}
                    onCheckedChange={(checked) => 
                      handleStateChange(state, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`state-${state}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {state}
                  </Label>
                </div>
              ))}
              {stateOptions.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum estado disponível</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cidades */}
        <AccordionItem value="cities" className="border-b">
          <AccordionTrigger className={cn(
            "py-3 px-2 hover:no-underline",
            expandDirection === "vertical" && "bg-gray-50 rounded-md mb-1"
          )}>
            <span>Cidades</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            <div className="space-y-2">
              {selectedStates.length === 0 ? (
                <p className="text-sm text-gray-500">Selecione um estado primeiro</p>
              ) : availableCities.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma cidade disponível</p>
              ) : (
                availableCities.map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`city-${city}`}
                      checked={localFilters.cities.includes(city)}
                      onCheckedChange={(checked) => 
                        handleCityChange(city, checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`city-${city}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {city}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Datas */}
        <AccordionItem value="dates" className="border-b">
          <AccordionTrigger className={cn(
            "py-3 px-2 hover:no-underline",
            expandDirection === "vertical" && "bg-gray-50 rounded-md mb-1"
          )}>
            <span>Período</span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            {expandDirection === "vertical" ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">{formatDateDisplay()}</p>
                <CalendarComponent />
              </div>
            ) : (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.dateRange.from && !localFilters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    {formatDateDisplay()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent />
                </PopoverContent>
              </Popover>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  return (
    <div className={cn("w-full", expandDirection === "vertical" ? "space-y-4" : "p-2")}>
      {renderFilters()}
      
      {expandDirection === "vertical" ? (
        <div className="flex justify-end mt-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onClose}
          >
            Aplicar Filtros
          </Button>
        </div>
      ) : (
        <div className="mt-4 px-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={onClose}
          >
            Aplicar Filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;