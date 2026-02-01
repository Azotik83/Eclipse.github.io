import { useState } from 'react'
import { Volume2, Plus, Users, Mic, MicOff, PhoneOff, Headphones } from 'lucide-react'
import { useVoiceRooms } from '../../hooks/useVoiceRooms'

export default function VoiceChannel({ channel, profile }) {
    const { rooms, loading, createRoom, joinRoom, leaveRoom } = useVoiceRooms(channel.id)
    const [newRoomName, setNewRoomName] = useState('')
    const [showCreate, setShowCreate] = useState(false)

    const handleCreateRoom = async (e) => {
        e.preventDefault()
        if (!newRoomName.trim()) return

        await createRoom(newRoomName, profile.id)
        setNewRoomName('')
        setShowCreate(false)
    }

    // Trouver si l'utilisateur est dans un salon
    const currentRoom = rooms.find(room =>
        room.participants?.some(p => p.user_id === profile.id)
    )

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border glass flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-purple/20 flex items-center justify-center text-xl">
                        {channel.icon || '🔊'}
                    </div>
                    <div>
                        <h2 className="font-bold">{channel.name}</h2>
                        <p className="text-xs text-text-secondary">{channel.description}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Current Room Banner */}
                        {currentRoom && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-green/20 to-accent-blue/20 border border-accent-green/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center">
                                            <Volume2 className="w-6 h-6 text-accent-green animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-accent-green font-medium">Tu es connecté à</p>
                                            <p className="font-bold text-lg">{currentRoom.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => leaveRoom(currentRoom.id, profile.id)}
                                        className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                        <PhoneOff className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Create Room */}
                        <div className="p-6 rounded-2xl glass-elevated border border-border">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-accent-purple" />
                                Créer un salon vocal
                            </h3>

                            {showCreate ? (
                                <form onSubmit={handleCreateRoom} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder="Nom du salon..."
                                        className="input flex-1"
                                        autoFocus
                                    />
                                    <button type="submit" className="btn-primary">
                                        Créer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="btn-secondary"
                                    >
                                        Annuler
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-accent-purple/50 text-text-secondary hover:text-accent-purple transition-all"
                                >
                                    <Plus className="w-6 h-6 mx-auto mb-2" />
                                    <p>Clique pour créer un nouveau salon</p>
                                </button>
                            )}
                        </div>

                        {/* Active Rooms */}
                        {rooms.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Headphones className="w-5 h-5" />
                                    Salons actifs
                                </h3>

                                {rooms.map(room => (
                                    <VoiceRoomCard
                                        key={room.id}
                                        room={room}
                                        profile={profile}
                                        isInRoom={currentRoom?.id === room.id}
                                        onJoin={() => joinRoom(room.id, profile.id)}
                                        onLeave={() => leaveRoom(room.id, profile.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {rooms.length === 0 && !currentRoom && (
                            <div className="text-center py-12 text-text-secondary">
                                <Volume2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Aucun salon vocal actif</p>
                                <p className="text-sm">Crée le premier salon pour discuter en live !</p>
                            </div>
                        )}

                        {/* Info Note */}
                        <div className="p-4 rounded-xl bg-surface border border-border text-center">
                            <p className="text-sm text-text-secondary">
                                ⚡ <strong>Note :</strong> Les salons vocaux sont actuellement en mode lobby.
                                L'audio en temps réel sera disponible prochainement !
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function VoiceRoomCard({ room, profile, isInRoom, onJoin, onLeave }) {
    const participantCount = room.participants?.length || 0

    return (
        <div className={`p-4 rounded-xl glass-elevated border ${isInRoom ? 'border-accent-green/50' : 'border-border'} transition-all`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isInRoom ? 'bg-accent-green/20' : 'bg-surface'}`}>
                        <Volume2 className={`w-5 h-5 ${isInRoom ? 'text-accent-green animate-pulse' : 'text-text-secondary'}`} />
                    </div>
                    <div>
                        <p className="font-bold">{room.name}</p>
                        <p className="text-xs text-text-secondary">
                            Créé par {room.creator?.display_name || room.creator?.username}
                        </p>
                    </div>
                </div>

                {isInRoom ? (
                    <button
                        onClick={onLeave}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                        <PhoneOff className="w-4 h-4" />
                        Quitter
                    </button>
                ) : (
                    <button
                        onClick={onJoin}
                        className="px-4 py-2 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors flex items-center gap-2"
                    >
                        <Headphones className="w-4 h-4" />
                        Rejoindre
                    </button>
                )}
            </div>

            {/* Participants */}
            {participantCount > 0 && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <div className="flex items-center gap-1">
                        {room.participants?.slice(0, 5).map(p => (
                            <div
                                key={p.id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center border-2 border-surface -ml-1 first:ml-0"
                                title={p.user?.display_name || p.user?.username}
                            >
                                {p.user?.avatar_url ? (
                                    <img src={p.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-white">
                                        {p.user?.username?.[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                                {p.is_muted && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                        <MicOff className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {participantCount > 5 && (
                            <span className="text-sm text-text-secondary ml-2">
                                +{participantCount - 5}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
