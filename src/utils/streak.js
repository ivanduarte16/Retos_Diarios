import { formatInTimeZone } from 'date-fns-tz'

const TZ = 'Europe/Madrid'
const FECHA_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function getFechaKey(date) {
  return formatInTimeZone(date, TZ, 'yyyy-MM-dd')
}

export function isFechaKey(value) {
  return FECHA_KEY_REGEX.test(String(value || ''))
}

export function plusDays(fechaKey, days) {
  const [y, m, d] = fechaKey.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  base.setUTCDate(base.getUTCDate() + days)
  return formatInTimeZone(base, TZ, 'yyyy-MM-dd')
}

export function getRachaActual(completadoKeys) {
  const today = new Date()
  const todayKey = getFechaKey(today)

  // If today is not completed yet, keep the streak alive from yesterday.
  const startOffset = completadoKeys.has(todayKey) ? 0 : 1

  let racha = 0
  for (let i = startOffset; i < 366; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getFechaKey(d)
    if (completadoKeys.has(key)) {
      racha += 1
    } else {
      break
    }
  }

  return racha
}

export function getRachaMax(completadoKeys) {
  const keys = [...completadoKeys].filter(isFechaKey).sort()
  if (keys.length === 0) return 0

  let max = 1
  let current = 1

  for (let i = 1; i < keys.length; i++) {
    if (keys[i] === plusDays(keys[i - 1], 1)) {
      current += 1
    } else {
      current = 1
    }
    if (current > max) max = current
  }

  return max
}

export function getCompletadoKeySet(posts) {
  const keys = posts
    .filter(p => p?.completadoTotal)
    .map(p => p?.retoDiarioId || p?.id)
    .filter(isFechaKey)
  return new Set(keys)
}
