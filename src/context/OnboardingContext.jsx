import { createContext, useContext, useState, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'

const OnboardingContext = createContext(null)

// Étapes du tour guidé
export const TOUR_STEPS = [
    {
        id: 'nexus',
        target: '[data-tour="nexus"]',
        title: 'Nexus',
        content: 'Ton tableau de bord personnel. Retrouve ici tes statistiques, ton activité récente et les événements à venir.',
        position: 'right'
    },
    {
        id: 'channels',
        target: '[data-tour="channels"]',
        title: 'Channels',
        content: 'Discute en temps réel avec la communauté. Partage tes victoires, pose des questions et motive les autres !',
        position: 'right'
    },
    {
        id: 'events',
        target: '[data-tour="events"]',
        title: 'Événements',
        content: 'Participe aux défis collectifs et sessions live. C\'est là que la magie opère !',
        position: 'right'
    },
    {
        id: 'leaderboard',
        target: '[data-tour="leaderboard"]',
        title: 'Classement',
        content: 'Gagne des Points d\'Ombre en participant à la communauté et grimpe au sommet du classement.',
        position: 'right'
    },
    {
        id: 'profile',
        target: '[data-tour="profile"]',
        title: 'Ton Profil',
        content: 'Personnalise ton identité Eclipse : avatar, bannière, bio et centres d\'intérêts.',
        position: 'right'
    }
]

export function OnboardingProvider({ children }) {
    const { profile, completeOnboarding } = useAuthStore()

    // États
    const [showWelcome, setShowWelcome] = useState(true)
    const [showTour, setShowTour] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    // L'onboarding doit-il s'afficher ?
    const shouldShowOnboarding = profile && !profile.has_completed_onboarding

    // Commencer le tour après le welcome
    const startTour = useCallback(() => {
        setShowWelcome(false)
        setShowTour(true)
        setCurrentStep(0)
    }, [])

    // Passer à l'étape suivante
    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Fin du tour
            completeTour()
        }
    }, [currentStep])

    // Revenir à l'étape précédente
    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }, [currentStep])

    // Terminer le tour
    const completeTour = useCallback(async () => {
        setShowTour(false)
        setShowWelcome(false)
        await completeOnboarding()
    }, [completeOnboarding])

    // Passer le tutoriel
    const skipOnboarding = useCallback(async () => {
        setShowWelcome(false)
        setShowTour(false)
        await completeOnboarding()
    }, [completeOnboarding])

    const value = {
        shouldShowOnboarding,
        showWelcome,
        showTour,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        currentStepData: TOUR_STEPS[currentStep],
        startTour,
        nextStep,
        prevStep,
        completeTour,
        skipOnboarding
    }

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider')
    }
    return context
}
