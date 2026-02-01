import { useState } from 'react'
import {
    Moon, ArrowRight, ArrowLeft, User, MessageSquare, Calendar,
    Users, Zap, Trophy, Target, Flame, Heart, Sparkles, Rocket,
    Mail, Star
} from 'lucide-react'

const STEPS = [
    {
        id: 'welcome',
        title: "Bienvenue dans Eclipse",
        subtitle: "L'Éveil des Ombres",
        content: (
            <div className="text-center">
                <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent-purple via-accent-blue to-accent-purple flex items-center justify-center shadow-2xl shadow-accent-purple/30">
                    <Moon className="w-14 h-14 text-white" />
                </div>
                <p className="text-lg text-text-primary mb-4 font-medium">
                    Tu viens de rejoindre Eclipse.
                </p>
                <p className="text-text-secondary">
                    Une communauté d'individus déterminés à se dépasser, ensemble.
                    Prends 30 secondes pour découvrir ton nouvel univers.
                </p>
            </div>
        )
    },
    {
        id: 'community',
        title: "Notre Philosophie",
        subtitle: "Ce qui nous unit",
        content: (
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-accent-purple/20">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-accent-purple">Dépassement</h4>
                        <p className="text-sm text-text-secondary">Repousse tes limites chaque jour</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-accent-blue/20">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center flex-shrink-0">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-accent-blue">Discipline</h4>
                        <p className="text-sm text-text-secondary">La régularité forge les champions</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-accent-green/20">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-accent-purple flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-accent-green">Entraide</h4>
                        <p className="text-sm text-text-secondary">On avance plus loin ensemble</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'interface',
        title: "L'Interface",
        subtitle: "Ton espace de progression",
        content: (
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">Nexus</h4>
                        <p className="text-xs text-text-secondary">Ton tableau de bord et statistiques</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">Channels</h4>
                        <p className="text-xs text-text-secondary">Discussion en temps réel avec la communauté</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent-green/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-green" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">Événements</h4>
                        <p className="text-xs text-text-secondary">Défis collectifs et sessions live</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">Classement</h4>
                        <p className="text-xs text-text-secondary">Gagne des points et progresse</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'profile',
        title: "Ton Profil",
        subtitle: "Ta présence dans les ombres",
        content: (
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Personnalise ton identité</h4>
                        <p className="text-sm text-text-secondary">
                            Avatar, bannière, bio et centres d'intérêts. Montre qui tu es.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-accent-green" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Connecte-toi aux autres</h4>
                        <p className="text-sm text-text-secondary">
                            Ajoute des amis et échange en messages privés.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-6 h-6 text-accent-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Accumule des points</h4>
                        <p className="text-sm text-text-secondary">
                            Chaque action te rapproche du sommet du classement.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ready',
        title: "C'est parti !",
        subtitle: "Ton éveil commence maintenant",
        content: (
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center shadow-lg shadow-accent-green/20">
                    <Rocket className="w-12 h-12 text-white" />
                </div>

                <div className="space-y-2 text-left mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                        <Sparkles className="w-5 h-5 text-accent-purple flex-shrink-0" />
                        <span className="text-sm">Explore le <strong>Nexus</strong></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                        <Sparkles className="w-5 h-5 text-accent-blue flex-shrink-0" />
                        <span className="text-sm">Dis bonjour dans les <strong>Channels</strong></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                        <Sparkles className="w-5 h-5 text-accent-green flex-shrink-0" />
                        <span className="text-sm">Personnalise ton <strong>Profil</strong></span>
                    </div>
                </div>

                <p className="text-text-secondary text-sm italic">
                    "Dans l'ombre, nous forgeons notre lumière."
                </p>
            </div>
        )
    }
]

export default function OnboardingModal({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isExiting, setIsExiting] = useState(false)

    const step = STEPS[currentStep]
    const isFirst = currentStep === 0
    const isLast = currentStep === STEPS.length - 1

    const handleNext = () => {
        if (isLast) {
            setIsExiting(true)
            setTimeout(() => onComplete(), 300)
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        setIsExiting(true)
        setTimeout(() => onComplete(), 300)
    }

    return (
        <div className={`fixed inset-0 bg-background/98 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-full max-w-md">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentStep(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentStep
                                    ? 'w-8 bg-gradient-to-r from-accent-purple to-accent-blue'
                                    : i < currentStep
                                        ? 'w-2 bg-accent-purple/50'
                                        : 'w-2 bg-surface-hover'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="glass-elevated rounded-2xl p-6 border border-surface-hover shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-purple via-accent-blue to-accent-green bg-clip-text text-transparent mb-1">
                            {step.title}
                        </h2>
                        <p className="text-text-secondary">{step.subtitle}</p>
                    </div>

                    {/* Content */}
                    <div className="mb-8 min-h-[280px]">
                        {step.content}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        {isFirst ? (
                            <button
                                onClick={handleSkip}
                                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Passer
                            </button>
                        ) : (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </button>
                        )}

                        <button
                            onClick={handleNext}
                            className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-accent-purple/20"
                        >
                            {isLast ? 'Commencer' : 'Suivant'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Step Counter */}
                <p className="text-center mt-4 text-sm text-text-secondary">
                    {currentStep + 1} / {STEPS.length}
                </p>
            </div>
        </div>
    )
}
