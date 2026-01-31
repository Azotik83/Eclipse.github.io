import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, Send, Users, Search, Plus, X, Check, UserPlus, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useConversations, useDirectMessages, useFriends } from '../../hooks/useRealtimeDMs'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { searchUsers } from '../../lib/moderation'

export default function DirectMessages() {
    const { conversationId } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const { conversations, loading, getOrCreateConversation } = useConversations(profile?.id)
    const { friends, pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriends(profile?.id)

    const [showNewChat, setShowNewChat] = useState(false)
    const [showFriendRequests, setShowFriendRequests] = useState(false)

    const activeConversation = conversations.find(c => c.id === conversationId)

    const startConversation = async (userId) => {
        const { id } = await getOrCreateConversation(userId)
        if (id) {
            navigate(`/dm/${id}`)
            setShowNewChat(false)
        }
    }

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 glass border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">Messages</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFriendRequests(true)}
                                className="relative p-2 rounded-lg hover:bg-surface-hover text-text-secondary"
                            >
                                <UserPlus className="w-5 h-5" />
                                {pendingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-purple text-white text-xs flex items-center justify-center">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Friends Quick Access */}
                    {friends.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {friends.slice(0, 5).map(friend => (
                                <button
                                    key={friend.id}
                                    onClick={() => startConversation(friend.id)}
                                    className="flex-shrink-0 flex flex-col items-center gap-1"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold">{friend.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-text-secondary truncate w-12 text-center">
                                        {friend.username}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 text-center text-text-secondary">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Aucune conversation</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="mt-3 text-sm text-accent-purple hover:underline"
                            >
                                Démarrer une conversation
                            </button>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => navigate(`/dm/${conv.id}`)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${conv.id === conversationId
                                            ? 'bg-accent-purple/20 text-accent-purple'
                                            : 'hover:bg-surface-hover'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                                        {conv.otherUser?.avatar_url ? (
                                            <img src={conv.otherUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold">
                                                {conv.otherUser?.username?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="font-medium truncate">
                                            {conv.otherUser?.display_name || conv.otherUser?.username || 'Utilisateur'}
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {conversationId && activeConversation ? (
                <DMChat conversation={activeConversation} profile={profile} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-text-secondary">
                    <div className="text-center">
                        <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Sélectionne une conversation</p>
                    </div>
                </div>
            )}

            {/* New Chat Modal */}
            {showNewChat && (
                <NewChatModal
                    onClose={() => setShowNewChat(false)}
                    onSelectUser={startConversation}
                    friends={friends}
                />
            )}

            {/* Friend Requests Modal */}
            {showFriendRequests && (
                <FriendRequestsModal
                    requests={pendingRequests}
                    onAccept={acceptFriendRequest}
                    onReject={rejectFriendRequest}
                    onClose={() => setShowFriendRequests(false)}
                />
            )}
        </div>
    )
}

function DMChat({ conversation, profile }) {
    const { messages, loading, sendMessage } = useDirectMessages(conversation.id)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        await sendMessage(newMessage, profile.id)
        setNewMessage('')
        setSending(false)
    }

    const otherUser = conversation.otherUser

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border glass flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                    {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-white font-bold">{otherUser?.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
                <div>
                    <h2 className="font-bold">{otherUser?.display_name || otherUser?.username}</h2>
                    <p className="text-xs text-text-secondary">@{otherUser?.username}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <p>Aucun message</p>
                        <p className="text-sm">Envoie le premier message !</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.sender_id === profile.id
                        const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                            >
                                {showAvatar && !isOwn && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                                        {msg.sender?.avatar_url ? (
                                            <img src={msg.sender.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-white font-bold">
                                                {msg.sender?.username?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!showAvatar && !isOwn && <div className="w-8" />}

                                <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                                    <div
                                        className={`inline-block px-4 py-2 rounded-2xl ${isOwn
                                                ? 'bg-accent-purple text-white rounded-br-sm'
                                                : 'bg-surface-elevated rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {showAvatar && (
                                        <div className="text-xs text-text-secondary mt-1">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border glass">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value.substring(0, 500))}
                        placeholder={`Message à ${otherUser?.username || 'utilisateur'}`}
                        className="input flex-1"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="btn-primary p-3 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

function NewChatModal({ onClose, onSelectUser, friends }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setSearching(true)
        const results = await searchUsers(searchQuery)
        setSearchResults(results)
        setSearching(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-elevated rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Nouvelle conversation</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Rechercher un utilisateur..."
                        className="input flex-1"
                    />
                    <button onClick={handleSearch} className="btn-primary px-4">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Friends */}
                {friends.length > 0 && !searchQuery && (
                    <div className="mb-4">
                        <h4 className="text-sm text-text-secondary mb-2">Amis</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {friends.map(friend => (
                                <button
                                    key={friend.id}
                                    onClick={() => onSelectUser(friend.id)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        <span className="text-xs text-white font-bold">{friend.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <span>{friend.display_name || friend.username}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searching ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : searchResults.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        <h4 className="text-sm text-text-secondary mb-2">Résultats</h4>
                        <div className="space-y-1">
                            {searchResults.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => onSelectUser(user.id)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        <span className="text-xs text-white font-bold">{user.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <div className="text-left">
                                        <div>{user.display_name || user.username}</div>
                                        <div className="text-xs text-text-secondary">@{user.username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function FriendRequestsModal({ requests, onAccept, onReject, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-elevated rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Demandes d'amis</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {requests.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">Aucune demande en attente</p>
                ) : (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        <span className="text-white font-bold">{req.requester?.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{req.requester?.display_name || req.requester?.username}</div>
                                        <div className="text-xs text-text-secondary">@{req.requester?.username}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onAccept(req.id)}
                                        className="p-2 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green/30"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onReject(req.id)}
                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
