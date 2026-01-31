// Hook pour les événements en temps réel
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    const loadEvents = useCallback(async () => {
        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        creator:created_by(id, username, display_name, avatar_url),
        participants:event_participants(
          user:user_id(id, username, display_name, avatar_url)
        )
      `)
            .eq('is_active', true)
            .order('start_date', { ascending: true })

        if (!error) {
            setEvents(data || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        loadEvents()

        const channel = supabase
            .channel('events')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'events' },
                () => loadEvents()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'event_participants' },
                () => loadEvents()
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [loadEvents])

    const createEvent = useCallback(async (eventData) => {
        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single()

        if (error) {
            console.error('Erreur création event:', error)
            return { error: error.message }
        }

        loadEvents()
        return { data }
    }, [loadEvents])

    const updateEvent = useCallback(async (eventId, updates) => {
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', eventId)

        if (!error) loadEvents()
        return { success: !error }
    }, [loadEvents])

    const deleteEvent = useCallback(async (eventId) => {
        const { error } = await supabase
            .from('events')
            .update({ is_active: false })
            .eq('id', eventId)

        if (!error) loadEvents()
        return { success: !error }
    }, [loadEvents])

    const joinEvent = useCallback(async (eventId, userId) => {
        const { error } = await supabase
            .from('event_participants')
            .insert({ event_id: eventId, user_id: userId })

        if (!error) loadEvents()
        return { success: !error, error: error?.message }
    }, [loadEvents])

    const leaveEvent = useCallback(async (eventId, userId) => {
        const { error } = await supabase
            .from('event_participants')
            .delete()
            .match({ event_id: eventId, user_id: userId })

        if (!error) loadEvents()
        return { success: !error }
    }, [loadEvents])

    return {
        events,
        loading,
        createEvent,
        updateEvent,
        deleteEvent,
        joinEvent,
        leaveEvent,
        refresh: loadEvents
    }
}

export function useEventMessages(eventId, limit = 20) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)

    const loadMessages = useCallback(async () => {
        if (!eventId) return

        const { data, error } = await supabase
            .from('event_messages')
            .select(`
        *,
        user:user_id(id, username, display_name, avatar_url)
      `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!error) {
            setMessages(data?.reverse() || [])
        }
        setLoading(false)
    }, [eventId, limit])

    const sendMessage = useCallback(async (content, userId) => {
        if (!eventId || !content.trim()) return { error: 'Message vide' }

        const { data, error } = await supabase
            .from('event_messages')
            .insert({
                event_id: eventId,
                user_id: userId,
                content: content.trim().substring(0, 500)
            })
            .select(`
        *,
        user:user_id(id, username, display_name, avatar_url)
      `)
            .single()

        if (error) {
            return { error: error.message }
        }

        return { data }
    }, [eventId])

    useEffect(() => {
        if (!eventId) return

        loadMessages()

        const channel = supabase
            .channel(`event_messages:${eventId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'event_messages',
                    filter: `event_id=eq.${eventId}`
                },
                async (payload) => {
                    const { data } = await supabase
                        .from('event_messages')
                        .select(`
              *,
              user:user_id(id, username, display_name, avatar_url)
            `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data) {
                        setMessages(prev => [...prev, data])
                    }
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [eventId, loadMessages])

    return { messages, loading, sendMessage, refresh: loadMessages }
}
