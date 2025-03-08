import React, { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useSupabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, List } from "lucide-react";
import EventMap from "@/components/map/EventMap";
import EventDetailsDialog from "@/components/events/EventDetailsDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  latitude?: number;
  longitude?: number;
}

const MapView = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);

  // Usar o hook useEvents para buscar eventos do Supabase
  const { events: supabaseEvents, loading } = useEvents();

  // Carregar eventos do Supabase quando o componente montar
  useEffect(() => {
    if (supabaseEvents.length > 0) {
      // Mapear os eventos do Supabase para o formato esperado pelo componente
      const mappedEvents = supabaseEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        distance: event.distance,
        participants: event.participants,
        description: event.description,
        organizer: "Organizer", // Placeholder até implementarmos a tabela de organizadores
        imageUrl: event.image_url,
        registrationUrl:
          event.registration_url || "https://example.com/register",
        price: event.price,
        eventType: event.event_type,
        latitude: event.latitude || undefined,
        longitude: event.longitude || undefined,
      }));
      setEvents(mappedEvents);
    }
  }, [supabaseEvents]);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailsDialogOpen(true);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  // Find selected event
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full h-16 px-4 flex items-center justify-between shadow-sm bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-blue-800">Mapa de Eventos</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="flex items-center gap-2 text-blue-700 border-blue-700"
        >
          <List className="h-4 w-4" />
          <span>Visualização em Lista</span>
        </Button>
      </header>

      {/* Main Container with Map and Event List */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Event List Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-blue-800">
              Eventos de Corrida
            </h2>
            <p className="text-sm text-gray-500">
              {events.length} eventos encontrados
            </p>
          </div>
          <ScrollArea className="h-[calc(100vh-9rem)]">
            <div className="p-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                        {event.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          {event.distance}
                        </span>
                        {event.eventType && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            {event.eventType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Map Container */}
        <div className="flex-1">
          <EventMap events={events} onEventClick={handleEventClick} />
        </div>
      </main>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <EventDetailsDialog
          open={eventDetailsDialogOpen}
          onOpenChange={(open: boolean) => setEventDetailsDialogOpen(open)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default MapView;
