import { EventRepository } from "@/repositories/eventRepository";
import { Event, EventInsert, EventUpdate, EventFilters } from "@/types/entities";
import { parseISO, format } from 'date-fns';

const formatDateToBrazilian = (dateString: string | null): string => {
  if (!dateString) return '';

  try {
    const date = parseISO(dateString); // Garante que a data seja interpretada corretamente
    return format(date, 'dd/MM/yyyy'); // Converte para o formato brasileiro
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

export const EventService = {

  async getAllEvents(): Promise<Event[]> {
    const events = await EventRepository.getAll();

    return events.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  async getFilteredEvents(filters: EventFilters): Promise<Event[]> {
    if (!filters) return this.getAllEvents();

    const events = await EventRepository.getFiltered(
      filters.keyword,
      filters.eventTypes,
      filters.location
    );

    return events.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  async getEventById(id: string): Promise<Event | null> {
    if (!id) return null;

    const event = await EventRepository.getById(id);

    if (!event) return null;

    return {
      ...event,
      date: formatDateToBrazilian(event.date)
    };
  },

  async createEvent(eventData: EventInsert): Promise<void> {
    if (!eventData) {
      throw new Error("Event data is required");
    }

    const event = await EventRepository.create(eventData);

    if (!event) {
      throw new Error("Failed to create event");
    }
  },

  async updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    if (!eventData) {
      throw new Error("Event data is required");
    }

    const updatedEventData = {
      ...eventData,
      updated_at: new Date().toISOString(),
    };

    const event = await EventRepository.update(id, updatedEventData);

    if (!event) {
      throw new Error("Failed to create event");
    }

    return event;
  },

  async deleteEvent(id: string): Promise<void> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    await EventRepository.delete(id);
  }
}; 