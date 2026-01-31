import { useState, useEffect } from 'react'
import { Shield, Users, ScrollText, Search, Ban, Volume2, VolumeX, Crown, ChevronDown, AlertTriangle, Check, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { permissions, getRoleBadge, ROLES, canModifyUserRole, canBanUser } from '../../lib/permissions'
import { getAllUsers, getModerationLogs, banUser, unbanUser, muteUser, unmuteUser, changeUserRole, isCurrentlyBanned, isCurrentlyMuted } from '../../lib/moderation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Staff() {
    const { profile } = useAuthStore()
    const [activeTab, setActiveTab] = useState('users')
    const [users, setUsers] = useState([])
    const [logs, setLogs] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [actionModal, setActionModal] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [usersData, logsData] = await Promise.all([
            getAllUsers(),
            getModerationLogs()
        ])
        setUsers(usersData)
        setLogs(logsData)
        setLoading(false)
    }

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!permissions.canAccessStaffPage(profile)) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Accès Refusé</h2>
                    <p className="text-text-secondary">Cette page est réservée au staff.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Panel Staff</h1>
                        <p className="text-sm text-text-secondary">Gestion des utilisateurs et modération</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-border">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'users'
                            ? 'bg-accent-purple text-white'
                            : 'text-text-secondary hover:bg-surface-hover'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Utilisateurs
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'logs'
                            ? 'bg-accent-purple text-white'
                            : 'text-text-secondary hover:bg-surface-hover'
                        }`}
                >
                    <ScrollText className="w-4 h-4" />
                    Logs Modération
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'users' ? (
                    <UsersTab
                        users={filteredUsers}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        currentUser={profile}
                        onAction={(user, action) => {
                            setSelectedUser(user)
                            setActionModal(action)
                        }}
                        onRefresh={loadData}
                    />
                ) : (
                    <LogsTab logs={logs} />
                )}
            </div>

            {/* Action Modals */}
            {actionModal && selectedUser && (
                <ActionModal
                    user={selectedUser}
                    action={actionModal}
                    currentUser={profile}
                    onClose={() => {
                        setActionModal(null)
                        setSelectedUser(null)
                    }}
                    onSuccess={() => {
                        loadData()
                        setActionModal(null)
                        setSelectedUser(null)
                    }}
                />
            )}
        </div>
    )
}

function UsersTab({ users, searchQuery, setSearchQuery, currentUser, onAction, onRefresh }) {
    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="input pl-10 w-full max-w-md"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Total"
                    value={users.length}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    label="Admins"
                    value={users.filter(u => u.role === 'admin').length}
                    icon={Crown}
                    color="red"
                />
                <StatCard
                    label="Modos"
                    value={users.filter(u => u.role === 'modo').length}
                    icon={Shield}
                    color="blue"
                />
                <StatCard
                    label="Bannis"
                    value={users.filter(u => isCurrentlyBanned(u)).length}
                    icon={Ban}
                    color="orange"
                />
            </div>

            {/* User List */}
            <div className="space-y-2">
                {users.map(user => (
                    <UserRow
                        key={user.id}
                        user={user}
                        currentUser={currentUser}
                        onAction={onAction}
                    />
                ))}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }) {
    const colors = {
        purple: 'from-accent-purple/20 to-transparent text-accent-purple',
        red: 'from-red-500/20 to-transparent text-red-400',
        blue: 'from-blue-500/20 to-transparent text-blue-400',
        orange: 'from-orange-500/20 to-transparent text-orange-400'
    }

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border border-current/20`}>
            <Icon className="w-5 h-5 mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm opacity-80">{label}</div>
        </div>
    )
}

function UserRow({ user, currentUser, onAction }) {
    const [showMenu, setShowMenu] = useState(false)
    const badge = getRoleBadge(user.role, user.is_super_admin)
    const isBanned = isCurrentlyBanned(user)
    const isMuted = isCurrentlyMuted(user)

    return (
        <div className={`p-4 rounded-xl glass flex items-center justify-between ${isBanned ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        user.username?.charAt(0).toUpperCase() || '?'
                    )}
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.display_name || user.username}</span>
                        {badge && (
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${badge.color}`}>
                                {badge.label}
                            </span>
                        )}
                        {isBanned && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                🚫 Banni
                            </span>
                        )}
                        {isMuted && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                🔇 Mute
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-text-secondary">@{user.username}</div>
                </div>
            </div>

            {/* Actions */}
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-surface-hover"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl glass-elevated border border-border shadow-xl z-20">
                            {/* Ban/Unban */}
                            {canBanUser(currentUser, user) && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        onAction(user, isBanned ? 'unban' : 'ban')
                                    }}
                                    className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-surface-hover first:rounded-t-xl ${isBanned ? 'text-green-400' : 'text-red-400'
                                        }`}
                                >
                                    <Ban className="w-4 h-4" />
                                    {isBanned ? 'Débannir' : 'Bannir'}
                                </button>
                            )}

                            {/* Mute/Unmute */}
                            {canBanUser(currentUser, user) && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        onAction(user, isMuted ? 'unmute' : 'mute')
                                    }}
                                    className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-surface-hover ${isMuted ? 'text-green-400' : 'text-orange-400'
                                        }`}
                                >
                                    {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    {isMuted ? 'Unmute' : 'Mute'}
                                </button>
                            )}

                            {/* Change Role */}
                            {canModifyUserRole(currentUser, user) && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        onAction(user, 'role')
                                    }}
                                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-surface-hover text-accent-purple last:rounded-b-xl"
                                >
                                    <Crown className="w-4 h-4" />
                                    Changer rôle
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function LogsTab({ logs }) {
    const actionLabels = {
        ban: { label: 'Bannissement', icon: Ban, color: 'text-red-400' },
        unban: { label: 'Débannissement', icon: Check, color: 'text-green-400' },
        mute: { label: 'Mute', icon: VolumeX, color: 'text-orange-400' },
        unmute: { label: 'Unmute', icon: Volume2, color: 'text-green-400' },
        warn: { label: 'Avertissement', icon: AlertTriangle, color: 'text-yellow-400' },
        delete_message: { label: 'Message supprimé', icon: X, color: 'text-red-400' },
        promote: { label: 'Promotion', icon: Crown, color: 'text-purple-400' },
        demote: { label: 'Rétrogradation', icon: ChevronDown, color: 'text-blue-400' }
    }

    return (
        <div className="space-y-3">
            {logs.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                    <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun log de modération</p>
                </div>
            ) : (
                logs.map(log => {
                    const actionInfo = actionLabels[log.action] || { label: log.action, icon: AlertTriangle, color: 'text-text-secondary' }
                    const Icon = actionInfo.icon

                    return (
                        <div key={log.id} className="p-4 rounded-xl glass flex items-start gap-4">
                            <div className={`p-2 rounded-lg bg-surface ${actionInfo.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{log.moderator?.display_name || 'Système'}</span>
                                    <span className="text-text-secondary">→</span>
                                    <span className="font-semibold">{log.target?.display_name || 'Utilisateur supprimé'}</span>
                                </div>
                                <div className={`text-sm ${actionInfo.color}`}>{actionInfo.label}</div>
                                {log.reason && (
                                    <div className="text-sm text-text-secondary mt-1">Raison: {log.reason}</div>
                                )}
                                <div className="text-xs text-text-secondary mt-2">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

function ActionModal({ user, action, currentUser, onClose, onSuccess }) {
    const [reason, setReason] = useState('')
    const [duration, setDuration] = useState('60')
    const [newRole, setNewRole] = useState(user.role)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        let result

        switch (action) {
            case 'ban':
                result = await banUser(currentUser.id, user.id, reason, parseInt(duration) || null)
                break
            case 'unban':
                result = await unbanUser(currentUser.id, user.id, reason)
                break
            case 'mute':
                result = await muteUser(currentUser.id, user.id, reason, parseInt(duration))
                break
            case 'unmute':
                result = await unmuteUser(currentUser.id, user.id)
                break
            case 'role':
                result = await changeUserRole(currentUser.id, user.id, newRole)
                break
        }

        setLoading(false)
        if (result?.success) {
            onSuccess()
        }
    }

    const titles = {
        ban: 'Bannir l\'utilisateur',
        unban: 'Débannir l\'utilisateur',
        mute: 'Mute l\'utilisateur',
        unmute: 'Unmute l\'utilisateur',
        role: 'Changer le rôle'
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-elevated rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{titles[action]}</h3>
                <p className="text-text-secondary mb-4">
                    Cible: <span className="text-text-primary font-medium">{user.display_name || user.username}</span>
                </p>

                {(action === 'ban' || action === 'mute') && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm text-text-secondary mb-2">Raison</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="input w-full"
                                placeholder="Raison de la sanction..."
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-text-secondary mb-2">
                                Durée {action === 'ban' ? '(heures, vide = permanent)' : '(minutes)'}
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="input w-full"
                                placeholder={action === 'ban' ? 'Permanent' : '60'}
                            />
                        </div>
                    </>
                )}

                {action === 'role' && (
                    <div className="mb-4">
                        <label className="block text-sm text-text-secondary mb-2">Nouveau rôle</label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="input w-full"
                        >
                            <option value="user">Membre</option>
                            <option value="modo">Modérateur</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-surface-hover"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Chargement...' : 'Confirmer'}
                    </button>
                </div>
            </div>
        </div>
    )
}
