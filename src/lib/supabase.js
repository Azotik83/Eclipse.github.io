import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérifier la configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase non configuré ! Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env')
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        autoRefreshToken: true,
        persistSession: true
    }
})

// Export pour vérifier la connexion
export const checkConnection = async () => {
    try {
        const { error } = await supabase.from('profiles').select('count').limit(1)
        return !error
    } catch {
        return false
    }
}

// Log de connexion
if (supabaseUrl) {
    console.log('🌙 Eclipse - Connecté à Supabase:', supabaseUrl)
}
