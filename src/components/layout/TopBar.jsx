import { useState } from 'react'
import { Search, Bell, Minus, Square, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function TopBar() {
    const { profile, signOut } = useAuthStore()
    const [showNotifications, setShowNotifications] = useState(false)

    // Vérifier si on est dans Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI

    const handleMinimize = () => {
        if (isElectron) window.electronAPI.minimizeWindow()
    }

    const handleMaximize = () => {
        if (isElectron) window.electronAPI.maximizeWindow()
    }

    const handleClose = () => {
        if (isElectron) window.electronAPI.closeWindow()
    }

    return (
        <header className="h-14 glass border-b border-border flex items-center justify-between px-4 app-drag">
            {/* Zone de recherche */}
            <div className="flex-1 max-w-md app-no-drag">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border 
                       focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50
                       text-sm text-text-primary placeholder:text-text-secondary transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 app-no-drag">
                {/* Notifications */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                    <Bell className="w-5 h-5 text-text-secondary hover:text-text-primary" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full"></span>
                </button>

                {/* Séparateur */}
                <div className="w-px h-6 bg-border mx-2"></div>

                {/* Contrôles de fenêtre (Electron) */}
                {isElectron && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleMinimize}
                            className="p-2 rounded hover:bg-surface-elevated transition-colors"
                        >
                            <Minus className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                            onClick={handleMaximize}
                            className="p-2 rounded hover:bg-surface-elevated transition-colors"
                        >
                            <Square className="w-3.5 h-3.5 text-text-secondary" />
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded hover:bg-red-500/20 transition-colors group"
                        >
                            <X className="w-4 h-4 text-text-secondary group-hover:text-red-400" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
