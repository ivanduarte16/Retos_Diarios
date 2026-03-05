import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatInTimeZone } from 'date-fns-tz'

const TZ = 'Europe/Madrid'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = (day === 0 ? -6 : 1) - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { monday, sunday }
}

function getLastWeekRange() {
  const { monday } = getWeekRange()
  const lastSunday = new Date(monday)
  lastSunday.setDate(monday.getDate() - 1)
  lastSunday.setHours(23, 59, 59, 999)

  const lastMonday = new Date(lastSunday)
  lastMonday.setDate(lastSunday.getDate() - 6)
  lastMonday.setHours(0, 0, 0, 0)

  return { monday: lastMonday, sunday: lastSunday }
}

function parseFecha(fecha) {
  if (fecha?.toDate) return fecha.toDate()
  if (fecha instanceof Date) return fecha
  if (typeof fecha === 'string') return new Date(fecha + 'T12:00:00')
  return null
}

/**
 * Weekly recap card shown on the home page.
 * @param {{ posts: Array, stats: { racha: number, rachaMax: number } }} props
 */
export default function WeeklyRecap({ posts, stats }) {
  const recap = useMemo(() => {
    if (!posts?.length) return null

    const { monday, sunday } = getLastWeekRange()

    const weekPosts = posts.filter(p => {
      const d = parseFecha(p.fecha)
      return d && d >= monday && d <= sunday
    })

    if (weekPosts.length === 0) return null

    const completados = weekPosts.filter(p => p.completadoTotal).length
    let totalFotos = 0
    for (const p of weekPosts) {
      for (const r of (p.respuestas || [])) {
        totalFotos += (r.fotos || []).length
      }
    }

    // Vibe message based on completion rate
    const rate = completados / 7
    let vibe
    if (rate >= 1) vibe = { emoji: '👑', msg: 'Semana PERFECTA!' }
    else if (rate >= 0.7) vibe = { emoji: '🔥', msg: 'Semana increible!' }
    else if (rate >= 0.4) vibe = { emoji: '💪', msg: 'Buena semana!' }
    else vibe = { emoji: '🌱', msg: 'Poco a poco!' }

    const monStr = formatInTimeZone(monday, TZ, 'd MMM')
    const sunStr = formatInTimeZone(sunday, TZ, 'd MMM')

    return {
      completados,
      totalFotos,
      weekPosts,
      vibe,
      range: `${monStr} - ${sunStr}`,
    }
  }, [posts])

  if (!recap) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-4 overflow-hidden relative"
    >
      {/* Decorative bg */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[var(--color-accent)]/5" />

      <div className="flex items-center justify-between mb-3 relative">
        <div>
          <p className="font-body text-[10px] text-ink/40 uppercase tracking-wide">Recap semanal</p>
          <p className="font-body text-xs text-ink/50">{recap.range}</p>
        </div>
        <span className="text-2xl">{recap.vibe.emoji}</span>
      </div>

      <p className="font-display text-lg font-bold text-ink mb-3 relative">{recap.vibe.msg}</p>

      <div className="grid grid-cols-3 gap-3 relative">
        <div className="text-center">
          <p className="font-body text-xl font-bold text-ink">{recap.completados}</p>
          <p className="font-body text-[9px] text-ink/40">retos juntos</p>
        </div>
        <div className="text-center">
          <p className="font-body text-xl font-bold text-ink">{recap.totalFotos}</p>
          <p className="font-body text-[9px] text-ink/40">fotos subidas</p>
        </div>
        <div className="text-center">
          <p className="font-body text-xl font-bold text-ink">🔥 {stats?.racha || 0}</p>
          <p className="font-body text-[9px] text-ink/40">racha actual</p>
        </div>
      </div>
    </motion.div>
  )
}
