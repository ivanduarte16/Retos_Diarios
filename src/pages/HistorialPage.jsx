import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Flame, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getPosts, getStats, getUsuario } from '../services/firebaseService'
import { formatFechaCorta, formatFechaLarga, toJsDate } from '../utils/date'
import { isGenericNombre } from '../utils/user'
import ModalShell from '../components/ui/ModalShell'
import InlineError from '../components/ui/InlineError'

const CATEGORIAS = [
  { id: 'all', label: 'Todos', emoji: '✨' },
  { id: 'foto', label: 'Foto', emoji: '📸' },
  { id: 'texto', label: 'Texto', emoji: '💬' },
  { id: 'tonteria', label: 'Tonteria', emoji: '🤪' },
  { id: 'romantico', label: 'Romantico', emoji: '💌' },
  { id: 'completos', label: 'Los dos', emoji: '🎊' },
]

function PostCard({ post, onClick }) {
  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

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
      <p className="font-body text-xs text-ink/35 mb-2">{formatFechaCorta(post.fecha)}</p>

      <p className="font-display text-sm font-medium text-ink leading-snug mb-3 line-clamp-2">{post.retoTexto}</p>

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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {post.respuestas?.map((r, i) => (
            <span key={i} title={r.usuarioNombre} className="text-base">{r.emoji}</span>
          ))}
        </div>
        <span className={`font-body text-xs px-2 py-0.5 rounded-full ${post.completadoTotal ? 'bg-emerald-100 text-emerald-600' : 'bg-cream-dark text-ink/40'}`}>
          {post.completadoTotal ? 'Completo' : 'Parcial'}
        </span>
      </div>
    </motion.div>
  )
}

function PostDetail({ post, onClose }) {
  const { currentUser, userProfile } = useAuth()
  const [nombresPorUid, setNombresPorUid] = useState({})

  useEffect(() => {
    let alive = true

    async function loadNombres() {
      const uids = [...new Set((post?.respuestas || []).map(r => r?.usuarioId).filter(Boolean))]
      if (uids.length === 0) {
        if (alive) setNombresPorUid({})
        return
      }

      const pairs = await Promise.all(
        uids.map(async (uid) => {
          const perfil = await getUsuario(uid)
          return [uid, perfil?.nombre || null]
        })
      )

      if (!alive) return
      const map = {}
      for (const [uid, nombre] of pairs) {
        if (nombre) map[uid] = nombre
      }
      setNombresPorUid(map)
    }

    loadNombres().catch(() => {
      if (alive) setNombresPorUid({})
    })

    return () => {
      alive = false
    }
  }, [post?.id, post?.respuestas])

  function resolveNombre(resp) {
    if (!resp) return ''

    const byUid = resp.usuarioId ? nombresPorUid[resp.usuarioId] : null
    if (!isGenericNombre(byUid)) return byUid

    const raw = String(resp.usuarioNombre || '').trim()
    if (!isGenericNombre(raw)) return raw

    if (resp.usuarioId && resp.usuarioId === currentUser?.uid) {
      return userProfile?.nombre || 'Tu'
    }
    return 'Tu pareja'
  }

  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  return (
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
                <img key={j} src={url} alt="" className="w-full rounded-xl object-cover" />
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

export default function HistorialPage() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [filtro, setFiltro] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [p, s] = await Promise.all([getPosts(), getStats()])
        setPosts(p)
        setStats(s)
        setError('')
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar el album. Intenta recargar.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(
    () =>
      posts.filter(p => {
        if (filtro === 'all') return true
        if (filtro === 'completos') return p.completadoTotal
        return p.categoria === filtro
      }),
    [posts, filtro]
  )

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-20 md:pb-2">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Nuestro Album</h1>
      <p className="font-body text-xs text-ink/40 mb-5">Todos los retos que hemos compartido</p>

      <InlineError message={error} className="mb-4" />

      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatChip icon={<Trophy size={14} className="text-mustard" />} value={stats.total} label="Completados" />
          <StatChip icon={<Flame size={14} className="text-coral" />} value={stats.racha} label="Racha actual" />
          <StatChip icon={<Star size={14} className="text-mustard" />} value={stats.rachaMax} label="Racha max." />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORIAS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltro(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all ${filtro === cat.id ? 'bg-coral text-white shadow-paper' : 'bg-surface text-ink/50 shadow-paper'}`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-3xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-body text-ink/40">Ningun reto aqui todavia</p>
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

      {selectedPost && <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
