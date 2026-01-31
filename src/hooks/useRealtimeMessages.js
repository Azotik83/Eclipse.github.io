// Hook pour les messages en temps réel
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeMessages(channelId, limit = 20) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)

    // Charger les messages initiaux
    const loadMessages = useCallback(async () => {
        if (!channelId) return

        setLoading(true)
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        user:user_id(id, username, display_name, avatar_url, role, is_super_admin),
        reactions:message_reactions(id, emoji, user_id)
      `)
            .eq('channel_id', channelId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Erreur chargement messages:', error)
        } else {
            // Inverser pour avoir les plus anciens en premier
            setMessages(data?.reverse() || [])
            setHasMore(data?.length === limit)
        }
        setLoading(false)
    }, [channelId, limit])

    // Charger plus de messages (pagination)
    const loadMore = useCallback(async () => {
        if (!channelId || !hasMore || messages.length === 0) return

        const oldestMessage = messages[0]
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        user:user_id(id, username, display_name, avatar_url, role, is_super_admin),
        reactions:message_reactions(id, emoji, user_id)
      `)
            .eq('channel_id', channelId)
            .eq('is_deleted', false)
            .lt('created_at', oldestMessage.created_at)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!error && data) {
            setMessages(prev => [...data.reverse(), ...prev])
            setHasMore(data.length === limit)
        }
    }, [channelId, hasMore, messages, limit])

    // Envoyer un message
    const sendMessage = useCallback(async (content, userId) => {
        if (!channelId || !content.trim()) return { error: 'Message vide' }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                channel_id: channelId,
                user_id: userId,
                content: content.trim().substring(0, 500)
            })
            .select(`
        *,
        user:user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .single()

        if (error) {
            console.error('Erreur envoi message:', error)
            return { error: error.message }
        }

        return { data }
    }, [channelId])

    // Ajouter une réaction
    const addReaction = useCallback(async (messageId, emoji, userId) => {
        const { error } = await supabase
            .from('message_reactions')
            .insert({ message_id: messageId, emoji, user_id: userId })

        if (error && error.code !== '23505') { // Ignorer les doublons
            console.error('Erreur réaction:', error)
        }
    }, [])

    // Supprimer une réaction
    const removeReaction = useCallback(async (messageId, emoji, userId) => {
        await supabase
            .from('message_reactions')
            .delete()
            .match({ message_id: messageId, emoji, user_id: userId })
    }, [])

    // Éditer un message
    const editMessage = useCallback(async (messageId, newContent) => {
        const { error } = await supabase
            .from('messages')
            .update({
                content: newContent.trim().substring(0, 500),
                is_edited: true,
                edited_at: new Date().toISOString()
            })
            .eq('id', messageId)

        if (error) {
            console.error('Erreur édition:', error)
            return { error: error.message }
        }
        return { success: true }
    }, [])

    // Supprimer un message (soft delete)
    const deleteMessage = useCallback(async (messageId) => {
        const { error } = await supabase
            .from('messages')
            .update({ is_deleted: true })
            .eq('id', messageId)

        if (error) {
            console.error('Erreur suppression:', error)
            return { error: error.message }
        }
        return { success: true }
    }, [])

    // Effet pour charger et s'abonner
    useEffect(() => {
        if (!channelId) return

        loadMessages()

        // Subscription temps réel pour les nouveaux messages
        const messagesChannel = supabase
            .channel(`messages:${channelId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel_id=eq.${channelId}`
                },
                async (payload) => {
                    // Charger le message complet avec l'utilisateur
                    const { data } = await supabase
                        .from('messages')
                        .select(`
              *,
              user:user_id(id, username, display_name, avatar_url, role, is_super_admin),
              reactions:message_reactions(id, emoji, user_id)
            `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data) {
                        setMessages(prev => [...prev, data])
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `channel_id=eq.${channelId}`
                },
                (payload) => {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === payload.new.id
                                ? { ...msg, ...payload.new }
                                : msg
                        ).filter(msg => !msg.is_deleted)
                    )
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions'
                },
                () => {
                    // Recharger les messages pour mettre à jour les réactions
                    loadMessages()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(messagesChannel)
        }
    }, [channelId, loadMessages])

    return {
        messages,
        loading,
        hasMore,
        loadMore,
        sendMessage,
        addReaction,
        removeReaction,
        editMessage,
        deleteMessage,
        refresh: loadMessages
    }
}

// Hook pour charger les canaux
export function useChannels() {
    const [channels, setChannels] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data, error } = await supabase
                .from('channels')
                .select('*')
                .order('created_at', { ascending: true })

            if (!error) {
                setChannels(data || [])
            }
            setLoading(false)
        }

        load()
    }, [])

    return { channels, loading }
}
