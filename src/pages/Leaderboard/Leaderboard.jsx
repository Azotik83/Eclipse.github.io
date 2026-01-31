import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Medal, Crown, TrendingUp, Zap, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getRoleBadge } from '../../lib/permissions'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Leaderboard() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('all') // 'all', 'week', 'month'

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url, shadow_points, level, role, is_super_admin, created_at')
                .eq('is_banned', false)
                .order('shadow_points', { ascending: false })
                .limit(50)

            if (!error) {
                setUsers(data || [])
            }
            setLoading(false)
        }

        loadLeaderboard()
    }, [period])

    const topThree = users.slice(0, 3)
    const rest = users.slice(3)

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-border glass">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Classement</h1>
                            <p className="text-sm text-text-secondary">Les meilleurs chasseurs d'ombre</p>
                        </div>
                    </div>
                </div>

                {/* Period Filter */}
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'Tout temps' },
                        { id: 'month', label: 'Ce mois' },
                        { id: 'week', label: 'Cette semaine' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${period === p.id
                                    ? 'bg-accent-purple text-white'
                                    : 'text-text-secondary hover:bg-surface-hover'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun utilisateur pour le moment</p>
                </div>
            ) : (
                <div className="p-6">
                    {/* Top 3 Podium */}
                    <div className="flex justify-center items-end gap-4 mb-8">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <PodiumCard
                                user={topThree[1]}
                                rank={2}
                                onClick={() => navigate(`/profile/${topThree[1].id}`)}
                            />
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <PodiumCard
                                user={topThree[0]}
                                rank={1}
                                onClick={() => navigate(`/profile/${topThree[0].id}`)}
                            />
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <PodiumCard
                                user={topThree[2]}
                                rank={3}
                                onClick={() => navigate(`/profile/${topThree[2].id}`)}
                            />
                        )}
                    </div>

                    {/* Rest of Leaderboard */}
                    <div className="space-y-2">
                        {rest.map((user, index) => (
                            <LeaderboardRow
                                key={user.id}
                                user={user}
                                rank={index + 4}
                                onClick={() => navigate(`/profile/${user.id}`)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function PodiumCard({ user, rank, onClick }) {
    const badge = getRoleBadge(user.role, user.is_super_admin)

    const rankConfig = {
        1: {
            height: 'h-40',
            icon: Crown,
            gradient: 'from-yellow-500 to-amber-500',
            glow: 'shadow-lg shadow-yellow-500/30'
        },
        2: {
            height: 'h-32',
            icon: Medal,
            gradient: 'from-gray-400 to-gray-500',
            glow: ''
        },
        3: {
            height: 'h-28',
            icon: Medal,
            gradient: 'from-amber-700 to-amber-800',
            glow: ''
        }
    }

    const config = rankConfig[rank]
    const Icon = config.icon

    return (
        <button
            onClick={onClick}
            className={`glass rounded-2xl p-4 flex flex-col items-center ${config.glow} hover:scale-[1.02] transition-transform w-36`}
        >
            <div className={`relative mb-2`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-white">
                            {user.username?.[0]?.toUpperCase()}
                        </span>
                    )}
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>

            <div className="text-center">
                <div className="font-bold text-sm truncate max-w-full">
                    {user.display_name || user.username}
                </div>
                {badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                        {user.is_super_admin ? '👑' : user.role === 'admin' ? '⚡' : '🛡️'}
                    </span>
                )}
                <div className="flex items-center justify-center gap-1 text-accent-purple mt-1">
                    <Zap className="w-3 h-3" />
                    <span className="font-bold text-sm">{user.shadow_points || 0}</span>
                </div>
            </div>
        </button>
    )
}

function LeaderboardRow({ user, rank, onClick }) {
    const badge = getRoleBadge(user.role, user.is_super_admin)

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-xl glass hover:bg-surface-hover transition-colors"
        >
            <div className="w-8 font-bold text-text-secondary">#{rank}</div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-sm font-bold text-white">
                        {user.username?.[0]?.toUpperCase()}
                    </span>
                )}
            </div>

            <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{user.display_name || user.username}</span>
                    {badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <div className="text-xs text-text-secondary">@{user.username}</div>
            </div>

            <div className="flex items-center gap-2 text-accent-purple">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{user.shadow_points || 0}</span>
            </div>

            <div className="text-sm text-text-secondary">
                Niv. {user.level || 1}
            </div>
        </button>
    )
}
