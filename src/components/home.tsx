import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Header from "./layout/Header";
import SearchBar from "./search/SearchBar";
import { FilterOptions } from "./search/FilterDialog";
import InlineFilters from "./search/InlineFilters";
import EventList from "./events/EventList";
import EventDetailsDialog from "./events/EventDetailsDialog";
import AddEventDialog from "./events/AddEventDialog";
import EditEventDialog from "./events/EditEventDialog";
import FloatingActionButton from "./layout/FloatingActionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EventService } from "@/services/supabaseService";
import { Toaster } from "@/components/ui/toaster";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  participants: number;
  description: string;
  organizer: string;
  imageUrl: string;
  registrationUrl: string;
  price: string;
  eventType?: string;
  capacity: number;
}

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    dateRange: undefined,
    distances: [],
    eventTypes: [],
    locationRadius: 25,
    location: "",
    keyword: "",
  });
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Carregar eventos diretamente do Supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Função para buscar eventos
  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Buscando eventos do Supabase...");

      const { data, error } = await supabase
        .from("events")
        .select("*");

      if (error) {
        throw error;
      }

      console.log("Eventos recebidos:", data);

      if (data && data.length > 0) {
        // Mapear os eventos do Supabase para o formato esperado pelo componente
        const mappedEvents = data.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          distance: event.distance,
          participants: event.participants,
          description: event.description,
          organizer: "Organizador", // Placeholder até implementarmos a tabela de organizadores
          imageUrl: event.image_url,
          registrationUrl:
            event.registration_url || "https://example.com/register",
          price: event.price,
          eventType: event.event_type,
          latitude: event.latitude || undefined,
          longitude: event.longitude || undefined,
          capacity: event.capacity,
        }));
        setEvents(mappedEvents);
      } else {
        console.log("Nenhum evento encontrado no Supabase");
      }
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar eventos"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar eventos quando o componente montar
  useEffect(() => {
    fetchEvents();
  }, []);

  // Hook useEvents já importado no topo do arquivo

  // Apply filters to events
  useEffect(() => {
    let result = [...events];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term),
      );
    }

    // Apply keyword filter
    if (activeFilters.keyword) {
      const keyword = activeFilters.keyword.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(keyword) ||
          event.location.toLowerCase().includes(keyword) ||
          event.description.toLowerCase().includes(keyword) ||
          (event.eventType && event.eventType.toLowerCase().includes(keyword)),
      );
    }

    // Apply location filter
    if (
      activeFilters.location &&
      activeFilters.location !== "Current Location"
    ) {
      const location = activeFilters.location.toLowerCase();
      result = result.filter((event) =>
        event.location.toLowerCase().includes(location),
      );
    }

    // Apply distance filter
    if (activeFilters.distances.length > 0) {
      result = result.filter((event) => {
        // Handle comma-separated distances
        const eventDistances = event.distance.split(",").map((d) => d.trim());

        return activeFilters.distances.some((distance) =>
          eventDistances.some(
            (eventDist) =>
              eventDist.includes(distance) ||
              (distance === "Marathon" && eventDist.includes("42")) ||
              (distance === "Half Marathon" && eventDist.includes("21")),
          ),
        );
      });
    }

    // Apply event type filter
    if (activeFilters.eventTypes.length > 0) {
      result = result.filter(
        (event) =>
          event.eventType && activeFilters.eventTypes.includes(event.eventType),
      );
    }

    // Apply date range filter (simplified for demo)
    if (activeFilters.dateRange?.from) {
      // In a real app, you would parse the date strings and compare them properly
      // This is just a simplified example
      const fromMonth = activeFilters.dateRange.from.getMonth();
      result = result.filter((event) => {
        // Simple check if the event month contains the filter month name
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return event.date.includes(monthNames[fromMonth]);
      });
    }

    setFilteredEvents(result);
  }, [searchTerm, activeFilters, events]);

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailsDialogOpen(true);
  };

  const handleAddEventClick = () => {
    setAddEventDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Excluir o evento do Supabase
      await EventService.deleteEvent(eventId);

      // Close the details dialog
      setEventDetailsDialogOpen(false);

      // Remove the event from the events array
      setEvents((prevEvents) => {
        return prevEvents.filter((event) => event.id !== eventId);
      });

      // Clear the selected event ID
      setSelectedEventId(null);

      // Show success toast notification
      toast({
        title: "Evento Excluído",
        description: "O evento foi excluído com sucesso.",
        variant: "destructive",
      });

      // Recarregar eventos do Supabase
      fetchEvents();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        title: "Erro ao excluir evento",
        description: "Ocorreu um erro ao tentar excluir o evento.",
        variant: "destructive",
      });
    }
  };

  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  const handleEditEvent = (eventId: string) => {
    // Find the event to edit
    const eventToEdit = events.find((event) => event.id === eventId);
    if (!eventToEdit) return;

    // Close the details dialog
    setEventDetailsDialogOpen(false);

    // Open the edit dialog with the event data
    setEventToEdit(eventToEdit);
    setEditEventDialogOpen(true);
  };

  const handleEditEventSubmit = async (data: any) => {
    if (!eventToEdit) return;

    try {
      // Import the geocoding service
      const { geocodeAddress } = await import("@/services/geocoding");

      // If location changed, geocode the new location
      let coordinates = null;
      if (data.location !== eventToEdit.location) {
        coordinates = await geocodeAddress(data.location);
      }

      // Formatar a data para o formato esperado pelo Supabase
      const formattedDate = new Date(data.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // Criar objeto de evento para atualização no Supabase
      const eventData = {
        title: data.title,
        date: formattedDate,
        time: data.time,
        location: data.location,
        distance: data.distance || "5K",
        capacity: parseInt(data.capacity) || 0,
        description: data.description,
        image_url: data.imageUrl || eventToEdit.imageUrl,
        price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free",
        event_type: eventToEdit.eventType,
        // Update coordinates if we have new ones
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      // Atualizar o evento no Supabase
      await EventService.updateEvent(eventToEdit.id, eventData);

      // Create updated event object for local state
      const updatedEvent: Event = {
        ...eventToEdit,
        title: data.title,
        date: formattedDate,
        time: data.time,
        location: data.location,
        distance: data.distance || "5K",
        participants: parseInt(data.capacity) || 0,
        description: data.description,
        imageUrl: data.imageUrl || eventToEdit.imageUrl,
        price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free",
        // Update coordinates if we have new ones
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      // Update the event in the local events array
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event,
        ),
      );

      // Show success toast notification
      toast({
        title: "Evento Atualizado com Sucesso",
        description: `${data.title} foi atualizado.`,
        variant: "success",
      });

      // Recarregar eventos do Supabase
      fetchEvents();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: "Ocorreu um erro ao tentar atualizar o evento.",
        variant: "destructive",
      });
    }
  };

  const handleAddEventSubmit = async (data: any) => {
    try {
      // Import the geocoding service
      const { geocodeAddress } = await import("@/services/geocoding");

      // Geocode the location to get coordinates
      const coordinates = await geocodeAddress(data.location);

      // Formatar a data para o formato esperado pelo Supabase
      const formattedDate = new Date(data.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // Criar objeto de evento para inserção no Supabase
      const eventData = {
        title: data.title,
        date: formattedDate,
        time: data.time,
        location: data.location,
        distance: data.distance || "5K",
        capacity: parseInt(data.capacity) || 0,
        participants: 0,
        description: data.description,
        image_url:
          data.imageUrl ||
          "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registration_url: "https://example.com/register",
        price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free",
        event_type: "Official Race",
        // Add coordinates if geocoding was successful
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      // Inserir o evento no Supabase
      const result = await EventService.createEvent(eventData);

      // Criar objeto de evento para o estado local
      const newEvent: Event = {
        id: result.id,
        title: data.title,
        date: formattedDate,
        time: data.time,
        location: data.location,
        distance: data.distance || "5K",
        participants: 0,
        description: data.description,
        organizer: "Your Organization",
        imageUrl:
          data.imageUrl ||
          "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free",
        eventType: "Official Race",
        // Add coordinates if geocoding was successful
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
        capacity: parseInt(data.capacity) || 0,
      };

      // Add the new event to the events array with animation
      setEvents((prevEvents) => [newEvent, ...prevEvents]);

      // Show success toast notification
      toast({
        title: "Evento Adicionado com Sucesso",
        description: `${data.title} foi adicionado à lista de eventos.`,
        variant: "success",
      });

      // Recarregar eventos do Supabase
      fetchEvents();
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      toast({
        title: "Erro ao adicionar evento",
        description: "Ocorreu um erro ao tentar adicionar o evento.",
        variant: "destructive",
      });
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dateRange: undefined,
      distances: [],
      eventTypes: [],
      locationRadius: 25,
      location: "",
      keyword: "",
    });
    setSearchTerm("");
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "search":
        setSearchTerm("");
        break;
      case "location":
        setActiveFilters((prev) => ({ ...prev, location: "" }));
        break;
      case "dateRange":
        setActiveFilters((prev) => ({ ...prev, dateRange: undefined }));
        break;
      case "distance":
        if (value) {
          setActiveFilters((prev) => ({
            ...prev,
            distances: prev.distances.filter((d) => d !== value),
          }));
        }
        break;
      case "eventType":
        if (value) {
          setActiveFilters((prev) => ({
            ...prev,
            eventTypes: prev.eventTypes.filter((t) => t !== value),
          }));
        }
        break;
      case "keyword":
        setActiveFilters((prev) => ({ ...prev, keyword: "" }));
        break;
    }
  };

  // Find selected event
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    activeFilters.location ||
    activeFilters.dateRange ||
    activeFilters.distances.length > 0 ||
    activeFilters.eventTypes.length > 0 ||
    activeFilters.keyword;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 pb-20">
        {/* Search Bar */}
        <div className="w-full max-w-7xl mt-4">
          <SearchBar
            onSearch={handleSearch}
            onFilterClick={handleFilterClick}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Inline Filters */}
        {showFilters && (
          <div className="w-full max-w-7xl">
            <InlineFilters
              onApplyFilters={handleApplyFilters}
              onClose={() => setShowFilters(false)}
              initialFilters={activeFilters}
            />
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="w-full max-w-7xl mt-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Filtros Ativos:
              </span>

              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Busca: "{searchTerm}"</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("search")}
                  />
                </Badge>
              )}

              {activeFilters.location && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Localização: {activeFilters.location}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("location")}
                  />
                </Badge>
              )}

              {activeFilters.dateRange?.from && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>
                    Data:{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    }).format(activeFilters.dateRange.from)}
                    {activeFilters.dateRange.to &&
                      ` - ${new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      }).format(activeFilters.dateRange.to)}`}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("dateRange")}
                  />
                </Badge>
              )}

              {activeFilters.distances.map((distance) => (
                <Badge
                  key={distance}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Distância: {distance}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("distance", distance)}
                  />
                </Badge>
              ))}

              {activeFilters.eventTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Tipo: {type}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("eventType", type)}
                  />
                </Badge>
              ))}

              {activeFilters.keyword && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Palavra-chave: "{activeFilters.keyword}"</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("keyword")}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs"
              >
                Limpar Todos
              </Button>
            </div>
          </div>
        )}

        {/* Event List */}
        <div className="w-full max-w-7xl mt-2 flex-1">
          {filteredEvents.length > 0 ? (
            <EventList
              events={filteredEvents}
              onEventClick={handleEventClick}
              onMapViewClick={(eventId) => {
                // Navigate to map view with the selected event
                navigate(`/map?event=${eventId}`);
              }}
              featuredEvents={events
                .filter(
                  (event) =>
                    // For demo purposes, mark some events as featured
                    event.eventType === "Charity Event" ||
                    event.title.includes("Marathon") ||
                    event.id === "1" ||
                    event.id === "3",
                )
                .slice(0, 3)}
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm mt-4">
              <p className="text-gray-500 mb-4">
                Nenhum evento encontrado com seus critérios
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="text-blue-600 border-blue-600"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={handleAddEventClick}
          icon={<Plus className="h-6 w-6 text-white" />}
        />
      </main>

      {/* Toast notifications */}
      <Toaster />

      {selectedEvent && (
        <EventDetailsDialog
          open={eventDetailsDialogOpen}
          onOpenChange={(open: boolean) => setEventDetailsDialogOpen(open)}
          event={selectedEvent}
          onDelete={(eventId?: string) => eventId && handleDeleteEvent(eventId)}
          onEdit={(eventId?: string) => eventId && handleEditEvent(eventId)}
        />
      )}

      <AddEventDialog
        open={addEventDialogOpen}
        onOpenChange={setAddEventDialogOpen}
        onSubmit={handleAddEventSubmit}
      />

      {eventToEdit && (
        <EditEventDialog
          open={editEventDialogOpen}
          onOpenChange={setEditEventDialogOpen}
          onSubmit={handleEditEventSubmit}
          event={eventToEdit}
        />
      )}
    </div>
  );
};

export default Home;
