/**
 * Achievement / badge system for Retos Diarios.
 * Checks posts data against predefined thresholds and returns unlocked achievements.
 */

const ACHIEVEMENTS = [
  { id: 'first', emoji: '🎯', title: 'Primeros pasos', desc: 'Completar el primer reto juntos', check: s => s.total >= 1 },
  { id: 'week', emoji: '🔥', title: 'Semana de fuego', desc: 'Racha de 7 dias seguidos', check: s => s.rachaMax >= 7 },
  { id: 'twoweeks', emoji: '💪', title: 'Imparables', desc: 'Racha de 14 dias seguidos', check: s => s.rachaMax >= 14 },
  { id: 'month', emoji: '👑', title: 'Mes perfecto', desc: 'Racha de 30 dias seguidos', check: s => s.rachaMax >= 30 },
  { id: 'ten', emoji: '⭐', title: 'Diez de diez', desc: 'Completar 10 retos', check: s => s.total >= 10 },
  { id: 'fifty', emoji: '🏆', title: 'Medio centenar', desc: 'Completar 50 retos', check: s => s.total >= 50 },
  { id: 'hundred', emoji: '💎', title: 'Centenario', desc: 'Completar 100 retos', check: s => s.total >= 100 },
  { id: 'photos10', emoji: '📸', title: 'Fotografos', desc: 'Subir 10 fotos entre los dos', check: s => s.totalFotos >= 10 },
  { id: 'photos50', emoji: '🖼️', title: 'Galeria', desc: 'Subir 50 fotos entre los dos', check: s => s.totalFotos >= 50 },
]

/**
 * @param {{ total: number, racha: number, rachaMax: number }} stats
 * @param {Array} posts - raw posts array
 * @returns {{ unlocked: Array, locked: Array, progress: Map }}
 */
export function checkAchievements(stats, posts = []) {
  // Count total photos
  let totalFotos = 0
  for (const p of posts) {
    for (const r of (p.respuestas || [])) {
      totalFotos += (r.fotos || []).length
    }
  }

  const enriched = { ...stats, totalFotos }
  const unlocked = []
  const locked = []

  for (const a of ACHIEVEMENTS) {
    if (a.check(enriched)) {
      unlocked.push(a)
    } else {
      locked.push(a)
    }
  }

  return { unlocked, locked }
}

export { ACHIEVEMENTS }
