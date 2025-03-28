import { Database } from "./supabase";

// Tipos de eventos
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

// Tipos de usuários
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

// Filtros para eventos
export type EventFilters = {
  keyword?: string;
  eventTypes?: string[];
  location?: string;
}; 