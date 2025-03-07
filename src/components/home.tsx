import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Header from "./layout/Header";
import SearchBar from "./search/SearchBar";
import FilterDialog, { FilterOptions } from "./search/FilterDialog";
import EventList from "./events/EventList";
import EventDetailsDialog from "./events/EventDetailsDialog";
import AddEventDialog from "./events/AddEventDialog";
import EditEventDialog from "./events/EditEventDialog";
import BottomNavigation from "./layout/BottomNavigation";
import FloatingActionButton from "./layout/FloatingActionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
}

const Home = () => {
  const { toast } = useToast();

  // State for dialogs
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [eventDetailsDialogOpen, setEventDetailsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    dateRange: undefined,
    distances: [],
    eventTypes: [],
    locationRadius: 25,
    location: "",
    keyword: "",
  });
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Initialize events from localStorage or use default events
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem("runningEvents");
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      // Ensure each event has a unique ID
      return parsedEvents.map((event: Event, index: number) => ({
        ...event,
        id: event.id || String(index + 1),
      }));
    }
    return [
      {
        id: "1",
        title: "City Marathon 2023",
        date: "June 15, 2023",
        time: "7:00 AM",
        location: "Central Park, New York",
        distance: "42.2 km",
        participants: 5000,
        description:
          "Join us for the annual City Marathon! This scenic route takes you through the heart of the city with spectacular views and cheering crowds. Suitable for experienced runners looking for a challenge.",
        organizer: "City Running Club",
        imageUrl:
          "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$75.00",
        eventType: "Official Race",
      },
      {
        id: "2",
        title: "Sunset Beach Run",
        date: "July 8, 2023",
        time: "6:30 PM",
        location: "Miami Beach, Florida",
        distance: "10K",
        participants: 1200,
        description:
          "Experience the beauty of Miami Beach at sunset with this scenic 10K run along the coastline. Perfect for runners of all levels looking to enjoy beautiful views while getting a great workout.",
        organizer: "Beach Runners Association",
        imageUrl:
          "https://images.unsplash.com/photo-1502904550040-7534597429ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
        registrationUrl: "https://example.com/register",
        price: "$45.00",
        eventType: "Training Run",
      },
      {
        id: "3",
        title: "Mountain Trail Challenge",
        date: "August 20, 2023",
        time: "8:00 AM",
        location: "Rocky Mountains, Colorado",
        distance: "Half Marathon",
        participants: 800,
        description:
          "Challenge yourself with this half-marathon trail run through the beautiful Rocky Mountains. Experience breathtaking views and challenging terrain in one of America's most beautiful natural settings.",
        organizer: "Trail Runners Club",
        imageUrl:
          "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$60.00",
        eventType: "Trail Run",
      },
      {
        id: "4",
        title: "Charity Fun Run",
        date: "September 5, 2023",
        time: "9:00 AM",
        location: "Golden Gate Park, San Francisco",
        distance: "5K",
        participants: 2500,
        description:
          "Join us for a fun 5K run to raise funds for local charities. This family-friendly event welcomes runners of all ages and abilities. Walk, jog, or run - it's all for a good cause!",
        organizer: "SF Community Foundation",
        imageUrl:
          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$25.00",
        eventType: "Charity Event",
      },
      {
        id: "5",
        title: "Winter Wonderland Run",
        date: "December 12, 2023",
        time: "10:00 AM",
        location: "Central Park, New York",
        distance: "15K",
        participants: 1500,
        description:
          "Experience the magic of winter with this scenic run through Central Park. Enjoy the crisp winter air and beautiful snow-covered landscapes as you challenge yourself on this 15K course.",
        organizer: "NYC Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1544899489-a083461b088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$50.00",
        eventType: "Official Race",
      },
      {
        id: "6",
        title: "Spring Half Marathon",
        date: "April 10, 2024",
        time: "7:30 AM",
        location: "Washington DC",
        distance: "Half Marathon",
        participants: 3000,
        description:
          "Welcome spring with this half-marathon through the beautiful streets of Washington DC. Run past iconic monuments and cherry blossoms in full bloom on this scenic course.",
        organizer: "DC Running Club",
        imageUrl:
          "https://images.unsplash.com/photo-1517931524326-bdd55a541177?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$65.00",
        eventType: "Official Race",
      },
      {
        id: "7",
        title: "Virtual Summer Challenge",
        date: "July 1-31, 2023",
        time: "Any time",
        location: "Anywhere",
        distance: "Your choice",
        participants: 5000,
        description:
          "Join our virtual summer challenge! Run or walk at your own pace, on your own schedule, anywhere in the world. Track your progress and compete with others virtually.",
        organizer: "Global Running Community",
        imageUrl:
          "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "$35.00",
        eventType: "Virtual Run",
      },
    ];
  });

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("runningEvents", JSON.stringify(events));
  }, [events]);

  // Apply filters to events
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

    // Apply keyword filter
    if (activeFilters.keyword) {
      const keyword = activeFilters.keyword.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(keyword) ||
          event.location.toLowerCase().includes(keyword) ||
          event.description.toLowerCase().includes(keyword) ||
          (event.eventType && event.eventType.toLowerCase().includes(keyword)),
      );
    }

    // Apply location filter
    if (
      activeFilters.location &&
      activeFilters.location !== "Current Location"
    ) {
      const location = activeFilters.location.toLowerCase();
      result = result.filter((event) =>
        event.location.toLowerCase().includes(location),
      );
    }

    // Apply distance filter
    if (activeFilters.distances.length > 0) {
      result = result.filter((event) =>
        activeFilters.distances.some(
          (distance) =>
            event.distance.includes(distance) ||
            (distance === "Marathon" && event.distance.includes("42")) ||
            (distance === "Half Marathon" && event.distance.includes("21")),
        ),
      );
    }

    // Apply event type filter
    if (activeFilters.eventTypes.length > 0) {
      result = result.filter(
        (event) =>
          event.eventType && activeFilters.eventTypes.includes(event.eventType),
      );
    }

    // Apply date range filter (simplified for demo)
    if (activeFilters.dateRange?.from) {
      // In a real app, you would parse the date strings and compare them properly
      // This is just a simplified example
      const fromMonth = activeFilters.dateRange.from.getMonth();
      result = result.filter((event) => {
        // Simple check if the event month contains the filter month name
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return event.date.includes(monthNames[fromMonth]);
      });
    }

    setFilteredEvents(result);
  }, [searchTerm, activeFilters, events]);

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDetailsDialogOpen(true);
  };

  const handleAddEventClick = () => {
    setAddEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Remove the event from the events array
    // First log the event being deleted to debug
    console.log("Deleting event with ID:", eventId);
    console.log(
      "Current events:",
      events.map((e) => ({ id: e.id, title: e.title })),
    );

    // Close the details dialog
    setEventDetailsDialogOpen(false);

    // Remove the event from the events array
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter((event) => event.id !== eventId);
      console.log(
        "Updated events:",
        updatedEvents.map((e) => ({ id: e.id, title: e.title })),
      );
      return updatedEvents;
    });

    // Clear the selected event ID
    setSelectedEventId(null);

    // Show success toast notification
    toast({
      title: "Event Deleted",
      description: "The event has been successfully deleted.",
      variant: "destructive",
    });
  };

  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

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

    // Import the geocoding service
    const { geocodeAddress } = await import("@/services/geocoding");

    // If location changed, geocode the new location
    let coordinates = null;
    if (data.location !== eventToEdit.location) {
      coordinates = await geocodeAddress(data.location);
    }

    // Create updated event object
    const updatedEvent: Event = {
      ...eventToEdit,
      title: data.title,
      date: new Date(data.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: data.time,
      location: data.location,
      distance: data.distance,
      participants: parseInt(data.capacity) || 0,
      description: data.description,
      imageUrl: data.imageUrl || eventToEdit.imageUrl,
      price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free",
      // Update coordinates if we have new ones
      ...(coordinates && {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }),
    };

    // Update the event in the events array
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event,
      ),
    );

    // Show success toast notification
    toast({
      title: "Event Updated Successfully",
      description: `${data.title} has been updated.`,
      variant: "success",
    });
  };

  const handleAddEventSubmit = async (data: any) => {
    // Create a new event object with the form data
    // Generate a unique ID using timestamp + random number
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Import the geocoding service
    const { geocodeAddress } = await import("@/services/geocoding");

    // Geocode the location to get coordinates
    const coordinates = await geocodeAddress(data.location);

    const newEvent: Event = {
      id: uniqueId,
      // Add coordinates if geocoding was successful
      ...(coordinates && {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }),

      title: data.title,
      date: new Date(data.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: data.time,
      location: data.location,
      distance: data.distance,
      participants: parseInt(data.capacity) || 0,
      description: data.description,
      organizer: "Your Organization", // Default value
      imageUrl:
        data.imageUrl ||
        "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      registrationUrl: "https://example.com/register",
      price: data.price ? `${parseFloat(data.price).toFixed(2)}` : "Free", // Format price or set as Free
      eventType: "Official Race", // Default value
    };

    // Add the new event to the events array with animation
    setEvents((prevEvents) => [newEvent, ...prevEvents]);

    // Show success toast notification
    toast({
      title: "Event Added Successfully",
      description: `${data.title} has been added to the events list.`,
      variant: "success",
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      dateRange: undefined,
      distances: [],
      eventTypes: [],
      locationRadius: 25,
      location: "",
      keyword: "",
    });
    setSearchTerm("");
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "search":
        setSearchTerm("");
        break;
      case "location":
        setActiveFilters((prev) => ({ ...prev, location: "" }));
        break;
      case "dateRange":
        setActiveFilters((prev) => ({ ...prev, dateRange: undefined }));
        break;
      case "distance":
        if (value) {
          setActiveFilters((prev) => ({
            ...prev,
            distances: prev.distances.filter((d) => d !== value),
          }));
        }
        break;
      case "eventType":
        if (value) {
          setActiveFilters((prev) => ({
            ...prev,
            eventTypes: prev.eventTypes.filter((t) => t !== value),
          }));
        }
        break;
      case "keyword":
        setActiveFilters((prev) => ({ ...prev, keyword: "" }));
        break;
    }
  };

  // Find selected event
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    activeFilters.location ||
    activeFilters.dateRange ||
    activeFilters.distances.length > 0 ||
    activeFilters.eventTypes.length > 0 ||
    activeFilters.keyword;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 pb-20">
        {/* Search Bar */}
        <div className="w-full max-w-7xl mt-4">
          <SearchBar
            onSearch={handleSearch}
            onFilterClick={handleFilterClick}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="w-full max-w-7xl mt-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>

              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Search: "{searchTerm}"</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("search")}
                  />
                </Badge>
              )}

              {activeFilters.location && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Location: {activeFilters.location}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("location")}
                  />
                </Badge>
              )}

              {activeFilters.dateRange?.from && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>
                    Date:{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(activeFilters.dateRange.from)}
                    {activeFilters.dateRange.to &&
                      ` - ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(activeFilters.dateRange.to)}`}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("dateRange")}
                  />
                </Badge>
              )}

              {activeFilters.distances.map((distance) => (
                <Badge
                  key={distance}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Distance: {distance}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("distance", distance)}
                  />
                </Badge>
              ))}

              {activeFilters.eventTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Type: {type}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("eventType", type)}
                  />
                </Badge>
              ))}

              {activeFilters.keyword && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Keyword: "{activeFilters.keyword}"</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("keyword")}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="w-full max-w-7xl mt-4 px-2">
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"}
            {hasActiveFilters ? " with applied filters" : ""}
          </p>
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
                No events found matching your criteria
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="text-blue-600 border-blue-600"
              >
                Clear Filters
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

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Toast notifications */}
      <Toaster />

      {/* Dialogs */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilters={handleApplyFilters}
      />

      {selectedEvent && (
        <EventDetailsDialog
          open={eventDetailsDialogOpen}
          onOpenChange={setEventDetailsDialogOpen}
          event={selectedEvent}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
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
