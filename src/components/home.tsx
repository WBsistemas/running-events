import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Header from "./layout/Header";
import SearchBar from "./search/SearchBar";
import { FilterOptions } from "./search/FilterDialog";
import InlineFilters from "./search/InlineFilters";
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
  const navigate = useNavigate();

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
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
        title: "Maratona de São Paulo",
        date: "March 20, 2025",
        time: "7:00 AM",
        location: "Parque Ibirapuera, São Paulo",
        distance: "42.2 km",
        participants: 5000,
        description:
          "Participe da tradicional Maratona de São Paulo! Percorra as principais avenidas da cidade com uma vista espetacular e multidões animadas. Ideal para corredores experientes em busca de um desafio.",
        organizer: "São Paulo Running Club",
        imageUrl:
          "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$250,00",
        eventType: "Official Race",
        latitude: -23.5874,
        longitude: -46.6576,
      },
      {
        id: "2",
        title: "Meia Maratona do Rio",
        date: "March 23, 2025",
        time: "6:30 AM",
        location: "Praia de Copacabana, Rio de Janeiro",
        distance: "21K",
        participants: 3500,
        description:
          "Corra pela orla mais famosa do Brasil! A Meia Maratona do Rio oferece um percurso plano e rápido com vistas deslumbrantes do mar e das montanhas do Rio de Janeiro.",
        organizer: "Rio Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1502904550040-7534597429ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$180,00",
        eventType: "Official Race",
        latitude: -22.9699,
        longitude: -43.1823,
      },
      {
        id: "3",
        title: "Trail Run Serra da Mantiqueira",
        date: "March 25, 2025",
        time: "8:00 AM",
        location: "Campos do Jordão, São Paulo",
        distance: "15K",
        participants: 800,
        description:
          "Desafie-se neste trail run pela Serra da Mantiqueira. Experimente vistas de tirar o fôlego e terrenos desafiadores em uma das regiões mais bonitas do Brasil.",
        organizer: "Trail Runners Brasil",
        imageUrl:
          "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$150,00",
        eventType: "Trail Run",
        latitude: -22.7369,
        longitude: -45.5889,
      },
      {
        id: "4",
        title: "Corrida Beneficente de Salvador",
        date: "March 27, 2025",
        time: "9:00 AM",
        location: "Farol da Barra, Salvador",
        distance: "5K",
        participants: 2500,
        description:
          "Junte-se a nós para uma corrida de 5K para arrecadar fundos para instituições de caridade locais. Este evento familiar recebe corredores de todas as idades e habilidades. Caminhe, trote ou corra - tudo por uma boa causa!",
        organizer: "Fundação Comunitária de Salvador",
        imageUrl:
          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$80,00",
        eventType: "Charity Event",
        latitude: -13.0089,
        longitude: -38.5321,
      },
      {
        id: "5",
        title: "Corrida das Cataratas",
        date: "March 29, 2025",
        time: "7:30 AM",
        location: "Parque Nacional do Iguaçu, Foz do Iguaçu",
        distance: "10K",
        participants: 1200,
        description:
          "Corra em um dos cenários mais impressionantes do Brasil! A Corrida das Cataratas oferece um percurso único com vista para as majestosas Cataratas do Iguaçu.",
        organizer: "Iguaçu Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1544899489-a083461b088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$120,00",
        eventType: "Official Race",
        latitude: -25.6953,
        longitude: -54.4367,
      },
      {
        id: "6",
        title: "Meia Maratona de Brasília",
        date: "March 30, 2025",
        time: "7:00 AM",
        location: "Eixo Monumental, Brasília",
        distance: "Half Marathon",
        participants: 3000,
        description:
          "Corra pela capital do Brasil nesta meia maratona que passa pelos principais monumentos e atrações de Brasília. Um percurso plano e rápido em uma cidade planejada.",
        organizer: "Brasília Running Club",
        imageUrl:
          "https://images.unsplash.com/photo-1517931524326-bdd55a541177?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$170,00",
        eventType: "Official Race",
        latitude: -15.7942,
        longitude: -47.8822,
      },
      {
        id: "7",
        title: "Corrida Noturna de Fortaleza",
        date: "April 2, 2025",
        time: "19:00 PM",
        location: "Beira Mar, Fortaleza, Ceará",
        distance: "10K",
        participants: 2000,
        description:
          "Experimente a emoção de correr à noite pela beira-mar de Fortaleza. Um percurso iluminado com vista para o oceano e temperatura agradável.",
        organizer: "Fortaleza Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1470010762743-1fa2363f65ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$100,00",
        eventType: "Official Race",
        latitude: -3.7319,
        longitude: -38.5267,
      },
      {
        id: "8",
        title: "Corrida das Praias de Recife",
        date: "April 5, 2025",
        time: "6:00 AM",
        location: "Praia de Boa Viagem, Recife, Pernambuco",
        distance: "8K",
        participants: 1800,
        description:
          "Corra pelas belas praias de Recife neste evento que celebra a cultura pernambucana. Percurso plano e rápido com vista para o mar.",
        organizer: "Recife Running Association",
        imageUrl:
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$90,00",
        eventType: "Official Race",
        latitude: -8.1208,
        longitude: -34.9009,
      },
      {
        id: "9",
        title: "Trail Run Chapada dos Veadeiros",
        date: "April 8, 2025",
        time: "7:00 AM",
        location: "Alto Paraíso de Goiás, Goiás",
        distance: "21K",
        participants: 600,
        description:
          "Um desafio único pelos caminhos da Chapada dos Veadeiros. Trilhas técnicas, cachoeiras e paisagens de tirar o fôlego em um dos mais belos parques nacionais do Brasil.",
        organizer: "Cerrado Trail Team",
        imageUrl:
          "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=2001&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$180,00",
        eventType: "Trail Run",
        latitude: -14.1347,
        longitude: -47.519,
      },
      {
        id: "10",
        title: "Maratona de Belo Horizonte",
        date: "April 12, 2025",
        time: "6:30 AM",
        location: "Praça da Liberdade, Belo Horizonte, Minas Gerais",
        distance: "42.2 km",
        participants: 3000,
        description:
          "Desafie-se na maratona da cidade das montanhas. Um percurso desafiador com subidas e descidas pelas ruas históricas de Belo Horizonte.",
        organizer: "BH Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$220,00",
        eventType: "Official Race",
        latitude: -19.9333,
        longitude: -43.938,
      },
      {
        id: "11",
        title: "Corrida das Dunas",
        date: "April 15, 2025",
        time: "6:00 AM",
        location: "Praia de Jericoacoara, Ceará",
        distance: "8K",
        participants: 600,
        description:
          "Uma experiência única de corrida pelas famosas dunas de Jericoacoara. Desafie-se neste terreno diferente com vistas deslumbrantes do mar e do pôr do sol.",
        organizer: "Ceará Trail Team",
        imageUrl:
          "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&auto=format&fit=crop&w=2001&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$130,00",
        eventType: "Trail Run",
        latitude: -2.7975,
        longitude: -40.5137,
      },
      {
        id: "12",
        title: "Corrida do Pantanal",
        date: "April 18, 2025",
        time: "7:00 AM",
        location: "Corumbá, Mato Grosso do Sul",
        distance: "12K",
        participants: 500,
        description:
          "Uma corrida pela região do Pantanal, oferecendo aos participantes a chance de experimentar a beleza natural desta importante região ecológica do Brasil.",
        organizer: "Pantanal Running Association",
        imageUrl:
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2274&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$140,00",
        eventType: "Trail Run",
        latitude: -19.0077,
        longitude: -57.6509,
      },
      {
        id: "13",
        title: "Meia Maratona de Porto Alegre",
        date: "April 20, 2025",
        time: "7:30 AM",
        location: "Parque Marinha do Brasil, Porto Alegre, Rio Grande do Sul",
        distance: "21K",
        participants: 2500,
        description:
          "Corra pela capital gaúcha nesta meia maratona que passa pelos principais pontos turísticos da cidade. Um percurso plano às margens do Guaíba.",
        organizer: "Porto Alegre Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$160,00",
        eventType: "Official Race",
        latitude: -30.0368,
        longitude: -51.209,
      },
      {
        id: "14",
        title: "Corrida da Independência",
        date: "April 22, 2025",
        time: "8:00 AM",
        location: "Monumento da Independência, São Paulo",
        distance: "10K",
        participants: 3000,
        description:
          "Celebre a história do Brasil nesta corrida que passa por pontos históricos da cidade de São Paulo. Um percurso cultural e desafiador.",
        organizer: "São Paulo Historical Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1513267048331-5611cad62e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$100,00",
        eventType: "Official Race",
        latitude: -23.5846,
        longitude: -46.6076,
      },
      {
        id: "15",
        title: "Maratona da Amazônia",
        date: "April 25, 2025",
        time: "5:30 AM",
        location: "Manaus, Amazonas",
        distance: "42.2 km",
        participants: 1000,
        description:
          "Uma maratona única pela maior floresta tropical do mundo. Corra em um percurso que combina trechos urbanos de Manaus com áreas próximas à floresta amazônica.",
        organizer: "Amazon Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$280,00",
        eventType: "Official Race",
        latitude: -3.119,
        longitude: -60.0217,
      },
      {
        id: "16",
        title: "Corrida das Praias de Florianópolis",
        date: "April 27, 2025",
        time: "7:00 AM",
        location: "Praia de Jurerê, Florianópolis, Santa Catarina",
        distance: "15K",
        participants: 1500,
        description:
          "Corra pelas belas praias de Florianópolis neste evento que celebra a beleza natural da Ilha da Magia. Percurso à beira-mar com paisagens deslumbrantes.",
        organizer: "Floripa Beach Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$120,00",
        eventType: "Official Race",
        latitude: -27.4391,
        longitude: -48.49,
      },
      {
        id: "17",
        title: "Corrida Noturna de Curitiba",
        date: "April 30, 2025",
        time: "19:30 PM",
        location: "Parque Barigui, Curitiba, Paraná",
        distance: "5K e 10K",
        participants: 2000,
        description:
          "Experimente a emoção de correr à noite pelo famoso Parque Barigui em Curitiba. Um percurso iluminado em um dos parques mais bonitos da cidade.",
        organizer: "Curitiba Night Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1470010762743-1fa2363f65ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$90,00",
        eventType: "Official Race",
        latitude: -25.4284,
        longitude: -49.3044,
      },
      {
        id: "18",
        title: "Meia Maratona de Natal",
        date: "May 3, 2025",
        time: "6:00 AM",
        location: "Praia de Ponta Negra, Natal, Rio Grande do Norte",
        distance: "21K",
        participants: 1800,
        description:
          "Corra pela cidade do sol nesta meia maratona que passa pelas belas praias de Natal. Um percurso plano com vista para o mar e as dunas.",
        organizer: "Natal Runners",
        imageUrl:
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$150,00",
        eventType: "Official Race",
        latitude: -5.8813,
        longitude: -35.1986,
      },
      {
        id: "19",
        title: "Corrida Beneficente de Belém",
        date: "May 5, 2025",
        time: "7:00 AM",
        location: "Parque Mangal das Garças, Belém, Pará",
        distance: "5K",
        participants: 1500,
        description:
          "Junte-se a nós para uma corrida de 5K para arrecadar fundos para instituições de caridade locais. Este evento familiar recebe corredores de todas as idades e habilidades.",
        organizer: "Fundação Comunitária de Belém",
        imageUrl:
          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$70,00",
        eventType: "Charity Event",
        latitude: -1.4558,
        longitude: -48.5039,
      },
      {
        id: "20",
        title: "Corrida de Natal Solidária",
        date: "May 8, 2025",
        time: "8:00 AM",
        location: "Parque Barigui, Curitiba, Paraná",
        distance: "5K e 10K",
        participants: 3000,
        description:
          "Celebre o espírito natalino nesta corrida beneficente em Curitiba. Cada inscrição contribui com brinquedos e alimentos para famílias carentes. Vista-se de Papai Noel ou duende para entrar no clima!",
        organizer: "Curitiba Solidária",
        imageUrl:
          "https://images.unsplash.com/photo-1513267048331-5611cad62e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: "R$90,00",
        eventType: "Charity Event",
        latitude: -25.4284,
        longitude: -49.3044,
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
      result = result.filter((event) => {
        // Handle comma-separated distances
        const eventDistances = event.distance.split(",").map((d) => d.trim());

        return activeFilters.distances.some((distance) =>
          eventDistances.some(
            (eventDist) =>
              eventDist.includes(distance) ||
              (distance === "Marathon" && eventDist.includes("42")) ||
              (distance === "Half Marathon" && eventDist.includes("21")),
          ),
        );
      });
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
    setShowFilters(!showFilters);
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
      title: "Evento Excluído",
      description: "O evento foi excluído com sucesso.",
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
      distance: data.distance || "5K", // Default to 5K if no distance selected
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
      title: "Evento Atualizado com Sucesso",
      description: `${data.title} foi atualizado.`,
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
      distance: data.distance || "5K", // Default to 5K if no distance selected
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
      title: "Evento Adicionado com Sucesso",
      description: `${data.title} foi adicionado à lista de eventos.`,
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

        {/* Inline Filters */}
        {showFilters && (
          <div className="w-full max-w-7xl">
            <InlineFilters
              onApplyFilters={handleApplyFilters}
              onClose={() => setShowFilters(false)}
              initialFilters={activeFilters}
            />
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="w-full max-w-7xl mt-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Filtros Ativos:
              </span>

              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <span>Busca: "{searchTerm}"</span>
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
                  <span>Localização: {activeFilters.location}</span>
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
                    Data:{" "}
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
                  <span>Distância: {distance}</span>
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
                  <span>Tipo: {type}</span>
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
                  <span>Palavra-chave: "{activeFilters.keyword}"</span>
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
                Limpar Todos
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="w-full max-w-7xl mt-4 px-2">
          <p className="text-sm text-gray-600">
            Mostrando {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "evento" : "eventos"}
            {hasActiveFilters ? " com filtros aplicados" : ""}
          </p>
        </div>

        {/* Event List */}
        <div className="w-full max-w-7xl mt-2 flex-1">
          {filteredEvents.length > 0 ? (
            <EventList
              events={filteredEvents}
              onEventClick={handleEventClick}
              onMapViewClick={(eventId) => {
                // Navigate to map view with the selected event
                navigate(`/map?event=${eventId}`);
              }}
              onFavoriteClick={(eventId) => {
                // Add to favorites (could be implemented with localStorage)
                toast({
                  title: "Evento adicionado aos favoritos",
                  description:
                    "Você pode acessar seus favoritos no seu perfil.",
                  variant: "success",
                });
              }}
              onShareClick={(eventId, platform) => {
                // Share event (in a real app, this would open share dialogs)
                const event = events.find((e) => e.id === eventId);
                if (!event) return;

                const shareText = `Confira este evento de corrida: ${event.title} em ${event.location} no dia ${event.date}`;

                // In a real app, you'd use the Web Share API or platform-specific sharing
                toast({
                  title: "Compartilhar evento",
                  description: `Compartilhando "${event.title}" no ${platform || "WhatsApp"}.`,
                  variant: "success",
                });
              }}
              featuredEvents={events
                .filter(
                  (event) =>
                    // For demo purposes, mark some events as featured
                    event.eventType === "Charity Event" ||
                    event.title.includes("Marathon") ||
                    event.id === "1" ||
                    event.id === "3",
                )
                .slice(0, 3)}
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

      {/* Bottom Navigation removida */}

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
