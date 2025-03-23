import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
// Funções auxiliares para interagir com as tabelas
// Eventos
export async function getEvents () {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}
export async function getEventById (id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*, organizers(name, logo_url)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
export async function createEvent (eventData: any) {
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
  if (error) throw error
  return data
}
export async function updateEvent (id: string, eventData: any) {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .select()
  if (error) throw error
  return data
}
export async function deleteEvent (id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
  return true
}
