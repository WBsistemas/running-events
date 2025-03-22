import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

// Função de utilidade para formatar datas
function formatDateToBrazilian(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

// Serviço para gerenciar eventos
export const EventService = {
  // Obter todos os eventos
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    // Formatar datas para o padrão brasileiro
    const formattedEvents = data?.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    })) || [];

    return formattedEvents;
  },

  // Obter eventos filtrados
  async getFilteredEvents(filters: any): Promise<Event[]> {
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

    // Formatar datas para o padrão brasileiro
    const formattedEvents = data?.map(event => ({
      ...event,
      date: formatDateToBrazilian(event.date)
    })) || [];

    return formattedEvents;
  },

  // Obter um evento por ID
  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    // Formatar data para o padrão brasileiro
    if (data) {
      return {
        ...data,
        date: formatDateToBrazilian(data.date)
      };
    }

    return data;
  },

  // Criar um novo evento
  async createEvent(
    eventData: Omit<Event, "id" | "created_at" | "updated_at">,
  ): Promise<Event> {

    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Atualizar um evento existente
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {

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
    return data;
  },

  // Excluir um evento
  async deleteEvent(id: string): Promise<void> {
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
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
