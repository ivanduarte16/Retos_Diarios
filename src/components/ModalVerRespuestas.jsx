import React from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import useNombresPorUid from '../hooks/useNombresPorUid'
import ModalShell from './ui/ModalShell'

export default function ModalVerRespuestas({ post, retoDiario, onClose }) {
  const { resolveNombre } = useNombresPorUid(post)

  if (!post) return null

  const resp1 = post.respuestas?.[0]
  const resp2 = post.respuestas?.[1]

  return (
    <ModalShell onClose={onClose}>
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
          <p className="font-body text-sm text-ink/50 mt-1">Los dos habeis completado el reto</p>
        </div>
      )}
    </ModalShell>
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
