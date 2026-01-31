import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    User, Camera, Edit2, Save, X, UserPlus, UserMinus, MessageSquare,
    Shield, Ban, Lock, Unlock, MapPin, Calendar, Hash, Plus, Check
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useFriends, useBlocks } from '../../hooks/useRealtimeDMs'
import { supabase } from '../../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getRoleBadge, isStaff, canBanUser } from '../../lib/permissions'

export default function Profile() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { profile: currentUser, updateProfile } = useAuthStore()

    const [viewProfile, setViewProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({})
    const [newInterest, setNewInterest] = useState('')
    const [saving, setSaving] = useState(false)

    const isOwnProfile = !userId || userId === currentUser?.id
    const profileToShow = isOwnProfile ? currentUser : viewProfile

    const { friends, pendingRequests, sentRequests, sendFriendRequest, removeFriend } = useFriends(currentUser?.id)
    const { blockedUsers, blockUser, unblockUser, isBlocked } = useBlocks(currentUser?.id)

    // Check friend status
    const isFriend = friends.some(f => f.id === profileToShow?.id)
    const hasPendingRequest = sentRequests.some(r => r.addressee?.id === profileToShow?.id)
    const hasReceivedRequest = pendingRequests.some(r => r.requester?.id === profileToShow?.id)

    // Load profile if viewing someone else's
    useEffect(() => {
        const loadProfile = async () => {
            if (!userId || userId === currentUser?.id) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error) {
                setViewProfile(data)
            }
            setLoading(false)
        }

        loadProfile()
    }, [userId, currentUser?.id])

    // Initialize edit data
    useEffect(() => {
        if (currentUser && isOwnProfile) {
            setEditData({
                display_name: currentUser.display_name || '',
                bio: currentUser.bio || '',
                interests: currentUser.interests || [],
                is_public: currentUser.is_public !== false
            })
        }
    }, [currentUser, isOwnProfile])

    const handleSave = async () => {
        setSaving(true)
        await updateProfile(editData)
        setIsEditing(false)
        setSaving(false)
    }

    const addInterest = () => {
        if (newInterest.trim() && editData.interests.length < 10) {
            setEditData(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim().toLowerCase()]
            }))
            setNewInterest('')
        }
    }

    const removeInterest = (index) => {
        setEditData(prev => ({
            ...prev,
            interests: prev.interests.filter((_, i) => i !== index)
        }))
    }

    const handleBannerUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Le fichier doit être une image')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB')
            return
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${currentUser.id}/banner.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(fileName, file, { upsert: true })

        if (uploadError) {
            console.error('Erreur upload:', uploadError)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(fileName)

        await updateProfile({ banner_url: publicUrl })
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) return
        if (file.size > 2 * 1024 * 1024) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${currentUser.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(fileName, file, { upsert: true })

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName)

            await updateProfile({ avatar_url: publicUrl })
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!profileToShow) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Profil non trouvé</p>
                </div>
            </div>
        )
    }

    // Check if profile is private and not authorized to view
    if (!isOwnProfile && !profileToShow.is_public && !isFriend && !isStaff(currentUser)) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                    <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-bold mb-2">Profil Privé</p>
                    <p>Ce profil n'est visible que par ses amis</p>
                </div>
            </div>
        )
    }

    const badge = getRoleBadge(profileToShow.role, profileToShow.is_super_admin)

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Banner */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-accent-purple/30 to-accent-blue/30">
                {profileToShow.banner_url && (
                    <img
                        src={profileToShow.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                )}

                {isOwnProfile && (
                    <label className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 cursor-pointer transition-colors">
                        <Camera className="w-5 h-5" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            {/* Profile Info */}
            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center border-4 border-background shadow-xl">
                            {profileToShow.avatar_url ? (
                                <img src={profileToShow.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-white">
                                    {profileToShow.username?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        {isOwnProfile && (
                            <label className="absolute bottom-0 right-0 p-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 cursor-pointer transition-colors">
                                <Camera className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-4 md:pt-12">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.display_name}
                                    onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                                    className="input text-2xl font-bold py-1"
                                    placeholder="Nom d'affichage"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold">{profileToShow.display_name || profileToShow.username}</h1>
                            )}
                            {badge && (
                                <span className={`px-2 py-1 rounded-lg text-sm ${badge.color}`}>
                                    {badge.label}
                                </span>
                            )}
                            {!profileToShow.is_public && (
                                <span className="px-2 py-1 rounded-lg text-sm bg-surface text-text-secondary flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Privé
                                </span>
                            )}
                        </div>
                        <p className="text-text-secondary mb-4">@{profileToShow.username}</p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-lg border border-border hover:bg-surface-hover"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Modifier le profil
                                    </button>
                                )
                            ) : (
                                <>
                                    {/* Friend Actions */}
                                    {isFriend ? (
                                        <button
                                            onClick={() => removeFriend(profileToShow.id)}
                                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                            Retirer des amis
                                        </button>
                                    ) : hasPendingRequest ? (
                                        <button disabled className="px-4 py-2 rounded-lg bg-surface text-text-secondary flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Demande envoyée
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => sendFriendRequest(profileToShow.id)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Ajouter en ami
                                        </button>
                                    )}

                                    {/* Message */}
                                    <button
                                        onClick={() => navigate('/dm')}
                                        className="px-4 py-2 rounded-lg border border-border hover:bg-surface-hover flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </button>

                                    {/* Block */}
                                    {isBlocked(profileToShow.id) ? (
                                        <button
                                            onClick={() => unblockUser(profileToShow.id)}
                                            className="px-4 py-2 rounded-lg border border-accent-green/30 text-accent-green hover:bg-accent-green/10 flex items-center gap-2"
                                        >
                                            <Unlock className="w-4 h-4" />
                                            Débloquer
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => blockUser(profileToShow.id)}
                                            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover flex items-center gap-2"
                                        >
                                            <Ban className="w-4 h-4" />
                                            Bloquer
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio & Interests */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Bio */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-accent-purple" />
                            À propos
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={editData.bio}
                                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value.substring(0, 300) }))}
                                className="input w-full h-32 resize-none"
                                placeholder="Parle de toi..."
                            />
                        ) : (
                            <p className="text-text-secondary">
                                {profileToShow.bio || 'Aucune bio pour le moment'}
                            </p>
                        )}

                        {/* Privacy Toggle */}
                        {isEditing && (
                            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-surface">
                                <div className="flex items-center gap-2">
                                    {editData.is_public ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    <span className="text-sm">Profil {editData.is_public ? 'public' : 'privé'}</span>
                                </div>
                                <button
                                    onClick={() => setEditData(prev => ({ ...prev, is_public: !prev.is_public }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${editData.is_public ? 'bg-accent-green' : 'bg-surface-hover'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${editData.is_public ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Interests */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-accent-purple" />
                            Centres d'intérêts
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {(isEditing ? editData.interests : profileToShow.interests)?.map((interest, i) => (
                                <span
                                    key={i}
                                    className={`px-3 py-1 rounded-full text-sm ${isEditing
                                            ? 'bg-accent-purple/20 text-accent-purple flex items-center gap-1'
                                            : 'bg-surface text-text-secondary'
                                        }`}
                                >
                                    #{interest}
                                    {isEditing && (
                                        <button onClick={() => removeInterest(i)} className="ml-1 hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </span>
                            ))}

                            {isEditing && editData.interests.length < 10 && (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value.substring(0, 20))}
                                        onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                                        placeholder="Ajouter..."
                                        className="w-24 px-2 py-1 rounded-full bg-surface text-sm"
                                    />
                                    <button onClick={addInterest} className="p-1 rounded-full hover:bg-surface-hover">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {!isEditing && (!profileToShow.interests || profileToShow.interests.length === 0) && (
                                <span className="text-text-secondary text-sm">Aucun intérêt renseigné</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Friends List */}
                {isOwnProfile && friends.length > 0 && (
                    <div className="glass rounded-2xl p-6 mt-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-accent-purple" />
                            Amis ({friends.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {friends.map(friend => (
                                <button
                                    key={friend.id}
                                    onClick={() => navigate(`/profile/${friend.id}`)}
                                    className="p-3 rounded-xl hover:bg-surface-hover transition-colors flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold">{friend.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm truncate">{friend.display_name || friend.username}</div>
                                        <div className="text-xs text-text-secondary">@{friend.username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
                    <div className="glass rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent-purple">{profileToShow.shadow_points || 0}</div>
                        <div className="text-sm text-text-secondary">Points d'Ombre</div>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent-green">{profileToShow.level || 1}</div>
                        <div className="text-sm text-text-secondary">Niveau</div>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent-blue">
                            {formatDistanceToNow(new Date(profileToShow.created_at), { locale: fr })}
                        </div>
                        <div className="text-sm text-text-secondary">Membre depuis</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
