import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type Organizer = Database["public"]["Tables"]["organizers"]["Row"];
type Registration = Database["public"]["Tables"]["registrations"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

// Serviço para gerenciar eventos
export const EventService = {
  // Obter todos os eventos
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
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
    return data || [];
  },

  // Obter um evento por ID
  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*, organizers(name, logo_url)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
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
  },
};

// Serviço para gerenciar organizadores
export const OrganizerService = {
  // Obter todos os organizadores
  async getAllOrganizers(): Promise<Organizer[]> {
    const { data, error } = await supabase.from("organizers").select("*");

    if (error) throw error;
    return data || [];
  },

  // Obter um organizador por ID
  async getOrganizerById(id: string): Promise<Organizer | null> {
    const { data, error } = await supabase
      .from("organizers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }
    return data;
  },

  // Criar um novo organizador
  async createOrganizer(
    organizerData: Omit<Organizer, "id" | "created_at">,
  ): Promise<Organizer> {
    const { data, error } = await supabase
      .from("organizers")
      .insert(organizerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Serviço para gerenciar inscrições
export const RegistrationService = {
  // Inscrever um usuário em um evento
  async registerForEvent(
    eventId: string,
    userId: string,
    amount: number,
  ): Promise<Registration> {
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        event_id: eventId,
        user_id: userId,
        amount_paid: amount,
        status: "confirmed",
        payment_status: amount > 0 ? "paid" : "free",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obter inscrições de um usuário
  async getUserRegistrations(
    userId: string,
  ): Promise<(Registration & { event: Event })[]> {
    const { data, error } = await supabase
      .from("registrations")
      .select("*, event:events(*)")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  },

  // Cancelar uma inscrição
  async cancelRegistration(registrationId: string): Promise<void> {
    const { error } = await supabase
      .from("registrations")
      .update({ status: "cancelled" })
      .eq("id", registrationId);

    if (error) throw error;
  },
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
