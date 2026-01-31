// Système de permissions pour Eclipse
// Gère les rôles: user, modo, admin, super_admin

export const ROLES = {
    USER: 'user',
    MODO: 'modo',
    ADMIN: 'admin'
}

export const ROLE_HIERARCHY = {
    user: 0,
    modo: 1,
    admin: 2
}

// Vérifier si un utilisateur a au moins un certain rôle
export function hasRole(profile, requiredRole) {
    if (!profile) return false

    const userLevel = ROLE_HIERARCHY[profile.role] || 0
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0

    return userLevel >= requiredLevel
}

// Vérifier si c'est un super admin
export function isSuperAdmin(profile) {
    return profile?.is_super_admin === true
}

// Vérifier si c'est un admin (ou super admin)
export function isAdmin(profile) {
    return hasRole(profile, ROLES.ADMIN) || isSuperAdmin(profile)
}

// Vérifier si c'est un modo (ou plus)
export function isModerator(profile) {
    return hasRole(profile, ROLES.MODO)
}

// Vérifier si c'est du staff (modo ou admin)
export function isStaff(profile) {
    return isModerator(profile)
}

// Permissions spécifiques
export const permissions = {
    // Gestion des utilisateurs
    canPromoteUsers: (profile) => isAdmin(profile),
    canDemoteUsers: (profile) => isAdmin(profile),
    canBanUsers: (profile) => isModerator(profile),
    canMuteUsers: (profile) => isModerator(profile),

    // Messages
    canDeleteAnyMessage: (profile) => isModerator(profile),
    canEditOwnMessage: (profile) => !!profile,

    // Événements
    canCreateEvents: (profile) => isAdmin(profile),
    canEditEvents: (profile) => isAdmin(profile),
    canDeleteEvents: (profile) => isAdmin(profile),

    // Staff page
    canAccessStaffPage: (profile) => isStaff(profile),
    canViewModerationLogs: (profile) => isStaff(profile),

    // Preuves
    canValidateProofs: (profile) => isModerator(profile)
}

// Vérifier si un utilisateur peut modifier le rôle d'un autre
export function canModifyUserRole(actor, target) {
    // Super admin ne peut pas être modifié
    if (target?.is_super_admin) return false

    // Seuls les admins peuvent modifier les rôles
    if (!isAdmin(actor)) return false

    // On ne peut pas modifier quelqu'un de même niveau ou supérieur
    // (sauf si on est super admin)
    if (!isSuperAdmin(actor)) {
        const actorLevel = ROLE_HIERARCHY[actor.role] || 0
        const targetLevel = ROLE_HIERARCHY[target.role] || 0
        if (targetLevel >= actorLevel) return false
    }

    return true
}

// Vérifier si un utilisateur peut bannir un autre
export function canBanUser(actor, target) {
    // Super admin ne peut pas être banni
    if (target?.is_super_admin) return false

    // Il faut être au moins modo
    if (!isModerator(actor)) return false

    // On ne peut pas bannir quelqu'un de même niveau ou supérieur
    const actorLevel = ROLE_HIERARCHY[actor.role] || 0
    const targetLevel = ROLE_HIERARCHY[target.role] || 0

    return actorLevel > targetLevel || isSuperAdmin(actor)
}

// Obtenir le label d'un rôle
export function getRoleLabel(role) {
    switch (role) {
        case 'admin': return 'Admin'
        case 'modo': return 'Modérateur'
        case 'user': return 'Membre'
        default: return 'Membre'
    }
}

// Obtenir la couleur d'un rôle
export function getRoleColor(role, isSuperAdmin = false) {
    if (isSuperAdmin) return 'text-yellow-400'
    switch (role) {
        case 'admin': return 'text-red-400'
        case 'modo': return 'text-blue-400'
        default: return 'text-text-primary'
    }
}

// Obtenir le badge d'un rôle
export function getRoleBadge(role, isSuperAdmin = false) {
    if (isSuperAdmin) return { label: '👑 Super Admin', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    switch (role) {
        case 'admin': return { label: '⚡ Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
        case 'modo': return { label: '🛡️ Modo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
        default: return null
    }
}
