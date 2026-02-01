import { NavLink } from 'react-router-dom'
import {
    Home,
    MessageSquare,
    Trophy,
    Calendar,
    User,
    Settings,
    Zap,
    Moon,
    Shield,
    Mail
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isStaff, getRoleBadge } from '../../lib/permissions'

const navItems = [
    { path: '/nexus', icon: Home, label: 'Nexus', description: 'Tableau de bord', tourId: 'nexus' },
    { path: '/channels', icon: MessageSquare, label: 'Secteurs', description: 'Chat communautaire', tourId: 'channels' },
    { path: '/dm', icon: Mail, label: 'Messages', description: 'Conversations privées', tourId: 'messages' },
    { path: '/events', icon: Calendar, label: 'Arènes', description: 'Défis & Événements', tourId: 'events' },
    { path: '/leaderboard', icon: Trophy, label: 'Chasse', description: 'Classement', tourId: 'leaderboard' },
    { path: '/profile', icon: User, label: 'Profil', description: 'Mon espace', tourId: 'profile' },
]

export default function Sidebar() {
    const { profile, signOut } = useAuthStore()
    const badge = getRoleBadge(profile?.role, profile?.is_super_admin)

    return (
        <aside className="w-72 h-full glass flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                        <Moon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient">Eclipse</h1>
                        <p className="text-xs text-text-secondary">L'Éveil des Ombres</p>
                    </div>
                </div>
            </div>

            {/* Points d'Ombre */}
            <div
                className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30"
                data-tour="points"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent-purple" />
                        <span className="text-sm text-text-secondary">Points d'Ombre</span>
                    </div>
                    <span className="text-xl font-bold font-mono text-accent-purple">
                        {profile?.shadow_points || 0}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label, description, tourId }) => (
                    <NavLink
                        key={path}
                        to={path}
                        data-tour={tourId}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive
                                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                                : 'hover:bg-surface-elevated text-text-secondary hover:text-text-primary'
                            }
            `}
                    >
                        <Icon className="w-5 h-5" />
                        <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-xs opacity-60">{description}</p>
                        </div>
                    </NavLink>
                ))}

                {/* Staff Link - Only visible to staff */}
                {isStaff(profile) && (
                    <NavLink
                        to="/staff"
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 border-t border-border pt-5
              ${isActive
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'hover:bg-surface-elevated text-red-400/70 hover:text-red-400'
                            }
            `}
                    >
                        <Shield className="w-5 h-5" />
                        <div>
                            <p className="font-medium">Staff</p>
                            <p className="text-xs opacity-60">Modération</p>
                        </div>
                    </NavLink>
                )}
            </nav>

            {/* User Profile Quick */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-elevated transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-green flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold">
                                {profile?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{profile?.display_name || 'Utilisateur'}</p>
                            {badge && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                                    {profile?.is_super_admin ? '👑' : profile?.role === 'admin' ? '⚡' : '🛡️'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">@{profile?.username || 'inconnu'}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
                        title="Déconnexion"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
