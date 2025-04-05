import { supabase } from "@/lib/supabaseClient";
import { Event, EventInsert, EventUpdate } from "@/types/entities";

export const EventRepository = {

  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async getById(id: string): Promise<Event | null> {
    if (!id) return null;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // Código PGRST116 significa "não encontrado" quando usamos .single()
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  },

  async create(eventData: EventInsert): Promise<Event> {
    try {
      console.log("Creating event with data:", JSON.stringify(eventData, null, 2));
      
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User not authenticated during create operation");
        throw new Error("User not authenticated. Please log in to create events.");
      }

      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select();

      if (error) {
        console.error("Supabase error during insert:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned from insert operation");
        throw new Error("No data returned from insert operation. This may be due to Row Level Security policies.");
      }
      
      console.log("Successfully created event:", data[0]);
      return data[0];
    } catch (error) {
      console.error("Error in create repository method:", error);
      throw error;
    }
  },

  async update(id: string, eventData: EventUpdate): Promise<Event> {
    try {
      console.log(`Updating event with ID: ${id}`);
      console.log("Event data:", JSON.stringify(eventData, null, 2));
      
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase error during update:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned from update operation");
        throw new Error("No data returned from update operation");
      }
      
      console.log("Successfully updated event:", data[0]);
      return data[0];
    } catch (error) {
      console.error("Error in update repository method:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Tentando excluir evento com ID: ${id}`);
      
      // Verificar se o evento existe antes de tentar excluí-lo
      const existingEvent = await this.getById(id);
      if (!existingEvent) {
        console.error(`Evento com ID ${id} não encontrado para exclusão`);
        throw new Error(`Event with ID ${id} not found`);
      }
      
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro do Supabase durante exclusão:", error);
        console.error("Detalhes do erro:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`Evento com ID ${id} excluído com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro no método de exclusão:", error);
      throw error;
    }
  },
  
  async getFiltered(keyword?: string, eventTypes?: string[], location?: string): Promise<Event[]> {
    let query = supabase.from("events").select("*");

    // Aplicar filtros
    if (keyword) {
      query = query.or(
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%,location.ilike.%${keyword}%`,
      );
    }

    if (eventTypes && eventTypes.length > 0) {
      query = query.in("event_type", eventTypes);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    // Ordenar por data
    query = query.order("date", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;

    return data || [];
  }
}; 