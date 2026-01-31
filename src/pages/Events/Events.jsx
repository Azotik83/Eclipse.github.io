import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Calendar, Plus, Users, Clock, Send, ArrowLeft, Trophy,
    Zap, Video, MapPin, X, Check, AlertCircle, MessageSquare
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useEvents, useEventMessages } from '../../hooks/useEvents'
import { formatDistanceToNow, format, isPast, isFuture, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import { isAdmin } from '../../lib/permissions'

const CATEGORIES = [
    { id: 'defi', label: 'Défi', icon: Trophy, color: 'from-orange-500 to-red-500' },
    { id: 'session_live', label: 'Session Live', icon: Video, color: 'from-purple-500 to-pink-500' },
    { id: 'meetup', label: 'Meetup', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'autre', label: 'Autre', icon: Zap, color: 'from-green-500 to-emerald-500' }
]

export default function Events() {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const { events, loading, createEvent, joinEvent, leaveEvent, deleteEvent } = useEvents()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filter, setFilter] = useState('upcoming')

    const activeEvent = events.find(e => e.id === eventId)

    // Filter events
    const filteredEvents = events.filter(event => {
        const startDate = new Date(event.start_date)
        if (filter === 'upcoming') return isFuture(startDate)
        if (filter === 'ongoing') {
            const endDate = event.end_date ? new Date(event.end_date) : null
            return isPast(startDate) && (!endDate || isFuture(endDate))
        }
        if (filter === 'past') return isPast(new Date(event.end_date || event.start_date))
        return true
    })

    if (eventId && activeEvent) {
        return (
            <EventDetail
                event={activeEvent}
                profile={profile}
                onLeave={() => leaveEvent(eventId, profile.id)}
                onDelete={() => {
                    deleteEvent(eventId)
                    navigate('/events')
                }}
                onBack={() => navigate('/events')}
            />
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Arènes d'Événements</h1>
                            <p className="text-sm text-text-secondary">Défis et sessions live</p>
                        </div>
                    </div>

                    {isAdmin(profile) && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Créer un événement
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {[
                        { id: 'upcoming', label: 'À venir' },
                        { id: 'ongoing', label: 'En cours' },
                        { id: 'past', label: 'Terminés' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === tab.id
                                    ? 'bg-accent-purple text-white'
                                    : 'text-text-secondary hover:bg-surface-hover'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun événement {filter === 'upcoming' ? 'à venir' : filter === 'ongoing' ? 'en cours' : 'terminé'}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                profile={profile}
                                onJoin={() => joinEvent(event.id, profile.id)}
                                onLeave={() => leaveEvent(event.id, profile.id)}
                                onClick={() => navigate(`/events/${event.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateEventModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={async (data) => {
                        await createEvent({ ...data, created_by: profile.id })
                        setShowCreateModal(false)
                    }}
                />
            )}
        </div>
    )
}

function EventCard({ event, profile, onJoin, onLeave, onClick }) {
    const category = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[3]
    const Icon = category.icon
    const startDate = new Date(event.start_date)
    const isParticipant = event.participants?.some(p => p.user?.id === profile?.id)
    const participantCount = event.participants?.length || 0
    const isFull = event.max_participants && participantCount >= event.max_participants
    const isUpcoming = isFuture(startDate)
    const minutesUntil = differenceInMinutes(startDate, new Date())

    return (
        <div
            className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
            onClick={onClick}
        >
            {/* Banner */}
            <div className={`h-24 bg-gradient-to-br ${category.color} relative`}>
                {event.banner_url && (
                    <img src={event.banner_url} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-black/30 backdrop-blur">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">{category.label}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
                {event.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">{event.description}</p>
                )}

                {/* Date & Participants */}
                <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Clock className="w-4 h-4" />
                        {isUpcoming ? (
                            minutesUntil < 60 ? (
                                <span className="text-accent-green">Dans {minutesUntil} min</span>
                            ) : (
                                format(startDate, "d MMM 'à' HH:mm", { locale: fr })
                            )
                        ) : (
                            <span className="text-accent-purple">En cours</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Users className="w-4 h-4" />
                        <span>
                            {participantCount}
                            {event.max_participants && `/${event.max_participants}`}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        isParticipant ? onLeave() : onJoin()
                    }}
                    disabled={!isParticipant && isFull}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${isParticipant
                            ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
                            : isFull
                                ? 'bg-surface text-text-secondary cursor-not-allowed'
                                : 'bg-accent-purple hover:bg-accent-purple/80 text-white'
                        }`}
                >
                    {isParticipant ? '✓ Inscrit' : isFull ? 'Complet' : 'Rejoindre'}
                </button>
            </div>
        </div>
    )
}

function EventDetail({ event, profile, onLeave, onDelete, onBack }) {
    const { messages, loading, sendMessage } = useEventMessages(event.id)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    const category = CATEGORIES.find(c => c.id === event.category) || CATEGORIES[3]
    const Icon = category.icon
    const isParticipant = event.participants?.some(p => p.user?.id === profile?.id)
    const startDate = new Date(event.start_date)
    const isLive = isPast(startDate) && (!event.end_date || isFuture(new Date(event.end_date)))

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending || !isParticipant) return

        setSending(true)
        await sendMessage(newMessage, profile.id)
        setNewMessage('')
        setSending(false)
    }

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {/* Event Info */}
            <div className="w-96 glass border-r border-border flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface-hover">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold">{event.title}</h2>
                        <span className={`text-sm ${isLive ? 'text-accent-green' : 'text-text-secondary'}`}>
                            {isLive ? '🔴 En direct' : format(startDate, "d MMM 'à' HH:mm", { locale: fr })}
                        </span>
                    </div>
                </div>

                {/* Banner */}
                <div className={`h-32 bg-gradient-to-br ${category.color} relative`}>
                    {event.banner_url && (
                        <img src={event.banner_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-3 left-3 p-2 rounded-lg bg-black/30 backdrop-blur flex items-center gap-2">
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{category.label}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {event.description && (
                        <div>
                            <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
                            <p className="text-sm">{event.description}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-2">Créé par</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                    {event.creator?.username?.[0]?.toUpperCase()}
                                </span>
                            </div>
                            <span>{event.creator?.display_name || event.creator?.username}</span>
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-2">
                            Participants ({event.participants?.length || 0}
                            {event.max_participants && `/${event.max_participants}`})
                        </h3>
                        <div className="space-y-2">
                            {event.participants?.map(p => (
                                <div key={p.user?.id} className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        {p.user?.avatar_url ? (
                                            <img src={p.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-white font-bold">
                                                {p.user?.username?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm">{p.user?.display_name || p.user?.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border space-y-2">
                    {isParticipant ? (
                        <button
                            onClick={onLeave}
                            className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                            Quitter l'événement
                        </button>
                    ) : (
                        <button className="w-full btn-primary py-2">
                            Rejoindre
                        </button>
                    )}

                    {isAdmin(profile) && (
                        <button
                            onClick={onDelete}
                            className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                            Supprimer l'événement
                        </button>
                    )}
                </div>
            </div>

            {/* Event Chat */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border glass flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-accent-purple" />
                    <div>
                        <h3 className="font-bold">Chat de l'événement</h3>
                        <p className="text-xs text-text-secondary">Discussion en temps réel</p>
                    </div>
                </div>

                {!isParticipant ? (
                    <div className="flex-1 flex items-center justify-center text-text-secondary">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Rejoins l'événement pour accéder au chat</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-text-secondary py-8">
                                    <p>Aucun message</p>
                                    <p className="text-sm">Sois le premier à parler !</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                                            {msg.user?.avatar_url ? (
                                                <img src={msg.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-white font-bold">
                                                    {msg.user?.username?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{msg.user?.display_name || msg.user?.username}</span>
                                                <span className="text-xs text-text-secondary">
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 border-t border-border glass">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value.substring(0, 500))}
                                    placeholder="Message..."
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
                    </>
                )}
            </div>
        </div>
    )
}

function CreateEventModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'defi',
        start_date: '',
        end_date: '',
        max_participants: ''
    })
    const [creating, setCreating] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.start_date) return

        setCreating(true)
        await onCreate({
            ...formData,
            max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
            end_date: formData.end_date || null
        })
        setCreating(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-elevated rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Créer un événement</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Titre *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="input w-full"
                            placeholder="Nom de l'événement"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="input w-full h-24 resize-none"
                            placeholder="Décris l'événement..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Catégorie</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                        className={`p-3 rounded-xl flex items-center gap-2 transition-colors ${formData.category === cat.id
                                                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                                                : 'bg-surface hover:bg-surface-hover'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {cat.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-2">Début *</label>
                            <input
                                type="datetime-local"
                                value={formData.start_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                className="input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-2">Fin (optionnel)</label>
                            <input
                                type="datetime-local"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Participants max (optionnel)</label>
                        <input
                            type="number"
                            value={formData.max_participants}
                            onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                            className="input w-full"
                            placeholder="Illimité"
                            min="1"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-border hover:bg-surface-hover"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={creating || !formData.title || !formData.start_date}
                            className="flex-1 btn-primary py-2 disabled:opacity-50"
                        >
                            {creating ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
