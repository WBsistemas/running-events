import { EventRepository } from "@/repositories/eventRepository";
import { Event, EventInsert, EventUpdate, EventFilters } from "@/types/entities";
import { parseISO, format } from 'date-fns';

/**
 * Formata uma data no formato ISO para o formato brasileiro (DD/MM/YYYY)
 */
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
  // Obter todos os eventos
  async getAllEvents(): Promise<Event[]> {
    const events = await EventRepository.getAll();

    // Formatar datas para o padrão brasileiro
    return events.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  // Obter eventos filtrados
  async getFilteredEvents(filters: EventFilters): Promise<Event[]> {
    if (!filters) return this.getAllEvents();

    const events = await EventRepository.getFiltered(
      filters.keyword,
      filters.eventTypes,
      filters.location
    );

    // Formatar datas para o padrão brasileiro
    return events.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  // Obter um evento por ID
  async getEventById(id: string): Promise<Event | null> {
    if (!id) return null;

    const event = await EventRepository.getById(id);

    if (!event) return null;

    // Formatar data para o padrão brasileiro
    return {
      ...event,
      date: formatDateToBrazilian(event.date)
    };
  },

  // Criar um novo evento
  async createEvent(eventData: EventInsert): Promise<Event> {
    if (!eventData) {
      throw new Error("Event data is required");
    }

    const event = await EventRepository.create(eventData);
    return event;
  },

  // Atualizar um evento existente
  async updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    if (!eventData) {
      throw new Error("Event data is required");
    }

    // Adicionar timestamp de atualização
    const updatedEventData = {
      ...eventData,
      updated_at: new Date().toISOString(),
    };

    const event = await EventRepository.update(id, updatedEventData);
    return event;
  },

  // Excluir um evento
  async deleteEvent(id: string): Promise<void> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    await EventRepository.delete(id);
  }
}; 