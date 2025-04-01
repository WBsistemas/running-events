import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Header from "../components/layout/Header";
import SearchBar, { EventFilters } from "../components/search/SearchBar";
import EventList from "../components/events/EventList";
import EventDetailsDialog from "../components/events/EventDetailsDialog";
import AddEventDialog from "../components/events/AddEventDialog";
import EditEventDialog from "../components/events/EditEventDialog";
import FloatingActionButton from "../components/layout/FloatingActionButton";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { EventService } from "@/services/eventService";
import { LocationService } from "@/services/locationService";
import { Toaster } from "@/components/ui/toaster";
import { parseISO, isWithinInterval, isAfter, isBefore } from "date-fns";

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
  latitude?: number;
  longitude?: number;
}

// Função para converter uma string de data em objeto Date
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Verifica se a data está no formato DD/MM/YYYY
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      return new Date(year, month - 1, day); // Mês em JS é zero-based
    }
    
    // Tenta parsar como ISO string
    const isoDate = parseISO(dateString);
    if (isNaN(isoDate.getTime())) return null;
    return isoDate;
  } catch (error) {
    console.error("Erro ao processar data:", error, dateString);
    return null;
  }
};

// Função para verificar se uma distância de evento corresponde aos filtros selecionados
const eventMatchesDistanceFilter = (eventDistance: string, selectedDistances: string[]): boolean => {
  if (!selectedDistances.length) return true;
  if (!eventDistance) return false;

  // Normalizar a distância do evento para comparação
  const normalizedDistance = eventDistance.toUpperCase().trim();

  for (const selectedDistance of selectedDistances) {
    if (normalizedDistance.includes(selectedDistance)) {
      return true;
    }
  }
  
  return false;
};

const Home = () => {
  const { toast } = useToast();

  // State for filters
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteringInProgress, setFilteringInProgress] = useState(false);
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [activeFilters, setActiveFilters] = useState<EventFilters>({
    distances: [],
    states: [],
    cities: [],
    dateRange: { from: undefined, to: undefined },
  });

  // Função para buscar eventos
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Desativar explicitamente o loading de filtros durante o carregamento inicial
      setFilteringInProgress(false);
      console.log("Buscando eventos do Supabase...");

      const data = await EventService.getAllEvents();

      console.log("Eventos recebidos:", data);

      if (!data || data.length === 0) {
        console.log("Nenhum evento encontrado no Supabase");
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const mappedEvents = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        distance: event.distance,
        participants: event.participants,
        description: event.description,
        organizer: "Organizador",
        imageUrl: event.image_url,
        registrationUrl: event.registration_url || "https://example.com/register",
        price: event.price,
        eventType: event.event_type,
        latitude: event.latitude || undefined,
        longitude: event.longitude || undefined,
        capacity: event.capacity,
      }));
      setEvents(mappedEvents);
      
      // Aplicar os filtros iniciais sem mostrar o loading de filtros
      applyFilters(mappedEvents, false);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar eventos"),
      );
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar filtros a um conjunto de eventos
  const applyFilters = (eventList: Event[], showLoading = true) => {
    if (showLoading) {
      setFilteringInProgress(true);
    }

    let result = [...eventList];

    // Aplicar filtro de termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term),
      );
    }

    // Aplicar filtros de distância
    if (activeFilters.distances.length > 0) {
      result = result.filter((event) =>
        eventMatchesDistanceFilter(event.distance, activeFilters.distances)
      );
    }

    // Aplicar filtros de estado
    if (activeFilters.states.length > 0) {
      result = result.filter((event) => {
        if (!event.location) return false;
        
        // Assumindo que a localização está no formato "Cidade, Estado"
        const parts = event.location.split(',').map(part => part.trim());
        const state = parts[parts.length - 1];
        
        return activeFilters.states.includes(state);
      });
    }

    // Aplicar filtros de cidade
    if (activeFilters.cities.length > 0) {
      result = result.filter((event) => {
        if (!event.location) return false;
        
        // Assumindo que a localização está no formato "Cidade, Estado"
        const parts = event.location.split(',').map(part => part.trim());
        const city = parts[0];
        
        return activeFilters.cities.includes(city);
      });
    }

    // Aplicar filtros de data
    if (activeFilters.dateRange.from || activeFilters.dateRange.to) {
      result = result.filter((event) => {
        // Se o evento não tiver data, não deve aparecer quando filtrado por data
        if (!event.date) return false;

        // Converter a data do evento para objeto Date
        const eventDate = parseDateString(event.date);
        if (!eventDate) return false;

        if (activeFilters.dateRange.from && activeFilters.dateRange.to) {
          // Verificar se a data do evento está dentro do intervalo
          return isWithinInterval(eventDate, {
            start: activeFilters.dateRange.from,
            end: activeFilters.dateRange.to
          });
        } else if (activeFilters.dateRange.from) {
          // Verificar se a data do evento é posterior à data inicial
          return isAfter(eventDate, activeFilters.dateRange.from) || 
                  eventDate.getTime() === activeFilters.dateRange.from.getTime();
        } else if (activeFilters.dateRange.to) {
          // Verificar se a data do evento é anterior à data final
          return isBefore(eventDate, activeFilters.dateRange.to) || 
                  eventDate.getTime() === activeFilters.dateRange.to.getTime();
        }
        
        return true;
      });
    }

    setFilteredEvents(result);
    if (showLoading) {
      setTimeout(() => {
        setFilteringInProgress(false);
      }, 300);
    }
  };

  // Carregar eventos quando o componente montar
  useEffect(() => {
    fetchEvents();
  }, []);

  // Efeito para aplicar filtros aos eventos quando as dependências mudam
  useEffect(() => {
    if (events.length === 0 || loading) return;

    // Pequeno delay para não fazer filtragem imediatamente após o carregamento
    const timeoutId = setTimeout(() => {
      applyFilters(events);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, events, activeFilters.distances, activeFilters.states, activeFilters.cities, activeFilters.dateRange.from, activeFilters.dateRange.to, loading]);

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailsDialogOpen(true);
  };

  const handleAddEventClick = () => {
    setAddEventDialogOpen(true);
  };

  const handleDetailsDialogOpenChange = (open: boolean) => {
    setEventDetailsDialogOpen(open);
  };

  const handleAddDialogOpenChange = (open: boolean) => {
    setAddEventDialogOpen(open);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditEventDialogOpen(open);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;

    try {
      // Excluir o evento do Supabase
      await EventService.deleteEvent(eventId);

      // Close the details dialog
      setEventDetailsDialogOpen(false);

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

  const handleEditEvent = (eventId: string) => {
    if (!eventId) return;

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
      // Get coordinates if location changed
      let coordinates = null;
      if (data.location !== eventToEdit.location) {
        coordinates = await LocationService.geocodeAddress(data.location);
      }

      // Use ISO format for date to avoid timestamp parsing issues
      // A data deve ser enviada como um objeto Date para o Supabase
      const formattedDate = data.date ? data.date : null;

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
        description: `Ocorreu um erro ao tentar atualizar o evento: ${(error as any).message || error}`,
        variant: "destructive",
      });
    }
  };

  const handleAddEventSubmit = async (data: any) => {
    try {
      // Get coordinates for the location
      const coordinates = await LocationService.geocodeAddress(data.location);

      // Use ISO format for date to avoid timestamp parsing issues
      // A data deve ser enviada como um objeto Date para o Supabas
      // Criar objeto de evento para inserção no Supabase
      const eventData = {
        title: data.title,
        date: data.date || null,
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
      await EventService.createEvent(eventData);

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
        description: `Ocorreu um erro ao tentar adicionar o evento: ${(error as any).message || error}`,
        variant: "destructive",
      });
    }
  };

  const handleFiltersChange = (filters: EventFilters) => {
    setActiveFilters(filters);
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      distances: [],
      states: [],
      cities: [],
      dateRange: { from: undefined, to: undefined },
    });
  };

  // Compute selected event from ID
  const selectedEvent = selectedEventId
    ? events.find(event => event.id === selectedEventId)
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 pb-20">
        {/* Search Bar */}
        <div className="w-full max-w-7xl mt-4">
          <SearchBar
            onSearch={handleSearch}
            value={searchTerm}
            onChange={handleSearchChange}
            events={events}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Event List */}
        <div className="w-full max-w-7xl mt-2 flex-1">
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg shadow-sm mt-4">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando eventos...</p>
              </div>
            </div>
          ) : filteringInProgress ? (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg shadow-sm mt-4">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Aplicando filtros...</p>
              </div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <EventList
              events={filteredEvents}
              onEventClick={handleEventClick}
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm mt-4">
              <p className="text-gray-500 mb-4">
                Nenhum evento encontrado com seus critérios
              </p>
              <Button
                variant="outline"
                onClick={handleClearAllFilters}
                className="text-blue-600 border-blue-600"
                aria-label="Limpar todos os filtros"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={handleAddEventClick}
          ariaLabel="Adicionar novo evento"
        >
          <Plus className="h-5 w-5" />
        </FloatingActionButton>
      </main>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        open={eventDetailsDialogOpen}
        onOpenChange={handleDetailsDialogOpenChange}
        event={selectedEvent || undefined}
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
      />

      {/* Add Event Dialog */}
      <AddEventDialog
        open={addEventDialogOpen}
        onOpenChange={handleAddDialogOpenChange}
        onSubmit={handleAddEventSubmit}
      />

      {/* Edit Event Dialog */}
      <EditEventDialog
        open={editEventDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        event={eventToEdit || undefined}
        onSubmit={handleEditEventSubmit}
      />

      <Toaster />
    </div>
  );
};

export default Home;
