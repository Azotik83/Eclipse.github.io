import { useEffect, useRef, useMemo } from 'react'

// Génère des étoiles de démo basées sur les activités
const generateStars = (count = 50) => {
    const stars = []
    const categories = ['code', 'sport', 'mindset', 'general']
    const categoryColors = {
        code: '#3B82F6',    // Bleu
        sport: '#22C55E',   // Vert
        mindset: '#A855F7', // Violet
        general: '#F59E0B'  // Orange
    }

    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        stars.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            brightness: Math.random() * 0.5 + 0.5,
            category,
            color: categoryColors[category],
            pulseDelay: Math.random() * 2
        })
    }

    return stars
}

export default function Constellation({ activities = null }) {
    const canvasRef = useRef(null)
    const stars = useMemo(() => generateStars(60), [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()

        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        let animationId
        let time = 0

        const draw = () => {
            ctx.fillStyle = '#09090B'
            ctx.fillRect(0, 0, rect.width, rect.height)

            // Dessiner les connexions entre étoiles proches
            stars.forEach((star, i) => {
                stars.slice(i + 1).forEach(otherStar => {
                    const dx = (star.x - otherStar.x) * rect.width / 100
                    const dy = (star.y - otherStar.y) * rect.height / 100
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 80) {
                        const opacity = (1 - distance / 80) * 0.2
                        ctx.beginPath()
                        ctx.moveTo(star.x * rect.width / 100, star.y * rect.height / 100)
                        ctx.lineTo(otherStar.x * rect.width / 100, otherStar.y * rect.height / 100)
                        ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                })
            })

            // Dessiner les étoiles
            stars.forEach(star => {
                const x = star.x * rect.width / 100
                const y = star.y * rect.height / 100
                const pulse = Math.sin(time * 2 + star.pulseDelay) * 0.3 + 0.7
                const size = star.size * pulse

                // Glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 6)
                gradient.addColorStop(0, `${star.color}40`)
                gradient.addColorStop(1, 'transparent')
                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(x, y, size * 6, 0, Math.PI * 2)
                ctx.fill()

                // Core
                ctx.fillStyle = star.color
                ctx.beginPath()
                ctx.arc(x, y, size, 0, Math.PI * 2)
                ctx.fill()

                // Bright center
                ctx.fillStyle = '#FFFFFF'
                ctx.beginPath()
                ctx.arc(x, y, size * 0.3, 0, Math.PI * 2)
                ctx.fill()
            })

            time += 0.01
            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => cancelAnimationFrame(animationId)
    }, [stars])

    // Calculer les stats par catégorie
    const categoryStats = useMemo(() => {
        const stats = { code: 0, sport: 0, mindset: 0, general: 0 }
        stars.forEach(star => stats[star.category]++)
        return stats
    }, [stars])

    return (
        <div className="card relative overflow-hidden">
            <div className="absolute inset-0 opacity-50">
                <canvas ref={canvasRef} className="w-full h-full" style={{ minHeight: '200px' }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Constellation de l'Effort</h3>
                        <p className="text-sm text-text-secondary">Une étoile par tâche accomplie</p>
                    </div>
                    <div className="text-2xl font-bold font-mono text-accent-purple">
                        {stars.length} <span className="text-sm font-normal text-text-secondary">étoiles</span>
                    </div>
                </div>

                {/* Légende des catégories */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-blue"></div>
                        <span className="text-sm text-text-secondary">Code ({categoryStats.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-green"></div>
                        <span className="text-sm text-text-secondary">Sport ({categoryStats.sport})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-purple"></div>
                        <span className="text-sm text-text-secondary">Mindset ({categoryStats.mindset})</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
