import { useState } from 'react'
import { FileText, Plus, MessageSquare, Pin, Tag, ArrowLeft, Send, X } from 'lucide-react'
import { useForumPosts, useForumPost } from '../../hooks/useForumPosts'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getRoleBadge } from '../../lib/permissions'

export default function ForumChannel({ channel, profile }) {
    const [selectedPostId, setSelectedPostId] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    if (selectedPostId) {
        return (
            <ForumPostView
                postId={selectedPostId}
                profile={profile}
                onBack={() => setSelectedPostId(null)}
            />
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border glass flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-blue/20 flex items-center justify-center text-xl">
                        {channel.icon || '📄'}
                    </div>
                    <div>
                        <h2 className="font-bold">{channel.name}</h2>
                        <p className="text-xs text-text-secondary">{channel.description}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau post
                </button>
            </div>

            {/* Posts List */}
            <ForumPostsList
                channelId={channel.id}
                onSelectPost={setSelectedPostId}
            />

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePostModal
                    channelId={channel.id}
                    userId={profile.id}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    )
}

function ForumPostsList({ channelId, onSelectPost }) {
    const { posts, loading } = useForumPosts(channelId)

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>Aucun post dans ce forum</p>
                <p className="text-sm">Crée le premier post !</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {posts.map(post => (
                <ForumPostCard
                    key={post.id}
                    post={post}
                    onClick={() => onSelectPost(post.id)}
                />
            ))}
        </div>
    )
}

function ForumPostCard({ post, onClick }) {
    const user = post.user
    const badge = getRoleBadge(user?.role, user?.is_super_admin)

    return (
        <button
            onClick={onClick}
            className="w-full p-4 rounded-xl glass-elevated border border-border hover:border-accent-purple/30 transition-all text-left group"
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">
                            {user?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Title & Badges */}
                    <div className="flex items-center gap-2 mb-1">
                        {post.is_pinned && (
                            <Pin className="w-4 h-4 text-accent-purple" />
                        )}
                        <h3 className="font-bold text-lg group-hover:text-accent-purple transition-colors truncate">
                            {post.title}
                        </h3>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <span>{user?.display_name || user?.username}</span>
                        {badge && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                                {badge.label}
                            </span>
                        )}
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
                    </div>

                    {/* Content Preview */}
                    <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                        {post.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-text-secondary text-sm">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.reply_count} réponses</span>
                        </div>
                        {post.tags?.length > 0 && (
                            <div className="flex items-center gap-1">
                                {post.tags.slice(0, 3).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 rounded-full text-xs bg-surface text-text-secondary"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    )
}

function ForumPostView({ postId, profile, onBack }) {
    const { post, replies, loading, addReply } = useForumPost(postId)
    const [newReply, setNewReply] = useState('')
    const [sending, setSending] = useState(false)

    const handleReply = async (e) => {
        e.preventDefault()
        if (!newReply.trim() || sending) return

        setSending(true)
        await addReply(newReply, profile.id)
        setNewReply('')
        setSending(false)
    }

    if (loading || !post) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const user = post.user
    const badge = getRoleBadge(user?.role, user?.is_super_admin)

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border glass flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold truncate">{post.title}</h2>
                    <p className="text-xs text-text-secondary">{post.reply_count} réponses</p>
                </div>
            </div>

            {/* Post Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Original Post */}
                <div className="p-4 rounded-xl glass-elevated border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="font-bold text-white">
                                    {user?.username?.[0]?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{user?.display_name || user?.username}</span>
                                {badge && (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${badge.color}`}>
                                        {badge.label}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-text-secondary">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {post.tags?.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                            <Tag className="w-4 h-4 text-text-secondary" />
                            {post.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 rounded-full text-xs bg-accent-purple/20 text-accent-purple"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Replies */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {replies.length} Réponses
                    </h3>

                    {replies.map(reply => (
                        <ReplyItem key={reply.id} reply={reply} />
                    ))}
                </div>
            </div>

            {/* Reply Input */}
            <form onSubmit={handleReply} className="p-4 border-t border-border glass">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Écrire une réponse..."
                        className="input flex-1"
                    />
                    <button
                        type="submit"
                        disabled={!newReply.trim() || sending}
                        className="btn-primary p-3 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

function ReplyItem({ reply }) {
    const user = reply.user
    const badge = getRoleBadge(user?.role, user?.is_super_admin)

    return (
        <div className="flex gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-white">
                        {user?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{user?.display_name || user?.username}</span>
                    {badge && (
                        <span className={`px-1 py-0.5 rounded text-[9px] ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}
                    <span className="text-xs text-text-secondary">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: fr })}
                    </span>
                </div>
                <p className="text-text-primary">{reply.content}</p>
            </div>
        </div>
    )
}

function CreatePostModal({ channelId, userId, onClose }) {
    const { createPost } = useForumPosts(channelId)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tagsInput, setTagsInput] = useState('')
    const [creating, setCreating] = useState(false)

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim() || !content.trim() || creating) return

        setCreating(true)
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        const { error } = await createPost(title, content, tags, userId)

        if (!error) {
            onClose()
        }
        setCreating(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="w-full max-w-lg glass-elevated rounded-2xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-lg">Nouveau Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Un titre accrocheur..."
                            className="input w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Contenu</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Décris ton projet, ta question..."
                            className="input w-full h-32 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Tags (optionnel)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="projet, musique, dev (séparés par des virgules)"
                            className="input w-full"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || creating}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            {creating ? 'Création...' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
