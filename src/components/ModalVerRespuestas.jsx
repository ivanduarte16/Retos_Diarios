import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon } from 'lucide-react'

export default function ModalVerRespuestas({ post, retoDiario, onClose }) {
  if (!post) return null

  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-surface w-full max-w-md rounded-t-3xl shadow-paper-lg p-6 pb-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold text-ink">Respuestas</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-dark transition-colors">
              <X size={20} className="text-ink/40" />
            </button>
          </div>

          {/* Reto */}
          <div className="bg-cream rounded-2xl p-3 mb-5">
            <p className="font-body text-sm text-ink/60 leading-relaxed">{retoDiario?.retoTexto}</p>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-3">
            <RespuestaColumn resp={resp1} />
            <RespuestaColumn resp={resp2} />
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

function RespuestaColumn({ resp }) {
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
      {/* Avatar */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{resp.emoji}</span>
        <span className="font-body text-xs font-semibold text-ink/70 truncate">{resp.usuarioNombre}</span>
      </div>

      {/* Photos */}
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

      {/* Text */}
      {resp.texto && (
        <p className="font-body text-xs text-ink/60 leading-relaxed line-clamp-4">{resp.texto}</p>
      )}
    </div>
  )
}
