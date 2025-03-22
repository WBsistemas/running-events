import React, { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutGrid,
  Calendar,
  List,
  MapPin,
  Users,
  Award,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  imageUrl: string;
  participants?: number;
  price?: string;
  eventType?: string;
  capacity?: number;
}

interface EventListProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
  onMapViewClick?: (eventId: string) => void;
  featuredEvents?: Event[];
}

const EventList = ({
  events = [],
  onEventClick = (eventId) => console.log(`Event clicked: ${eventId}`),
  onMapViewClick = (eventId) => console.log(`Map view for event: ${eventId}`),
  featuredEvents,
}: EventListProps) => {
  // Get view mode from localStorage or default to grid
  const [viewMode, setViewMode] = useState(() => {
    const savedMode = localStorage.getItem("eventViewMode");
    return savedMode || "grid";
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("eventViewMode", viewMode);
  }, [viewMode]);

  // Format date to show month and day more visibly
  const formatDate = (dateString: string) => {
    try {
      // Se a data for nula ou indefinida
      if (!dateString) {
        return { month: "???", day: "--" };
      }

      // Processar formato DD/MM/YYYY (formato garantido pelo supabaseService)
      const [day, month, year] = dateString.split('/').map(part => parseInt(part));
      const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      return { month: monthNames[month - 1], day };
    } catch (e) {
      console.error("Erro ao formatar data:", e, dateString);
      return { month: "???", day: "--" };
    }
  };

  // Group events by day for calendar view
  const eventsByDay = useMemo(() => {
    const days: Record<string, Event[]> = {};

    events.forEach((event) => {
      try {
        // Se a data for nula ou inválida, pule este evento
        if (!event.date) return;

        // Processar formato DD/MM/YYYY (formato garantido pelo supabaseService)
        const [day, month, year] = event.date.split('/').map(part => parseInt(part));
        // Formato YYYY-MM-DD para a chave
        const dayKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        if (!days[dayKey]) {
          days[dayKey] = [];
        }
        days[dayKey].push(event);
      } catch (e) {
        console.log("Erro ao processar data do evento:", event.date, e);
        // Skip events with invalid dates
      }
    });

    return days;
  }, [events]);

  // Get current month and year for calendar view
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create array for calendar grid (6 weeks × 7 days)
    const days = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, events: [] });
    }

    // Add days of the month with their events
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayKey = date.toISOString().split("T")[0];
      days.push({
        day,
        date: dayKey,
        events: eventsByDay[dayKey] || [],
      });
    }

    return days;
  }, [currentMonth, eventsByDay]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Check if an event is featured
  const isFeatured = (eventId: string) => {
    return featuredEvents?.some((event) => event.id === eventId) || false;
  };

  // Check if an event is free
  const isFreeEvent = (event: Event) => {
    return (
      event.price === "Free" || event.price === "$0.00" || event.price === "0"
    );
  };

  // Render featured events carousel - Removed as requested
  const renderFeaturedEvents = () => {
    return null;
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      {/* Featured Events */}
      {renderFeaturedEvents()}

      {/* View Mode Selector */}
      <Tabs
        defaultValue={viewMode}
        onValueChange={setViewMode}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">
            Eventos de Corrida
          </h2>
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Grade</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <List className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-full w-full">
          {/* Grid View */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-center animate-in fade-in-50 duration-300"
                >
                  <div
                    className="w-full max-w-[350px] overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group"
                    onClick={() => onEventClick(event.id)}
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 bg-white rounded-lg overflow-hidden shadow-md flex flex-col items-center p-1 w-14">
                        <span className="text-xs font-bold bg-blue-600 text-white w-full text-center py-1">
                          {formatDate(event.date).month}
                        </span>
                        <span className="text-lg font-bold text-gray-800 w-full text-center">
                          {formatDate(event.date).day}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {isFeatured(event.id) && (
                          <Badge className="bg-yellow-500 text-white font-bold">
                            Destaque
                          </Badge>
                        )}
                        {isFreeEvent(event) && (
                          <Badge className="bg-green-500 text-white">
                            Gratuito
                          </Badge>
                        )}
                        {event.eventType && (
                          <Badge className="bg-blue-500 text-white">
                            {event.eventType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-blue-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600 line-clamp-1">
                            {event.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">
                            {event.distance}
                          </span>
                        </div>

                        {event.capacity && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-600">
                              {event.capacity} capacidade
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-700 border-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event.id);
                          }}
                        >
                          Ver Detalhes
                        </Button>

                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMapViewClick(event.id);
                                  }}
                                >
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver no mapa</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-0">
            <div className="space-y-4 pb-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
                  onClick={() => onEventClick(event.id)}
                >
                  <div className="flex p-3">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-md overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Date Badge */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 text-center">
                        <div className="text-white text-xs font-bold">
                          {formatDate(event.date).month}{" "}
                          {formatDate(event.date).day}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-blue-800 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>

                        <div className="flex gap-1">
                          {isFeatured(event.id) && (
                            <Badge className="bg-yellow-500 text-white">
                              Destaque
                            </Badge>
                          )}
                          {isFreeEvent(event) && (
                            <Badge className="bg-green-500 text-white">
                              Gratuito
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 line-clamp-1">
                            {event.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">
                            {event.distance}
                          </span>
                        </div>

                        {event.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600">
                              {event.capacity} capacidade
                            </span>
                          </div>
                        )}

                        {event.eventType && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600">
                              {event.eventType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-700 border-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event.id);
                          }}
                        >
                          Ver Detalhes
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-700 hover:bg-blue-50 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMapViewClick(event.id);
                            }}
                          >
                            <MapPin className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Ver no Mapa
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden pb-6">
              {/* Calendar Header */}
              <div className="flex justify-between items-center p-4 bg-blue-50 border-b">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  &lt; Mês Anterior
                </Button>

                <h3 className="text-lg font-bold text-blue-800">
                  {currentMonth.toLocaleString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  Próximo Mês &gt;
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="py-2 font-semibold text-sm text-gray-600"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayData, index) => {
                    const isToday =
                      dayData.date === new Date().toISOString().split("T")[0];
                    const hasEvents =
                      dayData.events && dayData.events.length > 0;

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] border rounded-md p-1 ${!dayData.day ? "bg-gray-50" : ""} ${isToday
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                          } ${hasEvents ? "cursor-pointer hover:bg-blue-50" : ""}`}
                      >
                        {dayData.day && (
                          <>
                            <div
                              className={`text-right text-sm font-medium ${isToday ? "text-blue-700" : "text-gray-700"
                                }`}
                            >
                              {dayData.day}
                            </div>

                            {/* Events for this day */}
                            <div className="mt-1 space-y-1">
                              {dayData.events.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200"
                                  onClick={() => onEventClick(event.id)}
                                >
                                  {event.title}
                                </div>
                              ))}

                              {dayData.events.length > 3 && (
                                <div className="text-xs text-center text-blue-600 font-medium">
                                  +{dayData.events.length - 3} mais
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EventList;
