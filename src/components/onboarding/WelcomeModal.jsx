import { Moon, Sparkles, Target, Flame, Heart, ArrowRight, X } from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext'

export default function WelcomeModal() {
    const { startTour, skipOnboarding } = useOnboarding()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Skip Button */}
            <button
                onClick={skipOnboarding}
                className="absolute top-6 right-6 p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="relative z-10 max-w-lg w-full text-center">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-accent-purple via-accent-blue to-accent-purple flex items-center justify-center shadow-2xl shadow-accent-purple/30 animate-float">
                        <Moon className="w-16 h-16 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text text-transparent">
                    Bienvenue dans Eclipse
                </h1>
                <p className="text-xl text-text-secondary mb-10">L'Éveil des Ombres</p>

                {/* Description */}
                <p className="text-lg text-text-secondary mb-10 leading-relaxed">
                    Tu rejoins une communauté d'individus déterminés à se dépasser, ensemble.
                    Voici ce qui nous unit :
                </p>

                {/* Values */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="p-4 rounded-2xl bg-surface/50 border border-accent-purple/20">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-accent-purple mb-1">Dépassement</h3>
                        <p className="text-xs text-text-secondary">Repousse tes limites</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface/50 border border-accent-blue/20">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-accent-blue mb-1">Discipline</h3>
                        <p className="text-xs text-text-secondary">Forge ton mental</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface/50 border border-accent-green/20">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent-green to-accent-purple flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-accent-green mb-1">Entraide</h3>
                        <p className="text-xs text-text-secondary">Avance ensemble</p>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={startTour}
                    className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-lg shadow-xl shadow-accent-purple/30 hover:shadow-2xl hover:shadow-accent-purple/40 transition-all duration-300 hover:scale-105"
                >
                    <Sparkles className="w-5 h-5" />
                    Découvrir Eclipse
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="mt-6 text-sm text-text-secondary">
                    Un tour rapide de 30 secondes
                </p>
            </div>
        </div>
    )
}
