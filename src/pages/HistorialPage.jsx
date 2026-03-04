import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Trophy, Flame, Star, Heart, Calendar } from 'lucide-react'
import { getPosts, getStats } from '../services/firebaseService'

const CATEGORIAS = [
  { id: 'all', label: 'Todos', emoji: '✨' },
  { id: 'foto', label: 'Foto', emoji: '📸' },
  { id: 'texto', label: 'Texto', emoji: '💬' },
  { id: 'tonteria', label: 'Tontería', emoji: '🤪' },
  { id: 'romantico', label: 'Romántico', emoji: '💌' },
  { id: 'completos', label: 'Los dos', emoji: '🎊' },
]

function PostCard({ post, onClick }) {
  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]
  const fecha = post.fecha instanceof Date ? post.fecha : post.fecha?.toDate?.() || new Date(post.fecha)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card cursor-pointer active:shadow-paper-lg transition-shadow"
    >
      {/* Date */}
      <p className="font-body text-xs text-ink/35 mb-2">
        {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>

      {/* Challenge text */}
      <p className="font-display text-sm font-medium text-ink leading-snug mb-3 line-clamp-2">
        {post.retoTexto}
      </p>

      {/* Photo grid (if any photos) */}
      {(resp1?.fotos?.length > 0 || resp2?.fotos?.length > 0) && (
        <div className="grid grid-cols-2 gap-1 mb-3 rounded-xl overflow-hidden">
          {[resp1, resp2].map((r, i) =>
            r?.fotos?.[0] ? (
              <img key={i} src={r.fotos[0]} alt="" className="aspect-square object-cover w-full" />
            ) : (
              <div key={i} className="aspect-square bg-cream-dark flex items-center justify-center">
                <span className="text-2xl opacity-40">{r?.emoji || '❓'}</span>
              </div>
            )
          )}
        </div>
      )}

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {post.respuestas?.map((r, i) => (
            <span key={i} title={r.usuarioNombre} className="text-base">{r.emoji}</span>
          ))}
        </div>
        <span className={`font-body text-xs px-2 py-0.5 rounded-full
          ${post.completadoTotal ? 'bg-emerald-100 text-emerald-600' : 'bg-cream-dark text-ink/40'}`}>
          {post.completadoTotal ? '✅ Completo' : '⏳ Parcial'}
        </span>
      </div>
    </motion.div>
  )
}

function PostDetail({ post, retoDiario, onClose }) {
  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]
  const fecha = post.fecha instanceof Date ? post.fecha : post.fecha?.toDate?.() || new Date(post.fecha)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-surface w-full max-w-md rounded-3xl shadow-paper-lg p-6 pb-8 max-h-[85vh] overflow-y-auto overscroll-contain"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-xs text-ink/35">
              {fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
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
                    <span className="font-body text-sm font-semibold text-ink">{resp.usuarioNombre}</span>
                  </div>
                  {resp.fotos?.map((url, j) => (
                    <img key={j} src={url} alt="" className="w-full rounded-xl object-cover" />
                  ))}
                  {!resp.fotos?.length && (
                    <div className="aspect-square bg-cream rounded-xl flex items-center justify-center">
                      <span className="text-4xl opacity-20">{resp.emoji}</span>
                    </div>
                  )}
                  {resp.texto && (
                    <p className="font-body text-sm text-ink/70 leading-relaxed">{resp.texto}</p>
                  )}
                </div>
              ) : (
                <div key={i} className="bg-cream rounded-2xl flex items-center justify-center min-h-32">
                  <p className="font-body text-xs text-ink/30">Pendiente...</p>
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function HistorialPage() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [filtro, setFiltro] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([getPosts(), getStats()])
      setPosts(p)
      setStats(s)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = posts.filter(p => {
    if (filtro === 'all') return true
    if (filtro === 'completos') return p.completadoTotal
    return p.categoria === filtro
  })

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-20 md:pb-2">
      {/* Header */}
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Nuestro Álbum 📚</h1>
      <p className="font-body text-xs text-ink/40 mb-5">Todos los retos que hemos compartido</p>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatChip icon={<Trophy size={14} className="text-mustard" />} value={stats.total} label="Completados" />
          <StatChip icon={<Flame size={14} className="text-coral" />} value={stats.racha} label="Racha actual" />
          <StatChip icon={<Star size={14} className="text-mustard" />} value={stats.rachaMax} label="Racha máx." />
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIAS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltro(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all
              ${filtro === cat.id ? 'bg-coral text-white shadow-paper' : 'bg-surface text-ink/50 shadow-paper'}`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-3xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-body text-ink/40">Ningún reto aquí todavía</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 pb-4">
          <AnimatePresence>
            {filtered.map(post => (
              <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {selectedPost && (
        <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  )
}

function StatChip({ icon, value, label }) {
  return (
    <div className="bg-surface rounded-2xl p-3 shadow-paper text-center">
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <span className="font-body font-bold text-ink text-base">{value}</span>
      </div>
      <p className="font-body text-[10px] text-ink/40">{label}</p>
    </div>
  )
}
