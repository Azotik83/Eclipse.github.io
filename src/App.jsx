import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './components/layout/MainLayout'
import AuthPage from './pages/Auth/AuthPage'
import Nexus from './pages/Nexus/Nexus'
import Channels from './pages/Channels/Channels'
import Events from './pages/Events/Events'
import Profile from './pages/Profile/Profile'
import Leaderboard from './pages/Leaderboard/Leaderboard'
import Staff from './pages/Staff/Staff'
import DirectMessages from './pages/DM/DirectMessages'
import OnboardingModal from './components/onboarding/OnboardingModal'
import { isCurrentlyBanned } from './lib/moderation'

function App() {
    const { user, profile, isLoading, completeOnboarding } = useAuthStore()
    const [showOnboarding, setShowOnboarding] = useState(true)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary">Chargement d'Eclipse...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <AuthPage />
    }

    // Check if user is banned
    if (isCurrentlyBanned(profile)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="glass-elevated rounded-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🚫</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-red-400">Compte Banni</h1>
                    <p className="text-text-secondary mb-4">
                        Ton compte a été banni de la communauté Eclipse.
                    </p>
                    {profile?.banned_until && (
                        <p className="text-sm text-text-secondary">
                            Fin du bannissement: {new Date(profile.banned_until).toLocaleString('fr-FR')}
                        </p>
                    )}
                    <button
                        onClick={() => useAuthStore.getState().signOut()}
                        className="mt-6 btn-primary"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        )
    }

    // Show onboarding for new users (only once per account)
    if (profile && !profile.has_completed_onboarding && showOnboarding) {
        return (
            <OnboardingModal
                onComplete={async () => {
                    await completeOnboarding()
                    setShowOnboarding(false)
                }}
            />
        )
    }

    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Navigate to="/nexus" replace />} />
                <Route path="/nexus" element={<Nexus />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/channels/:channelId" element={<Channels />} />
                <Route path="/dm" element={<DirectMessages />} />
                <Route path="/dm/:conversationId" element={<DirectMessages />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<Events />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="*" element={<Navigate to="/nexus" replace />} />
            </Routes>
        </MainLayout>
    )
}

export default App
