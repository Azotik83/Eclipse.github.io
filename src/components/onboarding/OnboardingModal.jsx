import { useState } from 'react'
import {
    Moon, ArrowRight, ArrowLeft, User, MessageSquare, Calendar,
    Users, Zap, Shield, CheckCircle, Sparkles, Rocket
} from 'lucide-react'

const STEPS = [
    {
        id: 'welcome',
        title: "Bienvenue dans Eclipse",
        subtitle: "L'Éveil des Ombres",
        content: (
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center animate-float">
                    <Moon className="w-12 h-12 text-white" />
                </div>
                <p className="text-text-secondary mb-4">
                    Tu viens de rejoindre une communauté d'individus passionnés, prêts à se dépasser ensemble.
                </p>
                <p className="text-text-secondary">
                    Ce guide te montrera les essentiels pour profiter au maximum d'Eclipse.
                </p>
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
                            Ajoute un avatar, une bannière et une bio. Partage tes centres d'intérêts avec des #hashtags.
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
                            Ajoute des amis, envoie des messages privés, et rejoins les discussions.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'features',
        title: "Les Fonctionnalités",
        subtitle: "Explore l'univers Eclipse",
        content: (
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent-purple" />
                    </div>
                    <h4 className="font-semibold text-sm">Nexus</h4>
                    <p className="text-xs text-text-secondary mt-1">Ton tableau de bord personnel</p>
                </div>

                <div className="p-4 rounded-xl bg-surface text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-accent-blue" />
                    </div>
                    <h4 className="font-semibold text-sm">Channels</h4>
                    <p className="text-xs text-text-secondary mt-1">Chat en temps réel</p>
                </div>

                <div className="p-4 rounded-xl bg-surface text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-green/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent-green" />
                    </div>
                    <h4 className="font-semibold text-sm">Événements</h4>
                    <p className="text-xs text-text-secondary mt-1">Défis et sessions live</p>
                </div>

                <div className="p-4 rounded-xl bg-surface text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-orange-400" />
                    </div>
                    <h4 className="font-semibold text-sm">Classement</h4>
                    <p className="text-xs text-text-secondary mt-1">Gagne des points d'ombre</p>
                </div>
            </div>
        )
    },
    {
        id: 'ready',
        title: "Tu es prêt !",
        subtitle: "Commence ton éveil",
        content: (
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-accent-green" />
                </div>

                <div className="space-y-3 text-left mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
                        <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
                        <span className="text-sm">Explore le <strong>Nexus</strong> pour voir tes stats</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
                        <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
                        <span className="text-sm">Dis bonjour dans les <strong>Channels</strong></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
                        <CheckCircle className="w-5 h-5 text-accent-green flex-shrink-0" />
                        <span className="text-sm">Personnalise ton <strong>Profil</strong></span>
                    </div>
                </div>

                <p className="text-text-secondary text-sm">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Bonne aventure dans les ombres !
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
        <div className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-full max-w-md">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentStep(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep
                                    ? 'w-8 bg-accent-purple'
                                    : i < currentStep
                                        ? 'bg-accent-purple/50'
                                        : 'bg-surface-hover'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="glass-elevated rounded-2xl p-6 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gradient mb-1">{step.title}</h2>
                        <p className="text-text-secondary">{step.subtitle}</p>
                    </div>

                    {/* Content */}
                    <div className="mb-8 min-h-[200px]">
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
                            className="btn-primary flex items-center gap-2 px-6"
                        >
                            {isLast ? 'Commencer' : 'Suivant'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Skip Link */}
                {!isLast && (
                    <button
                        onClick={handleSkip}
                        className="block mx-auto mt-4 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Passer le tutoriel
                    </button>
                )}
            </div>
        </div>
    )
}
