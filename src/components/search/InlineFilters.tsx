import React, { useState } from "react";
import { Calendar, MapPin, Ruler, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface InlineFiltersProps {
  onApplyFilters?: (filters: FilterOptions) => void;
  onClose?: () => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  dateRange: DateRange | undefined;
  distances: string[];
  eventTypes: string[];
  locationRadius: number;
  location: string;
  keyword: string;
}

const InlineFilters = ({
  onApplyFilters = () => {},
  onClose = () => {},
  initialFilters,
}: InlineFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      dateRange: undefined,
      distances: [],
      eventTypes: [],
      locationRadius: 25,
      location: "",
      keyword: "",
    },
  );

  const distanceOptions = [
    "5K",
    "10K",
    "15K",
    "21K",
    "Half Marathon",
    "Marathon",
    "Ultra",
  ];
  const eventTypeOptions = [
    "Official Race",
    "Training Run",
    "Charity Event",
    "Virtual Run",
    "Trail Run",
  ];

  const handleDistanceToggle = (distance: string) => {
    setFilters((prev) => {
      const newDistances = prev.distances.includes(distance)
        ? prev.distances.filter((d) => d !== distance)
        : [...prev.distances, distance];
      return { ...prev, distances: newDistances };
    });
  };

  const handleEventTypeToggle = (type: string) => {
    setFilters((prev) => {
      const newTypes = prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type];
      return { ...prev, eventTypes: newTypes };
    });
  };

  const handleRadiusChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      locationRadius: value[0],
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      location: e.target.value,
    }));
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      // Import the geocoding service
      const { getCurrentLocation, reverseGeocode } = await import(
        "@/services/geocoding"
      );

      // Show loading state
      setFilters((prev) => ({ ...prev, location: "Getting location..." }));

      // Get current coordinates
      const coords = await getCurrentLocation();

      // Reverse geocode to get address
      const address = await reverseGeocode(coords.latitude, coords.longitude);

      setFilters((prev) => ({
        ...prev,
        location: address || "Current Location",
      }));
    } catch (error) {
      console.error("Error getting current location:", error);
      setFilters((prev) => ({
        ...prev,
        location: "Current Location",
      }));
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: undefined,
      distances: [],
      eventTypes: [],
      locationRadius: 25,
      location: "",
      keyword: "",
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.distances.length > 0) count++;
    if (filters.eventTypes.length > 0) count++;
    if (filters.location) count++;
    if (filters.keyword) count++;
    if (filters.locationRadius !== 25) count++;
    return count;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-4 animate-in slide-in-from-top-5 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-blue-800 flex items-center">
          <span>Filtrar Eventos</span>
          {getActiveFilterCount() > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-800"
            >
              {getActiveFilterCount()} ativo(s)
            </Badge>
          )}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Período
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(filters.dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Localização
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite cidade ou localização"
                value={filters.location}
                onChange={handleLocationChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap"
                onClick={handleUseCurrentLocation}
              >
                Atual
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  Raio: {filters.locationRadius} km
                </span>
              </div>
              <Slider
                value={[filters.locationRadius]}
                min={5}
                max={100}
                step={5}
                onValueChange={handleRadiusChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4 text-green-600" />
              Distância
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {distanceOptions.map((distance) => (
                <Button
                  key={distance}
                  type="button"
                  variant={
                    filters.distances.includes(distance) ? "default" : "outline"
                  }
                  className={`text-sm ${filters.distances.includes(distance) ? "bg-blue-600 text-white" : "border-blue-600 text-blue-600"}`}
                  onClick={() => handleDistanceToggle(distance)}
                >
                  {distance}
                </Button>
              ))}
            </div>
          </div>

          {/* Event Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              Tipo de Evento
            </label>
            <div className="grid grid-cols-1 gap-2">
              {eventTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.eventTypes.includes(type)}
                    onCheckedChange={() => handleEventTypeToggle(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyword Filter */}
        <div className="space-y-2">
          <label
            htmlFor="keyword"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Tag className="h-4 w-4 text-green-600" />
            Palavra-chave
          </label>
          <Input
            id="keyword"
            placeholder="Buscar por palavra-chave"
            value={filters.keyword}
            onChange={handleKeywordChange}
          />
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Filtros Ativos:</label>
            <div className="flex flex-wrap gap-2">
              {filters.dateRange?.from && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>
                    {format(filters.dateRange.from, "MMM dd")}
                    {filters.dateRange.to &&
                      `- ${format(filters.dateRange.to, "MMM dd")}`}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: undefined,
                      }))
                    }
                  />
                </Badge>
              )}

              {filters.location && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>{filters.location}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, location: "" }))
                    }
                  />
                </Badge>
              )}

              {filters.distances.map((distance) => (
                <Badge
                  key={distance}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>{distance}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleDistanceToggle(distance)}
                  />
                </Badge>
              ))}

              {filters.eventTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>{type}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleEventTypeToggle(type)}
                  />
                </Badge>
              ))}

              {filters.keyword && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>"{filters.keyword}"</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, keyword: "" }))
                    }
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="border-gray-300 text-gray-700"
          >
            Limpar Todos
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineFilters;
