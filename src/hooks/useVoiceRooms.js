import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Hook pour gérer les salons vocaux
export function useVoiceRooms(channelId) {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchRooms = useCallback(async () => {
        if (!channelId) return

        setLoading(true)
        const { data, error } = await supabase
            .from('voice_rooms')
            .select(`
        *,
        creator:profiles!created_by(id, username, display_name, avatar_url),
        participants:voice_participants(
          id,
          user_id,
          is_muted,
          is_deafened,
          user:profiles!user_id(id, username, display_name, avatar_url)
        )
      `)
            .eq('channel_id', channelId)
            .eq('is_active', true)
            .order('created_at', { ascending: true })

        if (!error) {
            setRooms(data || [])
        } else {
            console.error('Erreur fetch rooms:', error)
        }
        setLoading(false)
    }, [channelId])

    useEffect(() => {
        fetchRooms()
    }, [fetchRooms])

    // Realtime pour les changements de participants
    useEffect(() => {
        if (!channelId) return

        const subscription = supabase
            .channel(`voice_rooms:${channelId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'voice_participants'
            }, () => {
                fetchRooms()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'voice_rooms',
                filter: `channel_id=eq.${channelId}`
            }, () => {
                fetchRooms()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [channelId, fetchRooms])

    const createRoom = async (name, userId) => {
        const { data, error } = await supabase
            .from('voice_rooms')
            .insert({
                channel_id: channelId,
                created_by: userId,
                name
            })
            .select()
            .single()

        if (!error && data) {
            // Auto-join the room
            await joinRoom(data.id, userId)
        }
        return { data, error }
    }

    const joinRoom = async (roomId, userId) => {
        // Leave any other room first
        await leaveAllRooms(userId)

        const { data, error } = await supabase
            .from('voice_participants')
            .insert({ room_id: roomId, user_id: userId })
            .select()
            .single()

        if (!error) {
            fetchRooms()
        }
        return { data, error }
    }

    const leaveRoom = async (roomId, userId) => {
        const { error } = await supabase
            .from('voice_participants')
            .delete()
            .eq('room_id', roomId)
            .eq('user_id', userId)

        if (!error) {
            fetchRooms()

            // Check if room is empty and close it
            const room = rooms.find(r => r.id === roomId)
            if (room && room.participants?.length <= 1) {
                await supabase
                    .from('voice_rooms')
                    .update({ is_active: false })
                    .eq('id', roomId)
            }
        }
        return { error }
    }

    const leaveAllRooms = async (userId) => {
        await supabase
            .from('voice_participants')
            .delete()
            .eq('user_id', userId)
    }

    const toggleMute = async (roomId, userId, isMuted) => {
        const { error } = await supabase
            .from('voice_participants')
            .update({ is_muted: !isMuted })
            .eq('room_id', roomId)
            .eq('user_id', userId)

        if (!error) {
            fetchRooms()
        }
        return { error }
    }

    return {
        rooms,
        loading,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleMute,
        refetch: fetchRooms
    }
}

// Hook pour savoir si l'utilisateur est dans un salon vocal
export function useCurrentVoiceRoom(userId) {
    const [currentRoom, setCurrentRoom] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchCurrentRoom = async () => {
            const { data, error } = await supabase
                .from('voice_participants')
                .select(`
          *,
          room:voice_rooms(*)
        `)
                .eq('user_id', userId)
                .maybeSingle()

            if (!error && data) {
                setCurrentRoom(data.room)
            } else {
                setCurrentRoom(null)
            }
            setLoading(false)
        }

        fetchCurrentRoom()

        // Realtime
        const subscription = supabase
            .channel(`user_voice:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'voice_participants',
                filter: `user_id=eq.${userId}`
            }, () => {
                fetchCurrentRoom()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    return { currentRoom, loading }
}
