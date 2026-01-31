// Actions de modération pour Eclipse
import { supabase } from './supabase'

// Créer un log de modération
async function createModerationLog(moderatorId, targetUserId, action, reason = null, details = null) {
    const { error } = await supabase
        .from('moderation_logs')
        .insert({
            moderator_id: moderatorId,
            target_user_id: targetUserId,
            action,
            reason,
            details
        })

    if (error) console.error('Erreur log modération:', error)
    return !error
}

// Bannir un utilisateur
export async function banUser(moderatorId, targetUserId, reason, duration = null) {
    const bannedUntil = duration
        ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString() // duration en heures
        : null // ban permanent

    const { error } = await supabase
        .from('profiles')
        .update({
            is_banned: true,
            banned_until: bannedUntil
        })
        .eq('id', targetUserId)

    if (error) {
        console.error('Erreur ban:', error)
        return { success: false, error }
    }

    await createModerationLog(moderatorId, targetUserId, 'ban', reason, { duration: duration || 'permanent' })
    return { success: true }
}

// Débannir un utilisateur
export async function unbanUser(moderatorId, targetUserId, reason = 'Levée du bannissement') {
    const { error } = await supabase
        .from('profiles')
        .update({
            is_banned: false,
            banned_until: null
        })
        .eq('id', targetUserId)

    if (error) {
        console.error('Erreur unban:', error)
        return { success: false, error }
    }

    await createModerationLog(moderatorId, targetUserId, 'unban', reason)
    return { success: true }
}

// Mute un utilisateur
export async function muteUser(moderatorId, targetUserId, reason, durationMinutes = 60) {
    const mutedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()

    const { error } = await supabase
        .from('profiles')
        .update({ muted_until: mutedUntil })
        .eq('id', targetUserId)

    if (error) {
        console.error('Erreur mute:', error)
        return { success: false, error }
    }

    await createModerationLog(moderatorId, targetUserId, 'mute', reason, { duration: durationMinutes })
    return { success: true }
}

// Unmute un utilisateur
export async function unmuteUser(moderatorId, targetUserId) {
    const { error } = await supabase
        .from('profiles')
        .update({ muted_until: null })
        .eq('id', targetUserId)

    if (error) {
        console.error('Erreur unmute:', error)
        return { success: false, error }
    }

    await createModerationLog(moderatorId, targetUserId, 'unmute')
    return { success: true }
}

// Changer le rôle d'un utilisateur
export async function changeUserRole(moderatorId, targetUserId, newRole) {
    const action = newRole === 'user' ? 'demote' : 'promote'

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)

    if (error) {
        console.error('Erreur changement rôle:', error)
        return { success: false, error }
    }

    await createModerationLog(moderatorId, targetUserId, action, null, { new_role: newRole })
    return { success: true }
}

// Supprimer un message (soft delete)
export async function deleteMessage(moderatorId, messageId, channelId) {
    // Récupérer le message pour avoir l'user_id
    const { data: message } = await supabase
        .from('messages')
        .select('user_id, content')
        .eq('id', messageId)
        .single()

    const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)

    if (error) {
        console.error('Erreur suppression message:', error)
        return { success: false, error }
    }

    if (message) {
        await createModerationLog(moderatorId, message.user_id, 'delete_message', null, {
            message_preview: message.content.substring(0, 100),
            channel_id: channelId
        })
    }

    return { success: true }
}

// Récupérer les logs de modération
export async function getModerationLogs(limit = 50, offset = 0) {
    const { data, error } = await supabase
        .from('moderation_logs')
        .select(`
      *,
      moderator:moderator_id(username, display_name, avatar_url),
      target:target_user_id(username, display_name, avatar_url)
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Erreur récupération logs:', error)
        return []
    }

    return data
}

// Vérifier si un utilisateur est actuellement muted
export function isCurrentlyMuted(profile) {
    if (!profile?.muted_until) return false
    return new Date(profile.muted_until) > new Date()
}

// Vérifier si un utilisateur est actuellement banni
export function isCurrentlyBanned(profile) {
    if (!profile?.is_banned) return false
    if (!profile?.banned_until) return true // ban permanent
    return new Date(profile.banned_until) > new Date()
}

// Récupérer tous les utilisateurs (pour admin)
export async function getAllUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erreur récupération users:', error)
        return []
    }

    return data
}

// Rechercher des utilisateurs
export async function searchUsers(query) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20)

    if (error) {
        console.error('Erreur recherche users:', error)
        return []
    }

    return data
}
