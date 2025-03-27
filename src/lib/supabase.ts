import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Funções auxiliares para interagir com as tabelas

// Eventos
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from("events")
    .select("*, organizers(name, logo_url)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(eventData: EventInsert): Promise<Event> {
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
}

export async function updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
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
}

export async function deleteEvent(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("Event ID is required");
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
  return true;
}

