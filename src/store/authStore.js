import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,

    // Initialisation - récupérer la session existante
    initialize: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('❌ Erreur récupération session:', error)
                set({ user: null, profile: null, isLoading: false })
                return
            }

            if (session?.user) {
                console.log('✅ Session trouvée:', session.user.email)
                const profile = await get().fetchProfile(session.user.id)
                set({ user: session.user, profile, isLoading: false })
            } else {
                set({ user: null, profile: null, isLoading: false })
            }

            // Écouter les changements d'authentification
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔄 Auth state change:', event)

                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await get().fetchProfile(session.user.id)
                    set({ user: session.user, profile })
                } else if (event === 'SIGNED_OUT') {
                    set({ user: null, profile: null })
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    set({ user: session.user })
                }
            })
        } catch (error) {
            console.error('❌ Erreur initialisation:', error)
            set({ user: null, profile: null, isLoading: false })
        }
    },

    // Récupérer le profil utilisateur
    fetchProfile: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('❌ Erreur récupération profil:', error)
                return null
            }

            console.log('✅ Profil récupéré:', data.username)
            return data
        } catch (error) {
            console.error('❌ Erreur fetchProfile:', error)
            return null
        }
    },

    // Inscription
    signUp: async (email, password, username) => {
        set({ isLoading: true })

        try {
            console.log('📝 Inscription:', email)

            // Créer le compte auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            })

            if (error) {
                console.error('❌ Erreur inscription:', error)
                set({ isLoading: false })
                return { error }
            }

            if (!data.user) {
                set({ isLoading: false })
                return { error: { message: 'Erreur création compte' } }
            }

            // Créer le profil dans la table profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    username,
                    display_name: username,
                    role: 'user'
                })

            if (profileError) {
                console.error('❌ Erreur création profil:', profileError)
                // Ne pas bloquer, le profil peut exister via trigger
            }

            // Si confirmation email requise
            if (data.user.identities?.length === 0 || !data.session) {
                console.log('📧 Confirmation email requise')
                set({ isLoading: false })
                return {
                    error: null,
                    message: 'Vérifie ta boîte mail pour confirmer ton compte !'
                }
            }

            // Connexion automatique
            const profile = await get().fetchProfile(data.user.id)
            set({ user: data.user, profile, isLoading: false })
            console.log('✅ Inscription réussie:', email)

            return { error: null }
        } catch (error) {
            console.error('❌ Erreur signUp:', error)
            set({ isLoading: false })
            return { error }
        }
    },

    // Connexion
    signIn: async (email, password) => {
        set({ isLoading: true })

        try {
            console.log('🔐 Connexion:', email)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                console.error('❌ Erreur connexion:', error)
                set({ isLoading: false })
                return { error }
            }

            console.log('✅ Connecté:', data.user.email)

            const profile = await get().fetchProfile(data.user.id)

            // Créer profil si inexistant (migration d'anciens utilisateurs)
            if (!profile) {
                console.log('📝 Création profil manquant...')
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    username: data.user.email.split('@')[0],
                    display_name: data.user.email.split('@')[0],
                    role: 'user'
                })
                const newProfile = await get().fetchProfile(data.user.id)
                set({ user: data.user, profile: newProfile, isLoading: false })
            } else {
                set({ user: data.user, profile, isLoading: false })
            }

            return { error: null }
        } catch (error) {
            console.error('❌ Erreur signIn:', error)
            set({ isLoading: false })
            return { error }
        }
    },

    // Déconnexion
    signOut: async () => {
        try {
            await supabase.auth.signOut()
            set({ user: null, profile: null })
            console.log('👋 Déconnecté')
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error)
        }
    },

    // Mettre à jour le profil
    updateProfile: async (updates) => {
        const { profile } = get()
        if (!profile) return { error: 'Non connecté' }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id)
                .select()
                .single()

            if (error) {
                console.error('❌ Erreur mise à jour profil:', error)
                return { error: error.message }
            }

            set({ profile: data })
            console.log('✅ Profil mis à jour')
            return { error: null }
        } catch (error) {
            console.error('❌ Erreur updateProfile:', error)
            return { error: error.message }
        }
    },

    // Rafraîchir le profil
    refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        const profile = await get().fetchProfile(user.id)
        set({ profile })
    },

    // Marquer onboarding comme complété
    completeOnboarding: async () => {
        const { profile } = get()
        if (!profile) return

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ has_completed_onboarding: true })
                .eq('id', profile.id)
                .select()
                .single()

            if (!error) {
                set({ profile: data })
                console.log('✅ Onboarding terminé')
            }
        } catch (error) {
            console.error('❌ Erreur onboarding:', error)
        }
    }
}))

// Initialiser au chargement
useAuthStore.getState().initialize()
