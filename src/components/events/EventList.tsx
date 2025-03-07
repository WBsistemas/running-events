import React, { useState, useEffect, useMemo } from "react";
import EventCard from "./EventCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutGrid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  imageUrl: string;
}

interface EventListProps {
  events?: Event[];
  onEventClick?: (eventId: string) => void;
}

const EventList = ({
  events = [
    {
      id: "1",
      title: "City Marathon 2023",
      date: "June 15, 2023",
      location: "Central Park, New York",
      distance: "42.2 km",
      imageUrl:
        "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: "2",
      title: "Sunset Beach Run",
      date: "July 8, 2023",
      location: "Miami Beach, Florida",
      distance: "10 km",
      imageUrl:
        "https://images.unsplash.com/photo-1502904550040-7534597429ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
    },
    {
      id: "3",
      title: "Mountain Trail Challenge",
      date: "August 20, 2023",
      location: "Rocky Mountains, Colorado",
      distance: "21 km",
      imageUrl:
        "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: "4",
      title: "Charity Fun Run",
      date: "September 5, 2023",
      location: "Golden Gate Park, San Francisco",
      distance: "5 km",
      imageUrl:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: "5",
      title: "Winter Wonderland Run",
      date: "December 12, 2023",
      location: "Central Park, New York",
      distance: "15 km",
      imageUrl:
        "https://images.unsplash.com/photo-1544899489-a083461b088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
    {
      id: "6",
      title: "Spring Half Marathon",
      date: "April 10, 2024",
      location: "Washington DC",
      distance: "21.1 km",
      imageUrl:
        "https://images.unsplash.com/photo-1517931524326-bdd55a541177?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    },
  ],
  onEventClick = (eventId) => console.log(`Event clicked: ${eventId}`),
}: EventListProps) => {
  // Get view mode from localStorage or default to grid
  const [viewMode, setViewMode] = useState(() => {
    const savedMode = localStorage.getItem("eventViewMode");
    return savedMode === "month" ? "month" : "grid";
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("eventViewMode", viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "grid") return "month";
      if (prev === "month") return "grid";
      return "grid";
    });
  };

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const months = {};

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    sortedEvents.forEach((event) => {
      // Extract month and year from the date
      const dateParts = event.date.split(" ");
      if (dateParts.length >= 2) {
        const month = dateParts[0]; // e.g., "June"
        const year = dateParts[dateParts.length - 1]; // e.g., "2023"
        const monthYear = `${month} ${year}`;

        if (!months[monthYear]) {
          months[monthYear] = [];
        }
        months[monthYear].push(event);
      }
    });

    return months;
  }, [events]);

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "grid":
        return <Calendar className="h-4 w-4" />;
      case "month":
        return <LayoutGrid className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getViewModeText = () => {
    switch (viewMode) {
      case "grid":
        return "Month View";
      case "month":
        return "Grid View";
      default:
        return "Month View";
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={toggleViewMode}
          aria-label={`Switch to ${getViewModeText()}`}
        >
          {getViewModeIcon()}
          <span className="hidden sm:inline">{getViewModeText()}</span>
        </Button>
      </div>

      <ScrollArea className="h-full w-full">
        {viewMode === "grid" && (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex justify-center animate-in fade-in-50 slide-in-from-top-5 duration-500"
              >
                <EventCard
                  id={event.id}
                  title={event.title}
                  date={event.date}
                  location={event.location}
                  distance={event.distance}
                  imageUrl={event.imageUrl}
                  onClick={() => onEventClick(event.id)}
                />
              </div>
            ))}
          </div>
        )}

        {viewMode === "month" && (
          // Month View
          <div className="space-y-8 pb-6">
            {Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
              <div
                key={monthYear}
                className="animate-in fade-in-50 duration-500 bg-blue-50 rounded-lg overflow-hidden mb-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-blue-200 flex items-center gap-2 bg-blue-600 p-3 rounded-t-lg">
                  <Calendar className="h-5 w-5 text-white" />
                  {monthYear}
                </h2>
                <div className="space-y-3">
                  {monthEvents.map((event: Event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                      onClick={() => onEventClick(event.id)}
                    >
                      <div className="flex p-3">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="font-semibold text-blue-800">
                            {event.title}
                          </h3>
                          <div className="mt-1 text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Date:</span>{" "}
                              {event.date.split(" ").slice(0, 2).join(" ")}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Location:</span>{" "}
                              {event.location.split(",")[0]}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Distance:</span>{" "}
                              {event.distance}
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-700 border-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EventList;
