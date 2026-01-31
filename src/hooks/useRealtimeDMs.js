// Hook pour les messages privés en temps réel
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useConversations(userId) {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    const loadConversations = useCallback(async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('conversations')
            .select(`
        *,
        participant_1_profile:participant_1(id, username, display_name, avatar_url),
        participant_2_profile:participant_2(id, username, display_name, avatar_url)
      `)
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
            .order('last_message_at', { ascending: false })

        if (error) {
            console.error('Erreur chargement conversations:', error)
        } else {
            // Ajouter l'autre participant à chaque conversation
            const processed = data?.map(conv => ({
                ...conv,
                otherUser: conv.participant_1 === userId
                    ? conv.participant_2_profile
                    : conv.participant_1_profile
            })) || []
            setConversations(processed)
        }
        setLoading(false)
    }, [userId])

    useEffect(() => {
        loadConversations()

        // Subscription temps réel
        const channel = supabase
            .channel(`conversations:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations'
                },
                () => loadConversations()
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [userId, loadConversations])

    // Créer ou récupérer une conversation
    const getOrCreateConversation = useCallback(async (otherUserId) => {
        // Chercher une conversation existante
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
            .single()

        if (existing) {
            return { id: existing.id }
        }

        // Créer une nouvelle conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                participant_1: userId,
                participant_2: otherUserId
            })
            .select()
            .single()

        if (error) {
            console.error('Erreur création conversation:', error)
            return { error: error.message }
        }

        loadConversations()
        return { id: data.id }
    }, [userId, loadConversations])

    return { conversations, loading, getOrCreateConversation, refresh: loadConversations }
}

export function useDirectMessages(conversationId, limit = 20) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)

    const loadMessages = useCallback(async () => {
        if (!conversationId) return

        const { data, error } = await supabase
            .from('direct_messages')
            .select(`
        *,
        sender:sender_id(id, username, display_name, avatar_url)
      `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (!error) {
            setMessages(data?.reverse() || [])
            setHasMore(data?.length === limit)
        }
        setLoading(false)
    }, [conversationId, limit])

    const sendMessage = useCallback(async (content, senderId) => {
        if (!conversationId || !content.trim()) return { error: 'Message vide' }

        const { data, error } = await supabase
            .from('direct_messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content.trim().substring(0, 500)
            })
            .select(`
        *,
        sender:sender_id(id, username, display_name, avatar_url)
      `)
            .single()

        if (error) {
            return { error: error.message }
        }

        // Update conversation last_message_at
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId)

        return { data }
    }, [conversationId])

    useEffect(() => {
        if (!conversationId) return

        loadMessages()

        const channel = supabase
            .channel(`dm:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    const { data } = await supabase
                        .from('direct_messages')
                        .select(`
              *,
              sender:sender_id(id, username, display_name, avatar_url)
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
    }, [conversationId, loadMessages])

    return { messages, loading, hasMore, sendMessage, refresh: loadMessages }
}

// Hook pour le système d'amis
export function useFriends(userId) {
    const [friends, setFriends] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [loading, setLoading] = useState(true)

    const loadFriendships = useCallback(async () => {
        if (!userId) return

        // Amis acceptés
        const { data: accepted } = await supabase
            .from('friendships')
            .select(`
        *,
        requester:requester_id(id, username, display_name, avatar_url),
        addressee:addressee_id(id, username, display_name, avatar_url)
      `)
            .eq('status', 'accepted')
            .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

        // Demandes reçues en attente
        const { data: pending } = await supabase
            .from('friendships')
            .select(`
        *,
        requester:requester_id(id, username, display_name, avatar_url)
      `)
            .eq('addressee_id', userId)
            .eq('status', 'pending')

        // Demandes envoyées
        const { data: sent } = await supabase
            .from('friendships')
            .select(`
        *,
        addressee:addressee_id(id, username, display_name, avatar_url)
      `)
            .eq('requester_id', userId)
            .eq('status', 'pending')

        // Extraire les amis (l'autre personne dans chaque amitié)
        const friendsList = accepted?.map(f =>
            f.requester_id === userId ? f.addressee : f.requester
        ) || []

        setFriends(friendsList)
        setPendingRequests(pending || [])
        setSentRequests(sent || [])
        setLoading(false)
    }, [userId])

    useEffect(() => {
        loadFriendships()

        const channel = supabase
            .channel(`friends:${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'friendships' },
                () => loadFriendships()
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [userId, loadFriendships])

    const sendFriendRequest = useCallback(async (addresseeId) => {
        const { error } = await supabase
            .from('friendships')
            .insert({
                requester_id: userId,
                addressee_id: addresseeId,
                status: 'pending'
            })

        if (error) {
            console.error('Erreur demande ami:', error)
            return { error: error.message }
        }
        loadFriendships()
        return { success: true }
    }, [userId, loadFriendships])

    const acceptFriendRequest = useCallback(async (friendshipId) => {
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', friendshipId)

        if (!error) loadFriendships()
        return { success: !error }
    }, [loadFriendships])

    const rejectFriendRequest = useCallback(async (friendshipId) => {
        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId)

        if (!error) loadFriendships()
        return { success: !error }
    }, [loadFriendships])

    const removeFriend = useCallback(async (friendId) => {
        await supabase
            .from('friendships')
            .delete()
            .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)

        loadFriendships()
    }, [userId, loadFriendships])

    return {
        friends,
        pendingRequests,
        sentRequests,
        loading,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        refresh: loadFriendships
    }
}

// Hook pour le blocage
export function useBlocks(userId) {
    const [blockedUsers, setBlockedUsers] = useState([])

    const loadBlocks = useCallback(async () => {
        if (!userId) return

        const { data } = await supabase
            .from('blocks')
            .select(`
        *,
        blocked:blocked_id(id, username, display_name)
      `)
            .eq('blocker_id', userId)

        setBlockedUsers(data?.map(b => b.blocked) || [])
    }, [userId])

    useEffect(() => {
        loadBlocks()
    }, [loadBlocks])

    const blockUser = useCallback(async (blockedId) => {
        await supabase
            .from('blocks')
            .insert({ blocker_id: userId, blocked_id: blockedId })
        loadBlocks()
    }, [userId, loadBlocks])

    const unblockUser = useCallback(async (blockedId) => {
        await supabase
            .from('blocks')
            .delete()
            .match({ blocker_id: userId, blocked_id: blockedId })
        loadBlocks()
    }, [userId, loadBlocks])

    const isBlocked = useCallback((otherId) => {
        return blockedUsers.some(u => u.id === otherId)
    }, [blockedUsers])

    return { blockedUsers, blockUser, unblockUser, isBlocked }
}
