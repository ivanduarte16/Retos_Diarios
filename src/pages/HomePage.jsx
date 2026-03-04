import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Eye, Upload, Flame, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRetoDiario, getPost, getFechaHoy, getStats } from '../services/firebaseService'
import ModalRespuesta from '../components/ModalRespuesta'
import ModalVerRespuestas from '../components/ModalVerRespuestas'

const CATEGORIA_CONFIG = {
  foto:      { emoji: '📸', label: 'Foto', color: 'bg-blue-50 text-blue-500' },
  texto:     { emoji: '💬', label: 'Texto', color: 'bg-emerald-50 text-emerald-500' },
  tonteria:  { emoji: '🤪', label: 'Tontería', color: 'bg-purple-50 text-purple-500' },
  romantico: { emoji: '💌', label: 'Romántico', color: 'bg-pink-50 text-pink-500' },
  video:     { emoji: '🎥', label: 'Vídeo', color: 'bg-orange-50 text-orange-500' },
  juego:     { emoji: '🎮', label: 'Juego', color: 'bg-indigo-50 text-indigo-500' },
}

// Animated bingo ball while loading
function BingoBall({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center py-16 select-none">
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-36 h-36"
      >
        {/* Outer sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral via-coral to-coral-dark shadow-paper-lg" />
        {/* Shine */}
        <div className="absolute top-3 left-5 w-10 h-6 rounded-full bg-white/30 blur-sm rotate-12" />
        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-inner">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="font-display text-3xl font-bold text-coral"
            >
              ?
            </motion.span>
          </div>
        </div>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="font-body text-ink/50 mt-6 text-sm"
      >
        Eligiendo tu reto de hoy...
      </motion.p>
    </div>
  )
}

// Flip card showing the challenge
function RetoCard({ retoDiario }) {
  const [flipped, setFlipped] = useState(false)
  const cfg = CATEGORIA_CONFIG[retoDiario.categoria] || CATEGORIA_CONFIG.foto

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="perspective-1000 w-full aspect-[3/2]" onClick={() => setFlipped(f => !f)}>
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full transform-style-3d"
      >
        {/* Back (decorative) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-6 gap-3 opacity-20 p-4 rotate-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white" />
            ))}
          </div>
          <span className="absolute font-display text-7xl opacity-30">🎯</span>
        </div>

        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-3xl bg-surface shadow-paper-lg p-6 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`font-body text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <Star size={16} className="text-mustard" fill="currentColor" />
          </div>
          {/* Challenge text */}
          <div className="flex-1 flex items-center my-4">
            <p className="font-display text-xl font-medium text-ink leading-snug">
              {retoDiario.retoTexto}
            </p>
          </div>
          {/* Footer decoration */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-cream-dark" />
            ))}
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-coral/5" />
          <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-mustard/8" />
        </div>
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, userProfile } = useAuth()
  const [retoDiario, setRetoDiario] = useState(null)
  const [post, setPost] = useState(null)
  const [stats, setStats] = useState(null)
  const [stage, setStage] = useState('loading') // loading | bingo | card
  const [showModal, setShowModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [error, setError] = useState(null)

  const fecha = getFechaHoy()

  async function loadData() {
    try {
      const [reto, postData, statsData] = await Promise.all([
        getRetoDiario(),
        getPost(fecha),
        getStats(),
      ])
      setRetoDiario(reto)
      setPost(postData)
      setStats(statsData)
    } catch (e) {
      console.error(e)
      setError('No se pudo cargar el reto. Comprueba tu conexión.')
    }
  }

  useEffect(() => {
    loadData().then(() => setStage('bingo'))
  }, [])

  const yaRespondí = post?.completadoPor?.includes(currentUser?.uid)
  const parejaRespondió = post?.completadoPor?.some(id => id !== currentUser?.uid)

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-20 md:pb-2 relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-body text-xs text-ink/40 uppercase tracking-wide">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-2xl font-bold text-ink">
            Hola, {userProfile?.nombre || 'amor'} {userProfile?.emoji || '💛'}
          </h1>
        </div>
        {stats && (
          <div className="flex items-center gap-1.5 bg-surface rounded-2xl px-3 py-2 shadow-paper">
            <Flame size={16} className="text-coral" />
            <span className="font-body text-sm font-semibold text-ink">{stats.racha}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="card border border-coral/20 text-coral text-sm font-body mb-4">
          {error}
        </div>
      )}

      {/* Bingo animation → Card */}
      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div key="loading" exit={{ opacity: 0 }}>
            <div className="h-52 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-coral/30 border-t-coral rounded-full" />
            </div>
          </motion.div>
        )}
        {stage === 'bingo' && retoDiario && (
          <motion.div key="bingo" exit={{ opacity: 0, scale: 0.95 }}>
            <BingoBall onDone={() => setStage('card')} />
          </motion.div>
        )}
        {stage === 'card' && retoDiario && (
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <RetoCard retoDiario={retoDiario} />

            {/* Completion status */}
            <div className="flex gap-3 mt-4">
              <StatusBadge
                label={userProfile?.nombre || 'Tú'}
                emoji={userProfile?.emoji || '😊'}
                done={yaRespondí}
              />
              {/* Other user profile from post */}
              <StatusBadge
                label="Tu pareja"
                emoji="💛"
                done={parejaRespondió}
              />
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${yaRespondí ? 'opacity-70' : ''}`}
              >
                <Upload size={18} />
                {yaRespondí ? 'Actualizar mi respuesta' : '✅ Subir mi respuesta'}
              </motion.button>

              {(yaRespondí || parejaRespondió) && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowVerModal(true)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  👀 Ver respuestas
                </motion.button>
              )}
            </div>

            {/* Streak info */}
            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 card text-center"
              >
                <p className="font-body text-2xl">🔥 {stats.racha} {stats.racha === 1 ? 'día' : 'días'} seguidos</p>
                <p className="font-body text-xs text-ink/40 mt-1">
                  {stats.total} retos completados juntos · Máx: {stats.rachaMax} días
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showModal && (
        <ModalRespuesta
          retoDiario={retoDiario}
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadData() }}
        />
      )}
      {showVerModal && (
        <ModalVerRespuestas
          post={post}
          retoDiario={retoDiario}
          onClose={() => setShowVerModal(false)}
        />
      )}
    </div>
  )
}

function StatusBadge({ label, emoji, done }) {
  return (
    <div className={`flex-1 flex items-center gap-2 rounded-2xl p-3 transition-all
      ${done ? 'bg-emerald-50' : 'bg-surface shadow-paper'}`}
    >
      <span className="text-lg">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs font-medium truncate text-ink/60">{label}</p>
        <p className={`font-body text-xs font-semibold ${done ? 'text-emerald-600' : 'text-ink/30'}`}>
          {done ? '✅ Completado' : '⏳ Pendiente'}
        </p>
      </div>
    </div>
  )
}
