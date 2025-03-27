import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

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

interface MapLibreMapProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
  "aria-label"?: string;
}

const MapLibreMap = ({
  events = [],
  onEventClick = () => { },
  "aria-label": ariaLabel = "Map showing running events",
}: MapLibreMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initializeMap = async () => {
      try {
        // Dynamically import maplibre-gl
        const maplibregl = await import("maplibre-gl");

        // Create map instance
        const newMap = new maplibregl.Map({
          container: mapRef.current!,
          style: "https://demotiles.maplibre.org/style.json", // Free style URL
          center: [-74.006, 40.7128], // Default to New York
          zoom: 3,
        });

        // Add navigation controls
        newMap.addControl(new maplibregl.NavigationControl());

        // Add scale control
        newMap.addControl(new maplibregl.ScaleControl(), "bottom-left");

        // Set map loaded when ready
        newMap.on("load", () => {
          setMapLoaded(true);
          setMap(newMap);
        });

        return () => {
          newMap.remove();
        };
      } catch (error) {
        console.error("Error initializing MapLibre map:", error);
      }
    };

    initializeMap();
  }, [map]);

  // Helper function to get coordinates for an event
  const getEventCoordinates = async (
    event: Event,
  ): Promise<[number, number]> => {
    // If the event already has coordinates, use them
    if (event.latitude && event.longitude) {
      return [event.longitude, event.latitude]; // MapLibre uses [lng, lat] format
    }

    try {
      // Import the geocoding service
      const { geocodeAddress } = await import("@/services/geocoding");

      // Try to geocode the location
      const coordinates = await geocodeAddress(event.location);

      if (coordinates) {
        return [coordinates.longitude, coordinates.latitude]; // MapLibre uses [lng, lat] format
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }

    // Fallback to approximate coordinates based on city name
    const cityCoordinates: { [key: string]: [number, number] } = {
      "New York": [-74.006, 40.7128],
      Miami: [-80.1918, 25.7617],
      "San Francisco": [-122.4194, 37.7749],
      Colorado: [-105.7821, 39.5501],
      Washington: [-77.0369, 38.9072],
      "Los Angeles": [-118.2437, 34.0522],
      Chicago: [-87.6298, 41.8781],
      Boston: [-71.0589, 42.3601],
      Seattle: [-122.3321, 47.6062],
      Austin: [-97.7431, 30.2672],
    };

    // Find a matching city or default to New York
    let baseCoords: [number, number] = [-74.006, 40.7128]; // Default to New York

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (event.location.includes(city)) {
        baseCoords = coords;
        break;
      }
    }

    // Add small random offset to prevent markers from stacking
    const lng = baseCoords[0] + (Math.random() - 0.5) * 0.1;
    const lat = baseCoords[1] + (Math.random() - 0.5) * 0.1;

    return [lng, lat];
  };

  const handleEventDetailsClick = (eventId: string, popup: any) => {
    onEventClick(eventId);
    popup.remove();
  };

  const handleMarkerClick = (marker: any) => {
    marker.togglePopup();
  };

  // Add markers for events
  useEffect(() => {
    if (!map || !mapLoaded || !events.length) return;

    try {
      // Import maplibre-gl
      const addEventMarkers = async () => {
        const maplibregl = await import("maplibre-gl");

        // Remove existing markers
        markers.forEach((marker) => marker.remove());

        const newMarkers: any[] = [];
        const bounds = new maplibregl.LngLatBounds();

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

          // Create marker element
          const markerElement = document.createElement("div");
          markerElement.className = "custom-marker";
          markerElement.style.width = "30px";
          markerElement.style.height = "30px";
          markerElement.style.borderRadius = "50%";
          markerElement.style.backgroundColor = markerColor;
          markerElement.style.border = "2px solid white";
          markerElement.style.display = "flex";
          markerElement.style.alignItems = "center";
          markerElement.style.justifyContent = "center";
          markerElement.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
          markerElement.style.cursor = "pointer";
          markerElement.setAttribute('role', 'button');
          markerElement.setAttribute('aria-label', `Marker for ${event.title}`);
          markerElement.setAttribute('tabindex', '0');

          // Add pin icon
          markerElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `;

          // Create popup
          const popup = new maplibregl.Popup({
            offset: [0, -30],
            closeButton: false,
            maxWidth: "300px",
          }).setHTML(`
            <div style="width: 250px;">
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
              " id="view-details-${event.id}" aria-label="View details for ${event.title}">
                View Details
              </button>
            </div>
          `);

          // Create marker
          const marker = new maplibregl.Marker(markerElement)
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(map);

          // Add click handler for the marker
          markerElement.addEventListener("click", () => handleMarkerClick(marker));
          markerElement.addEventListener("keydown", (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMarkerClick(marker);
            }
          });

          // Add to markers array
          newMarkers.push(marker);

          // Extend bounds
          bounds.extend(coords);

          // Add event listener for the "View Details" button in popup
          popup.on("open", () => {
            setTimeout(() => {
              const detailsButton = document.getElementById(
                `view-details-${event.id}`,
              );
              if (detailsButton) {
                detailsButton.addEventListener("click", () => {
                  handleEventDetailsClick(event.id, popup);
                });
              }
            }, 0);
          });
        }

        // Fit map to bounds if we have markers
        if (newMarkers.length > 0) {
          map.fitBounds(bounds, { padding: 50 });
        }

        setMarkers(newMarkers);
      };

      addEventMarkers();
    } catch (error) {
      console.error("Error adding markers to map:", error);
    }
  }, [events, map, mapLoaded, onEventClick, markers]);

  return (
    <div 
      className="w-full h-full flex flex-col bg-white" 
      role="region" 
      aria-label={ariaLabel}
    >
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
        style={{ minHeight: "500px" }}
        aria-hidden={!mapLoaded}
      ></div>
    </div>
  );
};

export default MapLibreMap;
