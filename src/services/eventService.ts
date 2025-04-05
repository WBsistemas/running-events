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

    try {
      // Verificar se o evento existe antes de tentar atualizar
      const existingEvent = await EventRepository.getById(id);
      if (!existingEvent) {
        throw new Error(`Event with ID ${id} not found`);
      }

      const updatedEventData = {
        ...eventData,
        updated_at: new Date().toISOString(),
      };

      console.log("Updating event with data:", updatedEventData);
      
      const event = await EventRepository.update(id, updatedEventData);

      if (!event) {
        throw new Error("Failed to update event - no data returned");
      }

      return event;
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Failed to update event - unexpected error");
      }
    }
  },

  async deleteEvent(id: string): Promise<void> {
    if (!id) {
      console.error("ID do evento não fornecido para exclusão");
      throw new Error("Event ID is required");
    }

    try {
      console.log(`Serviço: Iniciando exclusão do evento ${id}`);
      
      // Verificar se o evento existe antes de tentar excluí-lo
      const existingEvent = await this.getEventById(id);
      if (!existingEvent) {
        console.error(`Serviço: Evento com ID ${id} não encontrado para exclusão`);
        throw new Error(`Event with ID ${id} not found`);
      }
      
      const success = await EventRepository.delete(id);
      if (success) {
        console.log(`Serviço: Evento ${id} excluído com sucesso`);
      } else {
        console.error(`Serviço: Falha não especificada ao excluir evento ${id}`);
        throw new Error(`Failed to delete event with ID ${id}`);
      }
    } catch (error) {
      console.error("Serviço: Erro ao excluir evento:", error);
      throw error;
    }
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const events = await EventRepository.getUserEvents(userId);

    return events.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  }
}; 