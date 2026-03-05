/**
 * Configuracion unificada de categorias de retos.
 * Se usa en HomePage, HistorialPage y AnadirRetoPage.
 */

export const CATEGORIA_CONFIG = {
  foto:      { emoji: '📸', label: 'Foto',      color: 'bg-blue-50 text-blue-500' },
  texto:     { emoji: '💬', label: 'Texto',     color: 'bg-emerald-50 text-emerald-500' },
  tonteria:  { emoji: '🤪', label: 'Tonteria',  color: 'bg-purple-50 text-purple-500' },
  romantico: { emoji: '💌', label: 'Romantico', color: 'bg-pink-50 text-pink-500' },
  video:     { emoji: '🎥', label: 'Video',     color: 'bg-orange-50 text-orange-500' },
  juego:     { emoji: '🎮', label: 'Juego',     color: 'bg-indigo-50 text-indigo-500' },
}

/** Lista ordenada para selectores y filtros */
export const CATEGORIAS = [
  { id: 'foto',      emoji: '📸', label: 'Foto' },
  { id: 'texto',     emoji: '💬', label: 'Texto' },
  { id: 'tonteria',  emoji: '🤪', label: 'Tonteria' },
  { id: 'romantico', emoji: '💌', label: 'Romantico' },
  { id: 'video',     emoji: '🎥', label: 'Video' },
  { id: 'juego',     emoji: '🎮', label: 'Juego' },
]

/** Lista con filtro "Todos" y "Los dos" para HistorialPage */
export const CATEGORIAS_HISTORIAL = [
  { id: 'all',       emoji: '✨', label: 'Todos' },
  ...CATEGORIAS,
  { id: 'completos', emoji: '🎊', label: 'Los dos' },
]
