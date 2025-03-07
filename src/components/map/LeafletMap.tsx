import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface LeafletMapProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
}

const LeafletMap = ({
  events = [],
  onEventClick = () => {},
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Load Leaflet scripts and CSS
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      setMapLoaded(true);
      return;
    }

    // Add Leaflet CSS
    const leafletCss = document.createElement("link");
    leafletCss.id = "leaflet-css";
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCss.crossOrigin = "";
    document.head.appendChild(leafletCss);

    // Add Leaflet JS
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletScript.crossOrigin = "";
    leafletScript.onload = () => setMapLoaded(true);
    document.head.appendChild(leafletScript);

    return () => {
      // Clean up script if component unmounts before script loads
      if (document.head.contains(leafletScript)) {
        document.head.removeChild(leafletScript);
      }
      if (document.head.contains(leafletCss)) {
        document.head.removeChild(leafletCss);
      }
    };
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;

    try {
      // Create map instance
      const L = (window as any).L;
      if (!L) {
        console.error("Leaflet library not loaded");
        return;
      }

      const newMap = L.map(mapRef.current).setView([40.7128, -74.006], 5);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap);

      setMap(newMap);

      return () => {
        if (newMap) {
          newMap.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [mapLoaded, map]);

  // Add markers for events
  useEffect(() => {
    if (!map || !events.length) return;

    try {
      // Check if Leaflet is available
      const L = (window as any).L;
      if (!L) {
        console.error("Leaflet library not loaded");
        return;
      }

      // Clear existing markers
      markers.forEach((marker) => marker.remove());

      const newMarkers: any[] = [];
      const bounds = L.latLngBounds([]);

      // Helper function to get coordinates for an event
      const getEventCoordinates = async (
        event: Event,
      ): Promise<[number, number]> => {
        // If the event already has coordinates, use them
        if (event.latitude && event.longitude) {
          return [event.latitude, event.longitude];
        }

        try {
          // Import the geocoding service
          const { geocodeAddress } = await import("@/services/geocoding");

          // Try to geocode the location
          const coordinates = await geocodeAddress(event.location);

          if (coordinates) {
            return [coordinates.latitude, coordinates.longitude];
          }
        } catch (error) {
          console.error("Error geocoding location:", error);
        }

        // Fallback to approximate coordinates based on city name
        const cityCoordinates: { [key: string]: [number, number] } = {
          "New York": [40.7128, -74.006],
          Miami: [25.7617, -80.1918],
          "San Francisco": [37.7749, -122.4194],
          Colorado: [39.5501, -105.7821],
          Washington: [38.9072, -77.0369],
          "Los Angeles": [34.0522, -118.2437],
          Chicago: [41.8781, -87.6298],
          Boston: [42.3601, -71.0589],
          Seattle: [47.6062, -122.3321],
          Austin: [30.2672, -97.7431],
        };

        // Find a matching city or default to New York
        let baseCoords: [number, number] = [40.7128, -74.006]; // Default to New York

        for (const [city, coords] of Object.entries(cityCoordinates)) {
          if (event.location.includes(city)) {
            baseCoords = coords;
            break;
          }
        }

        // Add small random offset to prevent markers from stacking
        const lat = baseCoords[0] + (Math.random() - 0.5) * 0.1;
        const lng = baseCoords[1] + (Math.random() - 0.5) * 0.1;

        return [lat, lng];
      };

      // Create markers for each event
      const createMarkers = async () => {
        for (const event of events) {
          // Get coordinates for the event
          const coords = await getEventCoordinates(event);

          // Determine marker color based on event type or if it's in the past
          const eventDate = new Date(event.date);
          const isPastEvent = eventDate < new Date();

          const markerColor = isPastEvent
            ? "#9CA3AF" // Gray for past events
            : event.eventType === "Charity Event"
              ? "#10B981" // Green for charity
              : event.eventType === "Trail Run"
                ? "#F59E0B" // Amber for trail
                : event.eventType === "Virtual Run"
                  ? "#8B5CF6" // Purple for virtual
                  : "#3B82F6"; // Blue default

          // Create custom icon
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="
            width: 30px; 
            height: 30px; 
            border-radius: 50%; 
            background-color: ${markerColor}; 
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          });

          // Create marker with popup
          const marker = L.marker(coords as [number, number], {
            icon,
          }).addTo(map);

          // Create popup content
          const popupContent = `
          <div style="width: 200px;">
            <div style="font-weight: bold; color: #1E40AF; margin-bottom: 5px;">${event.title}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 5px;">${event.date}</div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 5px;">${event.location}</div>
            <div style="display: flex; gap: 5px; margin-top: 8px;">
              <span style="font-size: 11px; background: #EFF6FF; color: #3B82F6; padding: 2px 6px; border-radius: 9999px;">${event.distance}</span>
              ${event.eventType ? `<span style="font-size: 11px; background: #ECFDF5; color: #10B981; padding: 2px 6px; border-radius: 9999px;">${event.eventType}</span>` : ""}
            </div>
            <button style="
              width: 100%;
              margin-top: 10px;
              background-color: #3B82F6;
              color: white;
              border: none;
              padding: 5px 0;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            " onclick="document.dispatchEvent(new CustomEvent('leaflet-marker-click', {detail: '${event.id}'}))">
              View Details
            </button>
          </div>
        `;

          marker.bindPopup(popupContent);

          // Add marker to collection and extend bounds
          newMarkers.push(marker);
          bounds.extend(coords as [number, number]);
        }

        // Fit map to bounds if we have markers
        if (newMarkers.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        setMarkers(newMarkers);
      };

      createMarkers();

      // Add event listener for marker clicks
      const handleMarkerClick = (e: any) => {
        onEventClick(e.detail);
      };

      document.addEventListener("leaflet-marker-click", handleMarkerClick);

      return () => {
        document.removeEventListener("leaflet-marker-click", handleMarkerClick);
      };
    } catch (error) {
      console.error("Error adding markers to map:", error);
    }
  }, [events, map, onEventClick]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {!mapLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full flex-1"
        style={{ minHeight: "500px", display: mapLoaded ? "block" : "none" }}
      ></div>
    </div>
  );
};

export default LeafletMap;
