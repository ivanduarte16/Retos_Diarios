import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUsuario } from '../services/firebaseService'

function isGenericNombre(nombre) {
  const n = String(nombre || '').trim().toLowerCase()
  return !n || n === 'usuario'
}

export default function ModalVerRespuestas({ post, retoDiario, onClose }) {
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
      return userProfile?.nombre || 'Tú'
    }
    return 'Tu pareja'
  }

  if (!post) return null

  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-surface w-full max-w-md rounded-3xl shadow-paper-lg p-6 pb-8 max-h-[85vh] overflow-y-auto overscroll-contain"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold text-ink">Respuestas</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-dark transition-colors">
              <X size={20} className="text-ink/40" />
            </button>
          </div>

          <div className="bg-cream rounded-2xl p-3 mb-5">
            <p className="font-body text-sm text-ink/60 leading-relaxed">{retoDiario?.retoTexto}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RespuestaColumn resp={resp1} nombre={resolveNombre(resp1)} />
            <RespuestaColumn resp={resp2} nombre={resolveNombre(resp2)} />
          </div>

          {post.completadoTotal && (
            <div className="mt-5 text-center">
              <span className="text-2xl">🎊</span>
              <p className="font-body text-sm text-ink/50 mt-1">¡Los dos habéis completado el reto!</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function RespuestaColumn({ resp, nombre }) {
  if (!resp) {
    return (
      <div className="bg-cream rounded-2xl p-4 flex flex-col items-center justify-center min-h-32 gap-2">
        <div className="text-3xl opacity-30">⏳</div>
        <p className="font-body text-xs text-ink/30 text-center">Pendiente...</p>
      </div>
    )
  }

  return (
    <div className="bg-cream rounded-2xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{resp.emoji}</span>
        <span className="font-body text-xs font-semibold text-ink/70 truncate">{nombre || resp.usuarioNombre}</span>
      </div>

      {resp.fotos?.length > 0 ? (
        <div className="grid grid-cols-2 gap-1">
          {resp.fotos.map((url, i) => (
            <img key={i} src={url} alt="" className="aspect-square rounded-lg object-cover w-full" />
          ))}
        </div>
      ) : (
        <div className="aspect-square bg-cream-dark rounded-lg flex items-center justify-center">
          <ImageIcon size={20} className="text-ink/20" />
        </div>
      )}

      {resp.texto && (
        <p className="font-body text-xs text-ink/60 leading-relaxed line-clamp-4">{resp.texto}</p>
      )}
    </div>
  )
}
