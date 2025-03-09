import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
import Header from "./layout/Header";
import SearchBar from "./search/SearchBar";
import EventList from "./events/EventList";
import EventDetailsDialog from "./events/EventDetailsDialog";
import AddEventDialog from "./events/AddEventDialog";
import EditEventDialog from "./events/EditEventDialog";
import FloatingActionButton from "./layout/FloatingActionButton";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
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
  latitude?: number;
  longitude?: number;
}

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
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
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
        const mappedEvents = data.map((event: any) => ({
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

    setFilteredEvents(result);
  }, [searchTerm, events]);

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
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
    setSearchTerm("");
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
            onChange={setSearchTerm}
          />
        </div>

        {/* Event List */}
        <div className="w-full max-w-7xl mt-2 flex-1">
          {filteredEvents.length > 0 ? (
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
