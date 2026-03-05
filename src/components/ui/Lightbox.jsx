import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Full-screen photo lightbox with swipe and zoom feel.
 * @param {{ images: string[], initialIndex?: number, onClose: () => void }} props
 */
export default function Lightbox({ images = [], initialIndex = 0, onClose }) {
  const [index, setIndex] = React.useState(initialIndex)
  const total = images.length

  function handlePrev() { setIndex(i => (i - 1 + total) % total) }
  function handleNext() { setIndex(i => (i + 1) % total) }

  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  if (!images.length) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-ink/90 backdrop-blur-lg flex items-center justify-center"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt=""
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full">
          <span className="font-body text-xs text-ink font-medium">{index + 1} / {total}</span>
        </div>
      )}

      {/* Nav arrows */}
      {total > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); handlePrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-ink/70 hover:text-ink transition-colors"
          >
            ←
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-ink/70 hover:text-ink transition-colors"
          >
            →
          </button>
        </>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-ink/70 hover:text-ink transition-colors text-lg"
      >
        ✕
      </button>
    </motion.div>
  )
}
