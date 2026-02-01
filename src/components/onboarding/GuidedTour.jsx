import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight, X, Check } from 'lucide-react'
import { useOnboarding, TOUR_STEPS } from '../../context/OnboardingContext'

export default function GuidedTour() {
    const {
        currentStep,
        totalSteps,
        currentStepData,
        nextStep,
        prevStep,
        skipOnboarding
    } = useOnboarding()

    const [tooltipStyle, setTooltipStyle] = useState({})
    const [highlightStyle, setHighlightStyle] = useState({})
    const [isVisible, setIsVisible] = useState(false)

    // Calculer la position du tooltip
    const calculatePosition = useCallback(() => {
        if (!currentStepData) return

        const target = document.querySelector(currentStepData.target)
        if (!target) {
            console.warn(`Target not found: ${currentStepData.target}`)
            return
        }

        const rect = target.getBoundingClientRect()
        const padding = 8

        // Style pour le highlight
        setHighlightStyle({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
        })

        // Style pour le tooltip (à droite de l'élément)
        setTooltipStyle({
            top: rect.top + rect.height / 2,
            left: rect.right + 20,
            transform: 'translateY(-50%)'
        })

        setIsVisible(true)
    }, [currentStepData])

    useEffect(() => {
        // Petit délai pour laisser le DOM se stabiliser
        const timer = setTimeout(calculatePosition, 100)

        // Recalculer sur resize
        window.addEventListener('resize', calculatePosition)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', calculatePosition)
        }
    }, [calculatePosition, currentStep])

    const isFirst = currentStep === 0
    const isLast = currentStep === totalSteps - 1

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/70" onClick={skipOnboarding} />

            {/* Highlight de l'élément */}
            {isVisible && (
                <div
                    className="absolute rounded-xl ring-4 ring-accent-purple ring-offset-2 ring-offset-transparent bg-transparent pointer-events-none transition-all duration-300 ease-out"
                    style={highlightStyle}
                />
            )}

            {/* Tooltip */}
            {isVisible && (
                <div
                    className="absolute z-10 w-80 animate-fadeIn"
                    style={tooltipStyle}
                >
                    <div className="glass-elevated rounded-2xl p-5 shadow-2xl border border-accent-purple/30">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-accent-purple bg-accent-purple/10 px-2 py-1 rounded-full">
                                {currentStep + 1} / {totalSteps}
                            </span>
                            <button
                                onClick={skipOnboarding}
                                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-gradient mb-2">
                            {currentStepData?.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed mb-4">
                            {currentStepData?.content}
                        </p>

                        {/* Progress bar */}
                        <div className="h-1 bg-surface rounded-full mb-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all duration-300"
                                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            {isFirst ? (
                                <button
                                    onClick={skipOnboarding}
                                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    Passer
                                </button>
                            ) : (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour
                                </button>
                            )}

                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                {isLast ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Terminer
                                    </>
                                ) : (
                                    <>
                                        Continuer
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Flèche pointant vers l'élément */}
                    <div
                        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
                        style={{ marginLeft: '-8px' }}
                    >
                        <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-accent-purple/30" />
                    </div>
                </div>
            )}
        </div>
    )
}
