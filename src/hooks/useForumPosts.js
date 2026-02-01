import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Hook pour récupérer les posts d'un forum
export function useForumPosts(channelId) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = useCallback(async () => {
        if (!channelId) return

        setLoading(true)
        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
        *,
        user:profiles!user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .eq('channel_id', channelId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })

        if (!error) {
            setPosts(data || [])
        } else {
            console.error('Erreur fetch posts:', error)
        }
        setLoading(false)
    }, [channelId])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    const createPost = async (title, content, tags, userId) => {
        const { data, error } = await supabase
            .from('forum_posts')
            .insert({ channel_id: channelId, user_id: userId, title, content, tags })
            .select(`
        *,
        user:profiles!user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .single()

        if (!error && data) {
            setPosts(prev => [data, ...prev])
        }
        return { data, error }
    }

    return { posts, loading, createPost, refetch: fetchPosts }
}

// Hook pour récupérer un post avec ses réponses
export function useForumPost(postId) {
    const [post, setPost] = useState(null)
    const [replies, setReplies] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPost = useCallback(async () => {
        if (!postId) return

        setLoading(true)

        // Fetch post
        const { data: postData, error: postError } = await supabase
            .from('forum_posts')
            .select(`
        *,
        user:profiles!user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .eq('id', postId)
            .single()

        if (!postError) {
            setPost(postData)
        }

        // Fetch replies
        const { data: repliesData, error: repliesError } = await supabase
            .from('forum_replies')
            .select(`
        *,
        user:profiles!user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (!repliesError) {
            setReplies(repliesData || [])
        }

        setLoading(false)
    }, [postId])

    useEffect(() => {
        fetchPost()
    }, [fetchPost])

    // Realtime pour les nouvelles réponses
    useEffect(() => {
        if (!postId) return

        const subscription = supabase
            .channel(`forum_replies:${postId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'forum_replies',
                filter: `post_id=eq.${postId}`
            }, async (payload) => {
                // Fetch user data for the new reply
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id, username, display_name, avatar_url, role, is_super_admin')
                    .eq('id', payload.new.user_id)
                    .single()

                const newReply = { ...payload.new, user: userData }
                setReplies(prev => [...prev, newReply])
                setPost(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev)
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [postId])

    const addReply = async (content, userId) => {
        const { data, error } = await supabase
            .from('forum_replies')
            .insert({ post_id: postId, user_id: userId, content })
            .select(`
        *,
        user:profiles!user_id(id, username, display_name, avatar_url, role, is_super_admin)
      `)
            .single()

        if (!error && data) {
            setReplies(prev => [...prev, data])
            setPost(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev)
        }
        return { data, error }
    }

    return { post, replies, loading, addReply, refetch: fetchPost }
}
