import React from "react";
import MapLibreMap from "./MapLibreMap";

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  distance: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  eventType?: string;
  price?: string;
}

interface EventMapProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
}

const EventMap = ({ events = [], onEventClick = () => {} }: EventMapProps) => {
  const handleEventClick = (eventId: string) => {
    onEventClick(eventId);
  };

  return (
    <MapLibreMap 
      events={events} 
      onEventClick={handleEventClick} 
      aria-label="Mapa de eventos de corrida"
    />
  );
};

export default EventMap;
