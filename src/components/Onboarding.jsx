import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ONBOARDING_KEY = 'retos_diarios_onboarding_seen'

const slides = [
  {
    emoji: '🎯',
    title: 'Cada dia, un reto diferente',
    desc: 'La bola del bingo gira y... sorpresa. Tendras un reto nuevo para completar cada dia.',
    bg: 'from-coral/20 to-mustard/10',
  },
  {
    emoji: '💕',
    title: 'Comparte con tu persona especial',
    desc: 'Fotos, textos, tonterias... Cada reto es una excusa para conectar de una forma unica.',
    bg: 'from-pink-100/50 to-coral/10',
  },
  {
    emoji: '🔥',
    title: 'Manten la racha viva',
    desc: 'Completa retos juntos cada dia y ve crecer vuestra racha. Cuantos dias seguidos llegareis?',
    bg: 'from-mustard/20 to-emerald-50',
  },
]

export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  } catch {
    return false
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {}
}

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]
  const isLast = current === slides.length - 1

  function handleNext() {
    if (isLast) {
      markOnboardingSeen()
      onDone()
    } else {
      setCurrent(c => c + 1)
    }
  }

  function handleSkip() {
    markOnboardingSeen()
    onDone()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-cream flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${slide.bg} flex items-center justify-center mb-8`}>
            <motion.span
              animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="text-7xl"
            >
              {slide.emoji}
            </motion.span>
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-3">{slide.title}</h2>
          <p className="font-body text-ink/50 text-sm leading-relaxed">{slide.desc}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mt-10 mb-8">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === current ? 24 : 8 }}
            className={`h-2 rounded-full transition-colors ${i === current ? 'bg-coral' : 'bg-cream-dark'}`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="btn-primary w-full text-center"
        >
          {isLast ? 'Empezar' : 'Siguiente'}
        </motion.button>
        {!isLast && (
          <button
            onClick={handleSkip}
            className="font-body text-xs text-ink/30 hover:text-ink/50 transition-colors py-2"
          >
            Saltar
          </button>
        )}
      </div>
    </div>
  )
}
