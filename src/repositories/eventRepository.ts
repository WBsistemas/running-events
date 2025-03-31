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

      if (error) throw error;

      return data;
  },

  async create(eventData: EventInsert): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select();

    if (error) throw error;
    
    return data[0];
  },

  async update(id: string, eventData: EventUpdate): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select();

    if (error) throw error;
    
    return data[0];
  },

  async delete(id: string): Promise<boolean> {
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