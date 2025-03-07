import React from "react";
import StaticMap from "./StaticMap";

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

interface StaticEventMapProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
  mapImageUrl?: string;
}

const StaticEventMap = ({
  events = [],
  onEventClick = () => {},
  mapImageUrl = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
}: StaticEventMapProps) => {
  return (
    <StaticMap
      events={events}
      onEventClick={onEventClick}
      mapImageUrl={mapImageUrl}
    />
  );
};

export default StaticEventMap;
