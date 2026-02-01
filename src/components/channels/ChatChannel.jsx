import { useState, useEffect, useRef } from 'react'
import { Hash, Send, Smile, MoreHorizontal, Edit2, Trash2, Users } from 'lucide-react'
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getRoleBadge, permissions } from '../../lib/permissions'
import { isCurrentlyMuted } from '../../lib/moderation'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🔥', '👀', '🎉', '💪', '🙏']

export default function ChatChannel({ channel, profile }) {
    const {
        messages,
        loading,
        hasMore,
        loadMore,
        sendMessage,
        addReaction,
        removeReaction,
        editMessage,
        deleteMessage
    } = useRealtimeMessages(channel.id)

    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const isMuted = isCurrentlyMuted(profile)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending || isMuted) return

        setSending(true)
        const { error } = await sendMessage(newMessage, profile.id)
        if (!error) {
            setNewMessage('')
        }
        setSending(false)
    }

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore) {
            loadMore()
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Channel Header */}
            <div className="p-4 border-b border-border glass flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center text-xl">
                        {channel.icon || '💬'}
                    </div>
                    <div>
                        <h2 className="font-bold">{channel.name}</h2>
                        <p className="text-xs text-text-secondary">{channel.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{messages.length} messages</span>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onScroll={handleScroll}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <span className="text-4xl mb-4">{channel.icon || '💬'}</span>
                        <p>Aucun message dans ce salon</p>
                        <p className="text-sm">Sois le premier à écrire !</p>
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <button
                                onClick={loadMore}
                                className="w-full py-2 text-sm text-accent-purple hover:underline"
                            >
                                Charger plus de messages
                            </button>
                        )}
                        {messages.map((message, index) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                profile={profile}
                                showAvatar={index === 0 || messages[index - 1]?.user_id !== message.user_id}
                                onReact={(emoji) => addReaction(message.id, emoji, profile.id)}
                                onRemoveReact={(emoji) => removeReaction(message.id, emoji, profile.id)}
                                onEdit={(content) => editMessage(message.id, content)}
                                onDelete={() => deleteMessage(message.id)}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border glass">
                {isMuted && (
                    <div className="mb-2 p-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm text-center">
                        🔇 Tu es mute jusqu'à {new Date(profile.muted_until).toLocaleString('fr-FR')}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value.substring(0, 500))}
                            placeholder={isMuted ? 'Tu es actuellement mute...' : `Message dans #${channel.name}`}
                            disabled={isMuted}
                            className="input w-full pr-20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-text-secondary">
                            <span className="text-xs">{newMessage.length}/500</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending || isMuted}
                        className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

function MessageItem({ message, profile, showAvatar, onReact, onRemoveReact, onEdit, onDelete }) {
    const [showMenu, setShowMenu] = useState(false)
    const [showReactions, setShowReactions] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)

    const user = message.user
    const badge = getRoleBadge(user?.role, user?.is_super_admin)
    const isOwn = message.user_id === profile?.id
    const canDelete = isOwn || permissions.canDeleteAnyMessage(profile)

    const reactionGroups = message.reactions?.reduce((acc, r) => {
        acc[r.emoji] = acc[r.emoji] || []
        acc[r.emoji].push(r.user_id)
        return acc
    }, {}) || {}

    const handleSaveEdit = async () => {
        if (editContent.trim() && editContent !== message.content) {
            await onEdit(editContent)
        }
        setIsEditing(false)
    }

    const renderContent = (content) => {
        const mentionRegex = /@(\w+)/g
        const parts = content.split(mentionRegex)

        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return (
                    <span key={i} className="text-accent-purple bg-accent-purple/20 px-1 rounded">
                        @{part}
                    </span>
                )
            }
            return part
        })
    }

    return (
        <div className={`group flex gap-3 ${!showAvatar ? 'ml-12' : ''}`}>
            {showAvatar && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">
                            {user?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                    )}
                </div>
            )}

            <div className="flex-1 min-w-0">
                {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{user?.display_name || user?.username || 'Utilisateur'}</span>
                        {badge && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                                {badge.label}
                            </span>
                        )}
                        <span className="text-xs text-text-secondary">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        {message.is_edited && (
                            <span className="text-xs text-text-secondary">(modifié)</span>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value.substring(0, 500))}
                            className="input flex-1"
                            autoFocus
                        />
                        <button onClick={handleSaveEdit} className="btn-primary px-3 py-1 text-sm">
                            Sauver
                        </button>
                        <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm hover:bg-surface-hover rounded-lg">
                            Annuler
                        </button>
                    </div>
                ) : (
                    <p className="text-text-primary break-words">{renderContent(message.content)}</p>
                )}

                {Object.keys(reactionGroups).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(reactionGroups).map(([emoji, userIds]) => (
                            <button
                                key={emoji}
                                onClick={() => {
                                    if (userIds.includes(profile?.id)) {
                                        onRemoveReact(emoji)
                                    } else {
                                        onReact(emoji)
                                    }
                                }}
                                className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${userIds.includes(profile?.id)
                                        ? 'bg-accent-purple/20 text-accent-purple'
                                        : 'bg-surface-hover text-text-secondary hover:bg-surface'
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span className="text-xs">{userIds.length}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                <div className="relative">
                    <button
                        onClick={() => setShowReactions(!showReactions)}
                        className="p-1.5 rounded hover:bg-surface-hover text-text-secondary"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                    {showReactions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowReactions(false)} />
                            <div className="absolute right-0 top-full mt-1 p-2 rounded-xl glass-elevated border border-border shadow-xl z-20 flex gap-1">
                                {EMOJI_OPTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => {
                                            onReact(emoji)
                                            setShowReactions(false)
                                        }}
                                        className="p-1.5 rounded hover:bg-surface-hover text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {(isOwn || canDelete) && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded hover:bg-surface-hover text-text-secondary"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-1 w-32 rounded-xl glass-elevated border border-border shadow-xl z-20">
                                    {isOwn && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(true)
                                                setShowMenu(false)
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface-hover rounded-t-xl"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Modifier
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => {
                                                onDelete()
                                                setShowMenu(false)
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface-hover text-red-400 rounded-b-xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
