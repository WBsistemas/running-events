import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  EventService,
  UserService
} from '@/services/supabaseService'
import type { Database } from '@/types/supabase'
type Event = Database['public']['Tables']['events']['Row']
type User = Database['public']['Tables']['users']['Row']
// Hook para gerenciar autenticação
export function useAuth () {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const checkUser = async () => {
      try {
        const currentUser = await UserService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }
    // Inscrever-se para atualizações de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = await UserService.getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )
    checkUser()
    // Limpar listener
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }
  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
// Hook para gerenciar eventos
export function useEvents () {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchEvents = async (filters?: any) => {
    setLoading(true)
    try {
      const data = filters
        ? await EventService.getFilteredEvents(filters)
        : await EventService.getAllEvents()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Erro desconhecido ao buscar eventos')
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchEvents()
  }, [])
  const getEventById = async (id: string) => {
    try {
      return await EventService.getEventById(id)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar evento'))
      return null
    }
  }
  const createEvent = async (eventData: any) => {
    try {
      const newEvent = await EventService.createEvent(eventData)
      setEvents((prev) => [newEvent, ...prev])
      return newEvent
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar evento'))
      throw err
    }
  }
  const updateEvent = async (id: string, eventData: any) => {
    try {
      const updatedEvent = await EventService.updateEvent(id, eventData)
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? updatedEvent : event))
      )
      return updatedEvent
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erro ao atualizar evento')
      )
      throw err
    }
  }
  const deleteEvent = async (id: string) => {
    try {
      await EventService.deleteEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erro ao excluir evento')
      )
      throw err
    }
  }
  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
  }
}
