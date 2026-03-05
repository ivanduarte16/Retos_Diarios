import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Upload, Flame, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getRetoDiario, getPost, getFechaHoy, getPosts, calcStats } from '../services/firebaseService'
import { formatFechaCabecera } from '../utils/date'
import { CATEGORIA_CONFIG } from '../utils/categorias'
import { isGenericNombre, resolveNombreUsuario } from '../utils/user'
import ModalRespuesta from '../components/ModalRespuesta'
import ModalVerRespuestas from '../components/ModalVerRespuestas'
import InlineError from '../components/ui/InlineError'

const BINGO_SEEN_KEY = 'retos_diarios_bingo_seen_date'



function hasSeenBingoToday(fecha) {
  try {
    return localStorage.getItem(BINGO_SEEN_KEY) === fecha
  } catch {
    return false
  }
}

function markBingoSeen(fecha) {
  try {
    localStorage.setItem(BINGO_SEEN_KEY, fecha)
  } catch {}
}

function BingoBall({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center py-16 select-none">
      <motion.div
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-36 h-36"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral via-coral to-coral-dark shadow-paper-lg" />
        <div className="absolute top-3 left-5 w-10 h-6 rounded-full bg-white/30 blur-sm rotate-12" />
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

function RetoCard({ retoDiario }) {
  const [flipped, setFlipped] = useState(false)
  const cfg = CATEGORIA_CONFIG[retoDiario.categoria] || CATEGORIA_CONFIG.foto

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="perspective-1000 w-full aspect-[3/2]" onClick={() => setFlipped(v => !v)}>
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full transform-style-3d"
      >
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-6 gap-3 opacity-20 p-4 rotate-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white" />
            ))}
          </div>
          <span className="absolute font-display text-7xl opacity-30">🎯</span>
        </div>

        <div className="absolute inset-0 backface-hidden rounded-3xl bg-surface shadow-paper-lg p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between">
            <span className={`font-body text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <Star size={16} className="text-mustard" fill="currentColor" />
          </div>
          <div className="flex-1 flex items-center my-4">
            <p className="font-display text-xl font-medium text-ink leading-snug">{retoDiario.retoTexto}</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-cream-dark" />
            ))}
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-coral/5" />
          <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-mustard/8" />
        </div>
      </motion.div>
    </div>
  )
}

function StatusBadge({ label, emoji, done }) {
  return (
    <div className={`flex-1 flex items-center gap-2 rounded-2xl p-3 transition-all ${done ? 'bg-emerald-50' : 'bg-surface shadow-paper'}`}>
      <span className="text-lg">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs font-medium truncate text-ink/60">{label}</p>
        <p className={`font-body text-xs font-semibold ${done ? 'text-emerald-600' : 'text-ink/30'}`}>
          {done ? 'Completado' : 'Pendiente'}
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, userProfile } = useAuth()
  const [retoDiario, setRetoDiario] = useState(null)
  const [post, setPost] = useState(null)
  const [stats, setStats] = useState(null)
  const [stage, setStage] = useState('loading')
  const [showModal, setShowModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [error, setError] = useState('')

  const fecha = getFechaHoy()

  const loadData = useCallback(async (alive = { current: true }) => {
    try {
      const [reto, postData, postsAll] = await Promise.all([
        getRetoDiario(),
        getPost(fecha),
        getPosts(),
      ])
      if (!alive.current) return
      setRetoDiario(reto)
      setPost(postData)
      setStats(calcStats(postsAll))
      setError('')
    } catch (err) {
      if (!alive.current) return
      console.error(err)
      setError('No se pudo cargar el reto. Comprueba tu conexion.')
    }
  }, [fecha])

  useEffect(() => {
    const alive = { current: true }
    async function init() {
      await loadData(alive)
      if (!alive.current) return
      setStage(hasSeenBingoToday(fecha) ? 'card' : 'bingo')
    }
    init()
    return () => {
      alive.current = false
    }
  }, [fecha, loadData])

  const respuestaMia = useMemo(
    () => (post?.respuestas || []).find(r => r?.usuarioId === currentUser?.uid),
    [post?.respuestas, currentUser?.uid]
  )
  const respuestaPareja = useMemo(
    () => (post?.respuestas || []).find(r => r?.usuarioId && r.usuarioId !== currentUser?.uid),
    [post?.respuestas, currentUser?.uid]
  )

  const yaRespondi = post?.completadoPor?.includes(currentUser?.uid)
  const parejaRespondio = Boolean(respuestaPareja)

  const nombreMio = resolveNombreUsuario({
    nombrePerfil: userProfile?.nombre,
    nombreRespuesta: respuestaMia?.usuarioNombre,
    nombreFallback: 'Tu',
  })
  const emojiMio = userProfile?.emoji || respuestaMia?.emoji || '🙂'
  const nombrePareja = !isGenericNombre(respuestaPareja?.usuarioNombre)
    ? respuestaPareja?.usuarioNombre
    : 'Tu pareja'
  const emojiPareja = respuestaPareja?.emoji || '💛'

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-20 md:pb-2 relative flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-body text-xs text-ink/40 uppercase tracking-wide">{formatFechaCabecera(new Date())}</p>
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

      <InlineError message={error} className="mb-4" />

      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div key="loading" exit={{ opacity: 0 }}>
            <div className="h-52 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-coral/30 border-t-coral rounded-full"
              />
            </div>
          </motion.div>
        )}

        {stage === 'bingo' && retoDiario && (
          <motion.div key="bingo" exit={{ opacity: 0, scale: 0.95 }}>
            <BingoBall
              onDone={() => {
                markBingoSeen(fecha)
                setStage('card')
              }}
            />
          </motion.div>
        )}

        {stage === 'card' && retoDiario && (
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <RetoCard retoDiario={retoDiario} />

            <div className="flex gap-3 mt-4">
              <StatusBadge label={nombreMio} emoji={emojiMio} done={yaRespondi} />
              <StatusBadge label={nombrePareja} emoji={emojiPareja} done={parejaRespondio} />
            </div>

            <div className="mt-5 space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${yaRespondi ? 'opacity-70' : ''}`}
              >
                <Upload size={18} />
                {yaRespondi ? 'Actualizar mi respuesta' : 'Subir mi respuesta'}
              </motion.button>

              {(yaRespondi || parejaRespondio) && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowVerModal(true)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Ver respuestas
                </motion.button>
              )}
            </div>

            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 card text-center"
              >
                <p className="font-body text-2xl">
                  🔥 {stats.racha} {stats.racha === 1 ? 'dia' : 'dias'} seguidos
                </p>
                <p className="font-body text-xs text-ink/40 mt-1">
                  {stats.total} retos completados juntos · Max: {stats.rachaMax} dias
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <ModalRespuesta
          retoDiario={retoDiario}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadData({ current: true })
          }}
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
