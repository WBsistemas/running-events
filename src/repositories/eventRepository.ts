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
      .select("*, organizers(name, logo_url)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(eventData: EventInsert): Promise<Event> {
    if (!eventData) {
      throw new Error("Event data is required");
    }

    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Failed to create event");
    }
    
    return data[0];
  },

  async update(id: string, eventData: EventUpdate): Promise<Event> {
    if (!id) {
      throw new Error("Event ID is required");
    }
    
    if (!eventData) {
      throw new Error("Event data is required");
    }

    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Failed to update event");
    }
    
    return data[0];
  },

  async delete(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Event ID is required");
    }

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
    return true;
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
  }
}; 