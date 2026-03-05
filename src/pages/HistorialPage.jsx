import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Flame, Star, Grid3X3, List } from 'lucide-react'
import { getPosts, calcStats } from '../services/firebaseService'
import { formatFechaCorta, formatFechaLarga } from '../utils/date'
import { CATEGORIAS_HISTORIAL } from '../utils/categorias'
import useNombresPorUid from '../hooks/useNombresPorUid'
import ModalShell from '../components/ui/ModalShell'
import InlineError from '../components/ui/InlineError'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import ActivityHeatmap from '../components/ui/ActivityHeatmap'
import Lightbox from '../components/ui/Lightbox'
import { SkeletonCard, SkeletonStats } from '../components/ui/Skeleton'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

function PostCard({ post, onClick }) {
  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  return (
    <motion.div variants={fadeUp} layout whileTap={{ scale: 0.96 }} onClick={onClick}
      className="card cursor-pointer hover:shadow-paper-lg active:shadow-paper-lg transition-shadow">
      <p className="font-body text-xs text-ink/35 mb-2">{formatFechaCorta(post.fecha)}</p>
      <p className="font-display text-sm font-medium text-ink leading-snug mb-3 line-clamp-2">{post.retoTexto}</p>
      {(resp1?.fotos?.length > 0 || resp2?.fotos?.length > 0) && (
        <div className="grid grid-cols-2 gap-1 mb-3 rounded-xl overflow-hidden">
          {[resp1, resp2].map((r, i) =>
            r?.fotos?.[0] ? <img key={i} src={r.fotos[0]} alt="" className="aspect-square object-cover w-full" />
              : <div key={i} className="aspect-square bg-cream-dark flex items-center justify-center">
                  <span className="text-2xl opacity-40">{r?.emoji || '❓'}</span>
                </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {post.respuestas?.map((r, i) => <span key={i} title={r.usuarioNombre} className="text-base">{r.emoji}</span>)}
        </div>
        <span className={`font-body text-xs px-2 py-0.5 rounded-full ${post.completadoTotal ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-cream-dark text-ink/40'}`}>
          {post.completadoTotal ? 'Completo ✓' : 'Parcial'}
        </span>
      </div>
    </motion.div>
  )
}

function TimelineItem({ post, onClick }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-3 cursor-pointer" onClick={onClick}>
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${post.completadoTotal ? 'bg-emerald-400' : 'bg-cream-dark'}`} />
        <div className="w-0.5 flex-1 bg-cream-dark -mt-0.5" />
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <p className="font-body text-[10px] text-ink/35 mb-0.5">{formatFechaCorta(post.fecha)}</p>
        <p className="font-body text-sm text-ink leading-snug line-clamp-1">{post.retoTexto}</p>
        <div className="flex items-center gap-1 mt-1">
          {post.respuestas?.map((r, i) => <span key={i} className="text-sm">{r.emoji}</span>)}
        </div>
      </div>
    </motion.div>
  )
}

function PostDetail({ post, onClose }) {
  const { resolveNombre } = useNombresPorUid(post)
  const [lightboxImages, setLightboxImages] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  // Collect all photos for lightbox
  const allPhotos = useMemo(() => {
    const photos = []
    for (const r of (post.respuestas || [])) {
      for (const url of (r.fotos || [])) photos.push(url)
    }
    return photos
  }, [post])

  function openPhoto(url) {
    const idx = allPhotos.indexOf(url)
    setLightboxIndex(idx >= 0 ? idx : 0)
    setLightboxImages(allPhotos)
  }

  return (
    <>
      <ModalShell onClose={onClose} backdropClassName="bg-ink/60">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-xs text-ink/35">{formatFechaLarga(post.fecha)}</p>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-dark transition-colors">
            <X size={20} className="text-ink/40" />
          </button>
        </div>
        <h3 className="font-display text-xl font-medium text-ink mb-5 leading-snug">{post.retoTexto}</h3>
        <div className="grid grid-cols-2 gap-4">
          {[resp1, resp2].map((resp, i) =>
            resp ? (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{resp.emoji}</span>
                  <span className="font-body text-sm font-semibold text-ink">{resolveNombre(resp)}</span>
                </div>
                {resp.fotos?.map((url, j) => (
                  <img key={j} src={url} alt="" onClick={() => openPhoto(url)}
                    className="w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                ))}
                {!resp.fotos?.length && (
                  <div className="aspect-square bg-cream rounded-xl flex items-center justify-center">
                    <span className="text-4xl opacity-20">{resp.emoji}</span>
                  </div>
                )}
                {resp.texto && <p className="font-body text-sm text-ink/70 leading-relaxed">{resp.texto}</p>}
              </div>
            ) : (
              <div key={i} className="bg-cream rounded-2xl flex items-center justify-center min-h-32">
                <p className="font-body text-xs text-ink/30">Pendiente...</p>
              </div>
            )
          )}
        </div>
      </ModalShell>

      <AnimatePresence>
        {lightboxImages && (
          <Lightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxImages(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

function StatChip({ icon, value, label }) {
  return (
    <motion.div variants={fadeUp} className="bg-surface rounded-2xl p-3 shadow-paper text-center">
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <AnimatedCounter value={value} className="font-body font-bold text-ink text-base" />
      </div>
      <p className="font-body text-[10px] text-ink/40">{label}</p>
    </motion.div>
  )
}

export default function HistorialPage() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [filtro, setFiltro] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'timeline'

  useEffect(() => {
    async function load() {
      try {
        const p = await getPosts(); setPosts(p); setStats(calcStats(p)); setError('')
      } catch (err) { console.error(err); setError('No se pudo cargar el album.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() =>
    posts.filter(p => {
      if (filtro === 'all') return true
      if (filtro === 'completos') return p.completadoTotal
      return p.categoria === filtro
    }), [posts, filtro])

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-20 md:pb-2">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-ink">Nuestro Album</h1>
        <div className="flex gap-1">
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-coral/10 text-coral' : 'text-ink/30'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-xl transition-colors ${viewMode === 'timeline' ? 'bg-coral/10 text-coral' : 'text-ink/30'}`}>
            <List size={16} />
          </button>
        </div>
      </div>
      <p className="font-body text-xs text-ink/40 mb-5">Todos los retos que hemos compartido</p>

      <InlineError message={error} className="mb-4" />

      {loading ? <SkeletonStats /> : stats && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-2 mb-5">
          <StatChip icon={<Trophy size={14} className="text-mustard" />} value={stats.total} label="Completados" />
          <StatChip icon={<Flame size={14} className="text-coral" />} value={stats.racha} label="Racha actual" />
          <StatChip icon={<Star size={14} className="text-mustard" />} value={stats.rachaMax} label="Racha max." />
        </motion.div>
      )}

      {!loading && posts.length > 0 && <div className="mb-5"><ActivityHeatmap posts={posts} /></div>}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIAS_HISTORIAL.map(cat => (
          <button key={cat.id} onClick={() => setFiltro(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all ${filtro === cat.id ? 'bg-coral text-white shadow-paper' : 'bg-surface text-ink/50 shadow-paper hover:shadow-paper-lg'}`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">
            {filtro === 'all' ? '📭' : filtro === 'completos' ? '🌟' : '🔍'}
          </motion.div>
          <p className="font-display text-lg font-semibold text-ink/50 mb-1">Nada por aqui</p>
          <p className="font-body text-xs text-ink/30">
            {filtro === 'all' ? 'Aun no habeis completado retos juntos. El primero esta por llegar!' : 'No hay retos con este filtro.'}
          </p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={stagger} initial="hidden" animate="show" layout className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map(post => <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />)}
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="pb-4">
          {filtered.map(post => <TimelineItem key={post.id} post={post} onClick={() => setSelectedPost(post)} />)}
        </motion.div>
      )}

      {selectedPost && <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
