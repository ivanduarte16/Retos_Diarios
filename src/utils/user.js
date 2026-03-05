export function isGenericNombre(nombre) {
  const n = String(nombre || '').trim().toLowerCase()
  return !n || n === 'usuario'
}

export function resolveNombreUsuario({
  nombrePerfil,
  nombreRespuesta,
  nombreFallback = 'Usuario',
}) {
  if (!isGenericNombre(nombrePerfil)) return nombrePerfil
  if (!isGenericNombre(nombreRespuesta)) return nombreRespuesta
  return nombreFallback
}
