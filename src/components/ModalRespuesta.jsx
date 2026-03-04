import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Image, Send, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getFechaHoy, subirRespuesta } from '../services/firebaseService'

export default function ModalRespuesta({ onClose, onSuccess, retoDiario }) {
  const { currentUser, userProfile } = useAuth()
  const [texto, setTexto] = useState('')
  const [archivos, setArchivos] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef()

  function handleFiles(e) {
    const selected = Array.from(e.target.files).slice(0, 4)
    setArchivos(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  function removeFile(idx) {
    const newFiles = archivos.filter((_, i) => i !== idx)
    const newPrev = previews.filter((_, i) => i !== idx)
    setArchivos(newFiles)
    setPreviews(newPrev)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!texto.trim() && archivos.length === 0) return
    setLoading(true)
    try {
      const usuario = {
        uid: currentUser.uid,
        nombre: userProfile?.nombre || 'Usuario',
        emoji: userProfile?.emoji || '😊',
      }
      await subirRespuesta(getFechaHoy(), usuario, texto, archivos)
      setDone(true)
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E8614A', '#F0B429', '#FDF6EC', '#C94832'],
      })
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1800)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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
          className="bg-surface w-full max-w-md rounded-t-3xl shadow-paper-lg p-6 pb-10"
        >
          {done ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-6xl mb-3">🎉</div>
              <h3 className="font-display text-2xl font-bold text-ink">¡Enviado!</h3>
              <p className="font-body text-ink/50 mt-1">Tu respuesta está guardada 💌</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Mi respuesta</h3>
                  <p className="font-body text-xs text-ink/40 mt-0.5 line-clamp-1">{retoDiario?.retoTexto}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-dark transition-colors">
                  <X size={20} className="text-ink/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder="Cuéntame algo... (opcional)"
                  className="input-field resize-none"
                  rows={3}
                  maxLength={500}
                />

                {/* Image previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-ink/70 rounded-full flex items-center justify-center"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {archivos.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full border-2 border-dashed border-cream-dark rounded-2xl py-4 flex items-center justify-center gap-2 text-ink/40 hover:border-coral/40 hover:text-coral transition-all"
                  >
                    <Image size={18} />
                    <span className="font-body text-sm">Añadir fotos ({archivos.length}/4)</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />

                <motion.button
                  type="submit"
                  disabled={loading || (!texto.trim() && archivos.length === 0)}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? 'Enviando...' : 'Enviar respuesta 🎯'}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
