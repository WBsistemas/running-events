import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import SearchBar from "../components/search/SearchBar";
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
import { useAuth } from "@/lib/authContext";
import { EventsLoading } from "@/components/events/EventsLoading";
import { EventDetailsSkeleton } from "@/components/events/EventDetailsSkeleton";
import { EventFormSkeleton } from "@/components/events/EventFormSkeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
  creatorId?: string;
}

const MyEvents = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for filters
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDetailsLoading, setEventDetailsLoading] = useState(false);
  const [addFormLoading, setAddFormLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Função para buscar eventos do usuário
  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      if (!user || !user.id) {
        // Usuário não está logado ou não possui ID
        setEvents([]);
        return;
      }
      
      // Buscar apenas eventos criados pelo usuário atual
      const data = await EventService.getUserEvents(user.id);

      if (!data || data.length === 0) {
        setEvents([]);
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
        organizer: "Você",
        imageUrl: event.image_url,
        registrationUrl: event.registration_url || "https://example.com/register",
        price: event.price,
        eventType: event.event_type,
        latitude: event.latitude || undefined,
        longitude: event.longitude || undefined,
        capacity: event.capacity,
        creatorId: event.creator_id,
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Erro ao buscar eventos do usuário:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar seus eventos"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar eventos quando o componente montar
  useEffect(() => {
    fetchUserEvents();
  }, [user]);

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailsLoading(true);
    setEventDetailsDialogOpen(true);
    
    // Simulate loading time for details (remove this in production)
    setTimeout(() => {
      setEventDetailsLoading(false);
    }, 1000);
  };

  const handleAddEventClick = () => {
    setAddFormLoading(true);
    setAddEventDialogOpen(true);
    
    // Simulate loading time for the form (remove this in production)
    setTimeout(() => {
      setAddFormLoading(false);
    }, 800);
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
      // Set loading state
      setLoading(true);
      console.log(`Iniciando exclusão do evento ${eventId}...`);
      
      // Excluir o evento do Supabase
      await EventService.deleteEvent(eventId);
      console.log(`Evento ${eventId} excluído com sucesso no Supabase`);

      // Close the details dialog
      setEventDetailsDialogOpen(false);

      // Clear the selected event ID
      setSelectedEventId(null);

      // Atualizar o estado local removendo o evento excluído
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // Também atualizar a lista filtrada
      setFilteredEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      console.log("Estado local de eventos atualizado após exclusão");

      // Show success toast notification
      toast({
        title: "Evento Excluído",
        description: "O evento foi excluído com sucesso.",
        variant: "destructive",
      });

      // Recarregar eventos do usuário para garantir sincronização
      await fetchUserEvents();
      console.log("Eventos recarregados após exclusão");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        title: "Erro ao excluir evento",
        description: "Ocorreu um erro ao tentar excluir o evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("Loading state redefinido após exclusão");
    }
  };

  const handleEditEvent = (eventId: string) => {
    if (!eventId) return;

    // Find the event to edit
    const eventToEdit = events.find((event) => event.id === eventId);
    if (!eventToEdit) return;

    // Close the details dialog
    setEventDetailsDialogOpen(false);

    // Show loading state for edit form
    setEditFormLoading(true);
    
    // Open the edit dialog with the event data
    setEventToEdit(eventToEdit);
    setEditEventDialogOpen(true);
    
    // Simulate loading time for the form (remove this in production)
    setTimeout(() => {
      setEditFormLoading(false);
    }, 800);
  };

  const handleEditEventSubmit = async (data: any) => {
    if (!eventToEdit) return;

    try {
      // Set loading state
      setLoading(true);
      
      // Get coordinates if location changed
      let coordinates = null;
      if (data.location !== eventToEdit.location) {
        coordinates = await LocationService.geocodeAddress(data.location);
      }

      // Use ISO format for date to avoid timestamp parsing issues
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
        creator_id: user?.id,
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

      // Recarregar eventos do usuário
      await fetchUserEvents();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: `Ocorreu um erro ao tentar atualizar o evento: ${(error as any).message || error}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAddEventSubmit = async (data: any) => {
    try {
      // Set loading state
      setLoading(true);
      
      // Get coordinates for the location
      const coordinates = await LocationService.geocodeAddress(data.location);

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
        creator_id: user?.id,
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

      // Recarregar eventos do usuário
      await fetchUserEvents();
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      toast({
        title: "Erro ao adicionar evento",
        description: `Ocorreu um erro ao tentar adicionar o evento: ${(error as any).message || error}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
  };

  // Compute selected event from ID
  const selectedEvent = selectedEventId
    ? events.find(event => event.id === selectedEventId)
    : null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main className="flex-1 flex flex-col items-center px-4 pb-20">
          <div className="w-full max-w-7xl mt-6 mb-2">
            <h1 className="text-2xl font-bold text-blue-800 mb-2">Meus Eventos</h1>
            <p className="text-gray-600 mb-6">
              Gerencie os eventos que você criou. Adicione, edite ou remova eventos conforme necessário.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-7xl">
            <SearchBar
              onSearch={handleSearch}
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Pesquisar meus eventos..."
            />
          </div>

          {/* Event List or Loading State */}
          <div className="w-full max-w-7xl mt-2 flex-1">
            {loading ? (
              <EventsLoading />
            ) : filteredEvents.length > 0 ? (
              <EventList
                events={filteredEvents}
                onEventClick={handleEventClick}
              />
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm mt-4">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 
                   "Nenhum evento encontrado com seus critérios" : 
                   "Você ainda não criou nenhum evento"}
                </p>
                {searchTerm ? (
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    className="text-blue-600 border-blue-600 mb-4"
                    aria-label="Limpar todos os filtros"
                  >
                    Limpar Filtros
                  </Button>
                ) : null}
                <Button
                  onClick={handleAddEventClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Adicionar novo evento"
                >
                  <Plus className="h-5 w-5 mr-2" /> Criar Meu Primeiro Evento
                </Button>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          {filteredEvents.length > 0 && (
            <FloatingActionButton
              onClick={handleAddEventClick}
              icon={<Plus className="h-6 w-6 text-white" />}
              ariaLabel="Adicionar novo evento"
            />
          )}
        </main>

        {/* Toast notifications */}
        <Toaster />

        {/* Show skeleton when loading details */}
        {eventDetailsLoading && (
          <EventDetailsSkeleton
            open={eventDetailsDialogOpen}
            onOpenChange={handleDetailsDialogOpenChange}
          />
        )}

        {/* Show actual details when not loading */}
        {!eventDetailsLoading && selectedEvent && (
          <EventDetailsDialog
            open={eventDetailsDialogOpen}
            onOpenChange={handleDetailsDialogOpenChange}
            event={selectedEvent}
            onDelete={handleDeleteEvent}
            onEdit={handleEditEvent}
            isCreator={true}
            isAuthenticated={true}
          />
        )}

        {/* Show add form skeleton during loading */}
        {addFormLoading && (
          <EventFormSkeleton
            open={addEventDialogOpen}
            onOpenChange={handleAddDialogOpenChange}
          />
        )}

        {/* Show actual add form when not loading */}
        {!addFormLoading && (
          <AddEventDialog
            open={addEventDialogOpen}
            onOpenChange={handleAddDialogOpenChange}
            onSubmit={handleAddEventSubmit}
          />
        )}

        {/* Show edit form skeleton during loading */}
        {editFormLoading && (
          <EventFormSkeleton
            open={editEventDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
            isEditMode={true}
          />
        )}

        {/* Show actual edit form when not loading */}
        {!editFormLoading && eventToEdit && (
          <EditEventDialog
            open={editEventDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
            onSubmit={handleEditEventSubmit}
            event={eventToEdit}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyEvents; 