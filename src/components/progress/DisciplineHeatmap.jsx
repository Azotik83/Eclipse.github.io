import { useMemo } from 'react'
import { startOfWeek, addDays, format, subDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

// Génère des données de démo si pas de données réelles
const generateDemoData = () => {
    const data = []
    const today = new Date()

    for (let i = 0; i < 84; i++) { // 12 semaines
        const date = subDays(today, 83 - i)
        const intensity = Math.random()
        let level = 0

        if (intensity > 0.8) level = 4
        else if (intensity > 0.6) level = 3
        else if (intensity > 0.4) level = 2
        else if (intensity > 0.2) level = 1

        // Ajouter plus d'activité les jours récents
        if (i > 70) level = Math.min(4, level + 1)

        data.push({
            date: format(date, 'yyyy-MM-dd'),
            level,
            count: level * 2
        })
    }

    return data
}

const levelColors = [
    'bg-surface-elevated', // 0 - No activity
    'bg-accent-purple/30', // 1 - Low
    'bg-accent-purple/50', // 2 - Medium
    'bg-accent-purple/70', // 3 - High
    'bg-accent-purple',    // 4 - Very high
]

export default function DisciplineHeatmap({ activities = null }) {
    const data = useMemo(() => activities || generateDemoData(), [activities])

    // Organiser les données par semaine
    const weeks = useMemo(() => {
        const result = []
        let currentWeek = []

        data.forEach((day, index) => {
            currentWeek.push(day)
            if (currentWeek.length === 7) {
                result.push(currentWeek)
                currentWeek = []
            }
        })

        if (currentWeek.length > 0) {
            result.push(currentWeek)
        }

        return result
    }, [data])

    const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

    // Calculer le score de discipline
    const disciplineScore = useMemo(() => {
        const last30Days = data.slice(-30)
        const activeDays = last30Days.filter(d => d.level > 0).length
        return Math.round((activeDays / 30) * 100)
    }, [data])

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Heatmap de Discipline</h3>
                    <p className="text-sm text-text-secondary">Ta régularité sur les 12 dernières semaines</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono text-accent-purple">{disciplineScore}%</div>
                    <p className="text-xs text-text-secondary">Score discipline</p>
                </div>
            </div>

            {/* Labels des jours */}
            <div className="flex gap-1 mb-2">
                <div className="w-6"></div>
                {dayLabels.map((label, i) => (
                    <div key={i} className="w-4 text-center text-xs text-text-secondary">
                        {label}
                    </div>
                ))}
            </div>

            {/* Grille */}
            <div className="flex gap-1">
                {/* Numéros de semaine */}
                <div className="flex flex-col gap-1">
                    {weeks.map((_, weekIndex) => (
                        <div key={weekIndex} className="w-6 h-4 flex items-center justify-center text-xs text-text-secondary">
                            {weekIndex % 4 === 0 ? `S${weeks.length - weekIndex}` : ''}
                        </div>
                    ))}
                </div>

                {/* Cellules du heatmap */}
                <div className="flex flex-col gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`
                    w-4 h-4 rounded-sm transition-all duration-200 cursor-pointer
                    ${levelColors[day.level]}
                    hover:ring-2 hover:ring-accent-purple/50
                  `}
                                    title={`${day.date}: ${day.count} activités`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Légende */}
            <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-text-secondary">Moins</span>
                {levelColors.map((color, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${color}`}></div>
                ))}
                <span className="text-xs text-text-secondary">Plus</span>
            </div>
        </div>
    )
}
