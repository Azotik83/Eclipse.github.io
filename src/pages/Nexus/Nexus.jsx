import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Sun, Target, TrendingUp, Calendar, MessageSquare, Users,
    Zap, Trophy, Clock, ArrowRight, Plus
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useEvents } from '../../hooks/useEvents'
import { supabase } from '../../lib/supabase'
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Nexus() {
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const { events } = useEvents()
    const [stats, setStats] = useState({ messages: 0, friends: 0, events: 0 })
    const [recentActivity, setRecentActivity] = useState([])

    const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).slice(0, 3)

    // Charger les statistiques
    useEffect(() => {
        const loadStats = async () => {
            if (!profile?.id) return

            // Compter les messages
            const { count: messagesCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)

            // Compter les amis
            const { count: friendsCount } = await supabase
                .from('friendships')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'accepted')
                .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)

            // Compter les événements auxquels on participe
            const { count: eventsCount } = await supabase
                .from('event_participants')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)

            setStats({
                messages: messagesCount || 0,
                friends: friendsCount || 0,
                events: eventsCount || 0
            })
        }

        loadStats()
    }, [profile?.id])

    // Charger l'activité récente
    useEffect(() => {
        const loadActivity = async () => {
            if (!profile?.id) return

            const { data } = await supabase
                .from('messages')
                .select('id, content, created_at, channel:channel_id(name)')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(5)

            setRecentActivity(data || [])
        }

        loadActivity()
    }, [profile?.id])

    // Générer les jours de la semaine
    const weekDays = eachDayOfInterval({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 })
    })

    const greeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Bonjour'
        if (hour < 18) return 'Bon après-midi'
        return 'Bonsoir'
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                    <Sun className="w-5 h-5" />
                    <span>{format(new Date(), "EEEE d MMMM", { locale: fr })}</span>
                </div>
                <h1 className="text-3xl font-bold mb-1">
                    {greeting()}, <span className="text-gradient">{profile?.display_name || profile?.username}</span>
                </h1>
                <p className="text-text-secondary">Bienvenue dans ton Nexus personnel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Zap}
                    label="Points d'Ombre"
                    value={profile?.shadow_points || 0}
                    color="purple"
                    trend="+0 aujourd'hui"
                />
                <StatCard
                    icon={MessageSquare}
                    label="Messages"
                    value={stats.messages}
                    color="blue"
                    onClick={() => navigate('/channels')}
                />
                <StatCard
                    icon={Users}
                    label="Amis"
                    value={stats.friends}
                    color="green"
                    onClick={() => navigate('/profile')}
                />
                <StatCard
                    icon={Calendar}
                    label="Événements"
                    value={stats.events}
                    color="orange"
                    onClick={() => navigate('/events')}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Weekly Activity */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-accent-purple" />
                                Activité de la semaine
                            </h2>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-xs text-text-secondary mb-2">
                                        {format(day, 'EEE', { locale: fr })}
                                    </div>
                                    <div
                                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${isToday(day)
                                                ? 'bg-accent-purple text-white'
                                                : 'bg-surface hover:bg-surface-hover'
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-accent-blue" />
                                Activité récente
                            </h2>
                            <button
                                onClick={() => navigate('/channels')}
                                className="text-sm text-accent-purple hover:underline"
                            >
                                Voir tout
                            </button>
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-text-secondary">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p>Aucune activité récente</p>
                                <button
                                    onClick={() => navigate('/channels')}
                                    className="mt-3 text-sm text-accent-purple hover:underline"
                                >
                                    Envoyer ton premier message
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map(activity => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                                        onClick={() => navigate('/channels')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-4 h-4 text-accent-blue" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{activity.content}</p>
                                            <p className="text-xs text-text-secondary">
                                                dans #{activity.channel?.name} • {format(new Date(activity.created_at), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Level Progress */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-accent-green" />
                                Niveau {profile?.level || 1}
                            </h2>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-text-secondary">Progression</span>
                                <span className="text-accent-purple">{(profile?.shadow_points || 0) % 100} / 100</span>
                            </div>
                            <div className="h-2 rounded-full bg-surface overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all"
                                    style={{ width: `${(profile?.shadow_points || 0) % 100}%` }}
                                />
                            </div>
                        </div>

                        <p className="text-sm text-text-secondary">
                            Gagne des points en participant aux événements et au chat !
                        </p>
                    </div>

                    {/* Upcoming Events */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-accent-orange" />
                                Événements
                            </h2>
                            <button
                                onClick={() => navigate('/events')}
                                className="text-sm text-accent-purple hover:underline"
                            >
                                Voir tout
                            </button>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-6 text-text-secondary">
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Aucun événement à venir</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map(event => (
                                    <button
                                        key={event.id}
                                        onClick={() => navigate(`/events/${event.id}`)}
                                        className="w-full p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors text-left"
                                    >
                                        <div className="font-medium text-sm truncate">{event.title}</div>
                                        <div className="text-xs text-text-secondary">
                                            {format(new Date(event.start_date), "d MMM 'à' HH:mm", { locale: fr })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Actions rapides</h2>
                        <div className="space-y-2">
                            <QuickAction
                                icon={MessageSquare}
                                label="Voir les messages"
                                onClick={() => navigate('/channels')}
                            />
                            <QuickAction
                                icon={Users}
                                label="Messages privés"
                                onClick={() => navigate('/dm')}
                            />
                            <QuickAction
                                icon={Target}
                                label="Mon profil"
                                onClick={() => navigate('/profile')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color, trend, onClick }) {
    const colors = {
        purple: 'from-accent-purple/20 to-transparent text-accent-purple',
        blue: 'from-accent-blue/20 to-transparent text-accent-blue',
        green: 'from-accent-green/20 to-transparent text-accent-green',
        orange: 'from-orange-500/20 to-transparent text-orange-400'
    }

    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border border-current/20 text-left transition-transform hover:scale-[1.02]`}
        >
            <Icon className="w-5 h-5 mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm opacity-80">{label}</div>
            {trend && <div className="text-xs mt-1 opacity-60">{trend}</div>}
        </button>
    )
}

function QuickAction({ icon: Icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors group"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-text-secondary" />
                <span className="text-sm">{label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    )
}
