import React, { useState, useEffect, useRef } from "react";
import { MapPin, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface StaticMapProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
  mapImageUrl?: string;
  width?: number;
  height?: number;
}

// Default coordinates for major cities to use as fallbacks
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.006 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Colorado: { lat: 39.5501, lng: -105.7821 },
  Washington: { lat: 38.9072, lng: -77.0369 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Anywhere: { lat: 39.8283, lng: -98.5795 }, // Center of US
};

// Map boundaries (these would be calibrated based on the actual map image)
const MAP_BOUNDS = {
  north: 49.3457868, // Top latitude
  south: 24.396308, // Bottom latitude
  east: -66.93457, // Right longitude
  west: -124.7844079, // Left longitude
};

const StaticMap = ({
  events = [],
  onEventClick = () => {},
  mapImageUrl = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  width = 1000,
  height = 600,
}: StaticMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Calculate position on the map image based on latitude and longitude
  const calculatePosition = (
    lat?: number,
    lng?: number,
    location?: string,
  ): { x: number; y: number } => {
    if (!lat || !lng) {
      // Try to find the city in our predefined coordinates
      if (location) {
        for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
          if (location.includes(city)) {
            lat = coords.lat;
            lng = coords.lng;
            break;
          }
        }
      }

      // If still no coordinates, use a default position with slight randomization
      if (!lat || !lng) {
        const defaultCoords = CITY_COORDINATES["New York"];
        lat = defaultCoords.lat + (Math.random() - 0.5) * 2;
        lng = defaultCoords.lng + (Math.random() - 0.5) * 2;
      }
    }

    // Convert lat/lng to x/y coordinates on the image
    // This is a simple linear mapping - in a real app, you'd use proper map projection
    const x =
      ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * width;
    const y =
      ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) *
      height;

    // Add small random offset to prevent pins from stacking exactly
    const randomOffset = events.length > 10 ? 5 : 0;
    return {
      x: Math.max(
        20,
        Math.min(width - 20, x + (Math.random() - 0.5) * randomOffset),
      ),
      y: Math.max(
        20,
        Math.min(height - 20, y + (Math.random() - 0.5) * randomOffset),
      ),
    };
  };

  // Handle image load
  const handleImageLoad = () => {
    setMapLoaded(true);
  };

  // Get marker color based on event type
  const getMarkerColor = (event: Event) => {
    const eventDate = new Date(event.date);
    const isPastEvent = eventDate < new Date();

    if (isPastEvent) return "#9CA3AF"; // Gray for past events

    switch (event.eventType) {
      case "Charity Event":
        return "#10B981"; // Green
      case "Trail Run":
        return "#F59E0B"; // Amber
      case "Virtual Run":
        return "#8B5CF6"; // Purple
      case "Training Run":
        return "#EC4899"; // Pink
      default:
        return "#3B82F6"; // Blue default
    }
  };

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="relative w-full h-full"
        style={{ minHeight: "500px" }}
      >
        {/* Static Map Image */}
        <img
          src={mapImageUrl}
          alt="Map of event locations"
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          style={{ filter: "saturate(0.9) brightness(1.05)" }}
        />

        {/* Event Pins */}
        <TooltipProvider>
          {events.map((event) => {
            const { x, y } = calculatePosition(
              event.latitude,
              event.longitude,
              event.location,
            );
            const isSelected = selectedPin === event.id;
            const isHovered = hoveredEventId === event.id;
            const markerColor = getMarkerColor(event);

            return (
              <div key={event.id}>
                <Tooltip open={isHovered}>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${isSelected || isHovered ? "z-20 scale-125" : "z-10"}`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                      }}
                      onClick={() => {
                        setSelectedPin(event.id);
                        onEventClick(event.id);
                      }}
                      onMouseEnter={() => setHoveredEventId(event.id)}
                      onMouseLeave={() => setHoveredEventId(null)}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                        style={{
                          backgroundColor: markerColor,
                          border:
                            isSelected || isHovered
                              ? "2px solid white"
                              : "1px solid white",
                          transform: `scale(${isSelected || isHovered ? 1.2 : 1})`,
                        }}
                      >
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="p-0 overflow-hidden border-none shadow-lg"
                  >
                    <div className="w-48 bg-white rounded-md overflow-hidden">
                      <div className="h-20 w-full overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm text-blue-800 truncate">
                          {event.title}
                        </h3>
                        <p className="text-xs text-gray-500">{event.date}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {event.location}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            {event.distance}
                          </span>
                          {event.eventType && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">
                              {event.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-2 rounded-md shadow-md">
          <h4 className="text-xs font-medium mb-1">Event Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Official Race</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Charity Event</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs">Trail Run</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs">Virtual Run</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-xs">Training Run</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-xs">Past Event</span>
            </div>
          </div>
        </div>

        {/* Info Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white bg-opacity-90 shadow-md"
          onClick={() =>
            alert(
              "This is a static map visualization. Event pins are positioned approximately based on their locations.",
            )
          }
        >
          <Info className="h-4 w-4 mr-1" />
          About Map
        </Button>
      </div>
    </div>
  );
};

export default StaticMap;
