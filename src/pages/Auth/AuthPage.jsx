import { useState } from 'react'
import { Moon, Eye, EyeOff, Mail, Lock, User, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    })
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const { signIn, signUp, isLoading } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        if (isLogin) {
            const result = await signIn(formData.email, formData.password)
            if (result.error) setError(result.error.message)
        } else {
            if (!formData.username) {
                setError('Le nom d\'utilisateur est requis')
                return
            }
            if (formData.password.length < 6) {
                setError('Le mot de passe doit faire au moins 6 caractères')
                return
            }
            const result = await signUp(formData.email, formData.password, formData.username)
            if (result.error) {
                setError(result.error.message)
            } else if (result.message) {
                setSuccessMessage(result.message)
            }
        }
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Section gauche - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-background to-accent-blue/20"></div>

                <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mb-8 animate-float glow-purple">
                        <Moon className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-5xl font-bold mb-4">
                        <span className="text-gradient">Eclipse</span>
                    </h1>

                    <p className="text-xl text-text-secondary mb-8">
                        L'Éveil des Ombres
                    </p>

                    <div className="max-w-md space-y-6 text-text-secondary">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-accent-purple" />
                            </div>
                            <p>Rejoins une communauté soudée de personnes qui veulent se dépasser au quotidien</p>
                        </div>

                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-accent-green" />
                            </div>
                            <p>Partage tes progrès et inspire les autres à travers des défis communs</p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-20 left-20 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
            </div>

            {/* Section droite - Formulaire */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mb-4">
                            <Moon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gradient">Eclipse</h1>
                    </div>

                    {/* Card du formulaire */}
                    <div className="glass-elevated rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-2">
                            {isLogin ? 'Content de te revoir' : 'Rejoins les Ombres'}
                        </h2>
                        <p className="text-text-secondary mb-8">
                            {isLogin
                                ? 'Entre tes identifiants pour continuer'
                                : 'Crée ton compte et commence ton éveil'
                            }
                        </p>

                        {/* Message de succès */}
                        {successMessage && (
                            <div className="mb-6 p-4 rounded-lg bg-accent-green/20 border border-accent-green/30 text-accent-green flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Message d'erreur */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Nom d'utilisateur
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="input pl-12"
                                            placeholder="ShadowMaster"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input pl-12"
                                        placeholder="ton@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input pl-12 pr-12"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-text-secondary mt-1">Minimum 6 caractères</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Chargement...
                                    </span>
                                ) : (
                                    isLogin ? 'Se connecter' : 'Créer mon compte'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-text-secondary">
                                {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin)
                                        setError('')
                                        setSuccessMessage('')
                                    }}
                                    className="ml-2 text-accent-purple hover:text-accent-purple/80 font-medium"
                                >
                                    {isLogin ? "S'inscrire" : 'Se connecter'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
