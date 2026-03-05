export function toJsDate(value) {
  if (value instanceof Date) return value
  if (value?.toDate) return value.toDate()
  return value ? new Date(value) : new Date()
}

export function formatFechaCabecera(value) {
  return toJsDate(value).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatFechaCorta(value) {
  return toJsDate(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatFechaLarga(value) {
  return toJsDate(value).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
