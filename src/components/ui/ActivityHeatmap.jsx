import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getFechaKey } from '../../utils/streak'

/**
 * GitHub-style activity heatmap showing daily challenge completion.
 * Green = both completed, yellow = partial, empty = nothing.
 *
 * @param {{ posts: Array }} props
 */
export default function ActivityHeatmap({ posts = [] }) {
  const { weeks, completadoMap } = useMemo(() => {
    // Build map: date key -> status
    const map = {}
    for (const p of posts) {
      const key = p.retoDiarioId || p.id
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        map[key] = p.completadoTotal ? 'full' : 'partial'
      }
    }

    // Generate last 12 weeks of dates
    const today = new Date()
    const weeksArr = []

    // Find the Monday of the week 11 weeks ago
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1) // this Monday
    startDate.setDate(startDate.getDate() - 11 * 7) // 11 weeks back

    for (let w = 0; w < 12; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + w * 7 + d)
        const key = getFechaKey(date)
        const isFuture = date > today
        week.push({ key, status: isFuture ? 'future' : (map[key] || 'empty') })
      }
      weeksArr.push(week)
    }

    return { weeks: weeksArr, completadoMap: map }
  }, [posts])

  const dayLabels = ['L', '', 'X', '', 'V', '', 'D']

  return (
    <div className="card">
      <p className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-3">
        Actividad reciente
      </p>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center">
              <span className="font-body text-[8px] text-ink/30">{label}</span>
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <motion.div
                key={day.key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.008, duration: 0.2 }}
                title={day.key}
                className={`w-3 h-3 rounded-[3px] transition-colors ${
                  day.status === 'full'
                    ? 'bg-emerald-400'
                    : day.status === 'partial'
                    ? 'bg-mustard/70'
                    : day.status === 'future'
                    ? 'bg-transparent'
                    : 'bg-cream-dark'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 ml-4">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cream-dark" />
          <span className="font-body text-[9px] text-ink/30">Nada</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-mustard/70" />
          <span className="font-body text-[9px] text-ink/30">Parcial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
          <span className="font-body text-[9px] text-ink/30">Completo</span>
        </div>
      </div>
    </div>
  )
}
