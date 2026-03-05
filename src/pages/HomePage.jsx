import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Eye, Flame, Share2, Star, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { calcStats, getFechaHoy, getPost, getPosts, getRetoDiario } from '../services/firebaseService'
import { formatFechaCabecera } from '../utils/date'
import { CATEGORIA_CONFIG } from '../utils/categorias'
import { isGenericNombre, resolveNombreUsuario } from '../utils/user'
import { hapticLight, hapticSuccess } from '../utils/haptics'
import usePullToRefresh from '../hooks/usePullToRefresh'
import ModalRespuesta from '../components/ModalRespuesta'
import ModalVerRespuestas from '../components/ModalVerRespuestas'
import WeeklyRecap from '../components/WeeklyRecap'
import InlineError from '../components/ui/InlineError'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { SkeletonRetoCard } from '../components/ui/Skeleton'
import { LoveNoteBanner, LoveNoteComposer } from '../components/LoveNotes'

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

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 7) return { text: 'Buenas noches', gradient: 'from-primary/22 via-secondary/10 to-background' }
  if (hour < 13) return { text: 'Buenos dias', gradient: 'from-secondary/22 via-primary/12 to-background' }
  if (hour < 20) return { text: 'Buenas tardes', gradient: 'from-cta/25 via-primary/10 to-background' }
  return { text: 'Buenas noches', gradient: 'from-primary/22 via-secondary/10 to-background' }
}

function fireConfetti() {
  const colors = ['#4F46E5', '#818CF8', '#F97316', '#F59E0B']
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors, disableForReducedMotion: true })
  setTimeout(() => {
    confetti({ particleCount: 40, spread: 100, origin: { y: 0.5, x: 0.3 }, colors, disableForReducedMotion: true })
  }, 280)
}

function BingoBall({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="select-none py-16 flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-36 h-36"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral via-coral to-coral-dark shadow-paper-lg" />
        <div className="absolute top-3 left-5 w-10 h-6 rounded-full bg-white/30 blur-sm rotate-12" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-[20px] bg-white/90 border-4 border-white/50 shadow-inner flex items-center justify-center">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="font-display text-3xl font-bold text-primary"
            >
              ?
            </motion.span>
          </div>
        </div>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mt-6 font-body text-sm text-ink/50"
      >
        Eligiendo tu reto de hoy...
      </motion.p>
    </div>
  )
}

function RetoCard({ retoDiario }) {
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const cfg = CATEGORIA_CONFIG[retoDiario.categoria] || CATEGORIA_CONFIG.foto

  useEffect(() => {
    const flipTimer = setTimeout(() => setFlipped(true), 280)
    const revealTimer = setTimeout(() => setRevealed(true), 1150)
    return () => {
      clearTimeout(flipTimer)
      clearTimeout(revealTimer)
    }
  }, [])

  return (
    <div className="w-full aspect-[3/2] perspective-1000 cursor-pointer" onClick={() => setFlipped(v => !v)}>
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full h-full transform-style-3d"
      >
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[24px] border-4 border-white bg-gradient-to-br from-primary to-primary/80 overflow-hidden flex items-center justify-center">
          <div className="grid grid-cols-6 gap-3 p-4 opacity-20 rotate-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white" />
            ))}
          </div>
          <span className="absolute font-display text-6xl tracking-widest text-white/30">RD</span>
        </div>
        <div className="absolute inset-0 backface-hidden rounded-[24px] border border-primary/20 bg-surface shadow-paper-lg overflow-hidden p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-[12px] text-xs font-medium font-body ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <Star size={16} className="text-secondary" fill="currentColor" />
          </div>

          <div className="my-4 flex-1 flex items-center">
            <motion.p
              initial={{ filter: 'blur(12px)', opacity: 0.3 }}
              animate={{ filter: revealed ? 'blur(0px)' : 'blur(12px)', opacity: revealed ? 1 : 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="font-display text-xl font-medium leading-snug text-ink"
            >
              {retoDiario.retoTexto}
            </motion.p>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.15 + i * 0.1, duration: 0.3 }}
                className="h-2 flex-1 origin-left rounded-full border border-primary/10 bg-background"
              />
            ))}
          </div>

          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/5" />
          <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-secondary/8" />
        </div>
      </motion.div>
    </div>
  )
}

function StatusBadge({ label, emoji, done }) {
  return (
    <div className={`flex-1 rounded-[20px] border p-3 transition-all flex items-center gap-2 ${done ? 'bg-cta/10 border-cta/30' : 'bg-surface border-primary/15 shadow-sm'}`}>
      <span className="text-lg">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate font-body text-xs font-medium text-ink/80">{label}</p>
        <p className={`font-body text-xs font-semibold ${done ? 'text-cta' : 'text-ink/40'}`}>
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
  const [allPosts, setAllPosts] = useState([])
  const [stage, setStage] = useState('loading')
  const [showModal, setShowModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [error, setError] = useState('')
  const [prevCompleto, setPrevCompleto] = useState(false)

  const fecha = getFechaHoy()
  const greeting = getTimeGreeting()

  const loadData = useCallback(async (alive = { current: true }) => {
    try {
      const [reto, postData, postsAll] = await Promise.all([getRetoDiario(), getPost(fecha), getPosts()])
      if (!alive.current) return

      const isCompleto = postData?.completadoTotal
      if (isCompleto && !prevCompleto) {
        fireConfetti()
        hapticSuccess()
      }

      setPrevCompleto(isCompleto)
      setRetoDiario(reto)
      setPost(postData)
      setAllPosts(postsAll)
      setStats(calcStats(postsAll))
      setError('')
    } catch (err) {
      if (!alive.current) return
      console.error(err)
      setError('No se pudo cargar el reto. Comprueba tu conexion.')
    }
  }, [fecha, prevCompleto])

  const { pulling, refreshing, pullDistance, handlers } = usePullToRefresh(() => loadData({ current: true }))

  function handleShare() {
    if (!retoDiario) return
    hapticLight()
    const text = `Reto del dia: ${retoDiario.retoTexto}\n\nRetos Diarios`
    if (navigator.share) {
      navigator.share({ title: 'Reto del dia', text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).catch(() => {})
    }
  }

  useEffect(() => {
    const alive = { current: true }
    async function init() {
      await loadData(alive)
      if (alive.current) {
        setStage(hasSeenBingoToday(fecha) ? 'card' : 'bingo')
      }
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
  const emojiMio = userProfile?.emoji || respuestaMia?.emoji || ':)'
  const nombrePareja = !isGenericNombre(respuestaPareja?.usuarioNombre) ? respuestaPareja?.usuarioNombre : 'Tu pareja'
  const emojiPareja = respuestaPareja?.emoji || '<3'

  return (
    <div className="relative flex min-h-full flex-col px-1 pb-6 pt-1 sm:px-2" {...handlers}>
      <AnimatePresence>
        {(pulling || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullDistance > 0 ? pullDistance : 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : pullDistance * 3 }}
              transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              className="text-2xl"
            >
              {refreshing ? '↻' : pullDistance > 60 ? '●' : '↓'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative mb-6 overflow-hidden rounded-[28px] border border-primary/15 bg-gradient-to-br ${greeting.gradient} p-5 shadow-paper`}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/12 blur-2xl" />
        <div className="pointer-events-none absolute -left-14 -bottom-16 h-36 w-36 rounded-full bg-secondary/10 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-ink/55">{formatFechaCabecera(new Date())}</p>
            <h1 className="font-display text-[28px] font-bold leading-tight text-ink">
              {greeting.text}, {userProfile?.nombre || 'amor'} {userProfile?.emoji || ''}
            </h1>
          </div>
          {stats && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.3 }}
              className="rounded-2xl border border-primary/20 bg-white/65 px-3 py-2 shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5">
                <Flame size={16} className="text-cta" />
                <AnimatedCounter value={stats.racha} className="font-body text-sm font-bold text-ink" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <InlineError message={error} className="mb-4" />
      <LoveNoteBanner />

      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div key="loading" exit={{ opacity: 0 }} className="space-y-4">
            <SkeletonRetoCard />
            <div className="flex gap-3">
              <div className="h-16 flex-1 rounded-2xl bg-surface p-3 animate-pulse" />
              <div className="h-16 flex-1 rounded-2xl bg-surface p-3 animate-pulse" />
            </div>
          </motion.div>
        )}

        {stage === 'bingo' && retoDiario && (
          <motion.div key="bingo" exit={{ opacity: 0, scale: 0.95 }}>
            <BingoBall onDone={() => {
              markBingoSeen(fecha)
              setStage('card')
            }}
            />
          </motion.div>
        )}

        {stage === 'card' && retoDiario && (
          <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <RetoCard retoDiario={retoDiario} />

            <div className="mt-4 flex gap-3">
              <StatusBadge label={nombreMio} emoji={emojiMio} done={yaRespondi} />
              <StatusBadge label={nombrePareja} emoji={emojiPareja} done={parejaRespondio} />
            </div>

            <div className="mt-5 space-y-3">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  hapticLight()
                  setShowModal(true)
                }}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${yaRespondi ? 'opacity-70' : ''}`}
              >
                <Upload size={18} />
                {yaRespondi ? 'Actualizar mi respuesta' : 'Subir mi respuesta'}
              </motion.button>

              {(yaRespondi || parejaRespondio) && (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    hapticLight()
                    setShowVerModal(true)
                  }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Ver respuestas
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleShare}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Compartir reto
              </motion.button>
            </div>

            {stats && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 card text-center">
                <p className="font-body text-2xl">
                  <AnimatedCounter value={stats.racha} className="font-body text-2xl" /> {stats.racha === 1 ? 'dia' : 'dias'} seguidos
                </p>
                <p className="mt-1 font-body text-xs text-ink/40">
                  <AnimatedCounter value={stats.total} /> retos completados juntos · Max: <AnimatedCounter value={stats.rachaMax} /> dias
                </p>
              </motion.div>
            )}

            <LoveNoteComposer className="mt-4" />
            <WeeklyRecap posts={allPosts} stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <ModalRespuesta
          retoDiario={retoDiario}
          onClose={() => setShowModal(false)}
          onSuccess={() => loadData({ current: true })}
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
