import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { parseISO, format } from 'date-fns';

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
type User = Database["public"]["Tables"]["users"]["Row"];
type EventFilters = {
  keyword?: string;
  eventTypes?: string[];
  location?: string;
};

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

// Serviço para gerenciar eventos
export const EventService = {
  // Obter todos os eventos
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Formatar datas para o padrão brasileiro
    return data.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  // Obter eventos filtrados
  async getFilteredEvents(filters: EventFilters): Promise<Event[]> {
    if (!filters) return this.getAllEvents();

    let query = supabase.from("events").select("*");

    // Aplicar filtros
    if (filters.keyword) {
      query = query.or(
        `title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,location.ilike.%${filters.keyword}%`,
      );
    }

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      query = query.in("event_type", filters.eventTypes);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    // Ordenar por data
    query = query.order("date", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    // Formatar datas para o padrão brasileiro
    return data.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    }));
  },

  // Obter um evento por ID
  async getEventById(id: string): Promise<Event | null> {
    if (!id) return null;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    if (!data) return null;

    // Formatar data para o padrão brasileiro
    return {
      ...data,
      date: formatDateToBrazilian(data.date)
    };
  },

  // Criar um novo evento
  async createEvent(
    eventData: EventInsert,
  ): Promise<Event> {
    if (!eventData) {
      throw new Error("Event data is required");
    }

    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create event");

    return data;
  },

  // Atualizar um evento existente
  async updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    if (!eventData) {
      throw new Error("Event data is required");
    }

    const { data, error } = await supabase
      .from("events")
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to update event");

    return data;
  },

  // Excluir um evento
  async deleteEvent(id: string): Promise<void> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
  }
};

// Serviço para gerenciar usuários
export const UserService = {
  // Obter perfil do usuário atual
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    return data;
  },

  // Atualizar perfil do usuário
  async updateUserProfile(
    userId: string,
    userData: Partial<User>,
  ): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!userData) {
      throw new Error("User data is required");
    }

    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to update user profile");

    return data;
  },
};
