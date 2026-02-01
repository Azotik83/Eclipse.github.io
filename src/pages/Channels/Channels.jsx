import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Hash, FileText, Volume2, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useChannels } from '../../hooks/useRealtimeMessages'
import ChatChannel from '../../components/channels/ChatChannel'
import ForumChannel from '../../components/channels/ForumChannel'
import VoiceChannel from '../../components/channels/VoiceChannel'

// Icônes par type de salon
const TYPE_ICONS = {
    chat: Hash,
    forum: FileText,
    voice: Volume2
}

export default function Channels() {
    const { channelId } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const { channels, loading: channelsLoading } = useChannels()

    // État pour les catégories collapsées
    const [collapsedCategories, setCollapsedCategories] = useState({})

    // Grouper les canaux par catégorie
    const channelsByCategory = channels.reduce((acc, channel) => {
        const category = channel.category || 'AUTRES'
        if (!acc[category]) acc[category] = []
        acc[category].push(channel)
        return acc
    }, {})

    // Trier les catégories
    const categoryOrder = ['COMMUNAUTÉ', 'ENTRAIDE', 'MOTIVATION', 'VOCAL', 'AUTRES']
    const sortedCategories = Object.keys(channelsByCategory).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a)
        const indexB = categoryOrder.indexOf(b)
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })

    const activeChannel = channels.find(c => c.id === channelId) || channels[0]
    const activeChannelId = activeChannel?.id

    useEffect(() => {
        if (!channelId && channels.length > 0) {
            navigate(`/channels/${channels[0].id}`, { replace: true })
        }
    }, [channelId, channels, navigate])

    const toggleCategory = (category) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    if (channelsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {/* Channel List */}
            <div className="w-64 glass border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-lg">Salons</h2>
                    <p className="text-xs text-text-secondary">Discussion & Forums</p>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {sortedCategories.map(category => (
                        <div key={category} className="mb-2">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
                            >
                                {collapsedCategories[category] ? (
                                    <ChevronRight className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                                {category}
                            </button>

                            {/* Channels */}
                            {!collapsedCategories[category] && (
                                <div className="space-y-0.5 px-2">
                                    {channelsByCategory[category]
                                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                                        .map(channel => {
                                            const Icon = TYPE_ICONS[channel.type] || Hash
                                            const isActive = channel.id === activeChannelId

                                            return (
                                                <button
                                                    key={channel.id}
                                                    onClick={() => navigate(`/channels/${channel.id}`)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                                                            ? 'bg-accent-purple/20 text-accent-purple'
                                                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                                        }`}
                                                >
                                                    <span className="text-base">{channel.icon || ''}</span>
                                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate text-sm font-medium">{channel.name}</span>
                                                </button>
                                            )
                                        })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Channel Content */}
            {activeChannel && (
                <ChannelContent channel={activeChannel} profile={profile} />
            )}
        </div>
    )
}

function ChannelContent({ channel, profile }) {
    switch (channel.type) {
        case 'forum':
            return <ForumChannel channel={channel} profile={profile} />
        case 'voice':
            return <VoiceChannel channel={channel} profile={profile} />
        case 'chat':
        default:
            return <ChatChannel channel={channel} profile={profile} />
    }
}
