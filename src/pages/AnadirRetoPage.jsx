import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { addReto, getRetos, deleteReto } from '../services/firebaseService'

const CATEGORIAS = [
  { id: 'foto',      emoji: '📸', label: 'Foto' },
  { id: 'texto',     emoji: '💬', label: 'Texto' },
  { id: 'tonteria',  emoji: '🤪', label: 'Tontería' },
  { id: 'romantico', emoji: '💌', label: 'Romántico' },
  { id: 'video',     emoji: '🎥', label: 'Vídeo' },
  { id: 'juego',     emoji: '🎮', label: 'Juego' },
]

// Animated bingo ball entry
function BallaEntry({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className="flex justify-center my-4"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-coral-dark shadow-paper-lg flex items-center justify-center">
        <span className="text-white font-display font-bold text-lg">🎰</span>
      </div>
    </motion.div>
  )
}

export default function AnadirRetoPage() {
  const { currentUser } = useAuth()
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('foto')
  const [misRetos, setMisRetos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBall, setShowBall] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { loadRetos() }, [])

  async function loadRetos() {
    const all = await getRetos()
    const mios = all.filter(r => r.creadoPor === currentUser?.uid)
    setMisRetos(mios)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setLoading(true)
    try {
      await addReto(texto.trim(), categoria, currentUser.uid)
      setShowBall(true)
      setTexto('')
      await loadRetos()
      setToast('¡Reto añadido! Saldrá cuando toque 🎯')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    await deleteReto(id)
    setMisRetos(prev => prev.filter(r => r.id !== id))
  }

  const catCfg = CATEGORIAS.find(c => c.id === categoria) || CATEGORIAS[0]

  return (
    <div className="min-h-full bg-cream px-4 pt-6">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Meter al bingo 🎰</h1>
      <p className="font-body text-xs text-ink/40 mb-6">Añade un reto para la bola del bingo</p>

      {/* Preview card */}
      <div className="card mb-4 border-2 border-dashed border-cream-dark min-h-20">
        <p className="font-body text-[10px] text-ink/30 uppercase tracking-wide mb-2">
          {catCfg.emoji} Vista previa
        </p>
        <p className="font-display text-base font-medium text-ink leading-snug">
          {texto || <span className="text-ink/25 font-body italic">Escribe tu reto...</span>}
        </p>
      </div>

      {/* Ball animation */}
      <AnimatePresence>
        {showBall && <BallaEntry onDone={() => setShowBall(false)} />}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">
            Escribe el reto
          </label>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Mándame una foto de..."
            className="input-field resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="font-body text-xs text-ink/30 text-right mt-1">{texto.length}/200</p>
        </div>

        {/* Category selector */}
        <div>
          <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-2 block">
            Categoría
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                className={`rounded-2xl py-3 flex flex-col items-center gap-1 font-body text-xs font-medium transition-all
                  ${categoria === cat.id ? 'bg-coral text-white shadow-paper' : 'bg-surface text-ink/50 shadow-paper'}`}
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || !texto.trim()}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} />
          Meter al bingo 🎰
        </motion.button>
      </form>

      {/* My challenges */}
      {misRetos.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Mis retos ({misRetos.length})</h2>
          <div className="space-y-2">
            {misRetos.map(reto => (
              <motion.div
                key={reto.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="card flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-ink/40 mb-0.5">
                    {CATEGORIAS.find(c => c.id === reto.categoria)?.emoji} {CATEGORIAS.find(c => c.id === reto.categoria)?.label}
                    {reto.usado && <span className="ml-2 text-emerald-500">✅ Ya salió</span>}
                  </p>
                  <p className="font-body text-sm text-ink leading-snug">{reto.texto}</p>
                </div>
                {!reto.usado && (
                  <button
                    onClick={() => handleDelete(reto.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-ink/20 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-white px-4 py-3 rounded-2xl shadow-paper-lg font-body text-sm whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
