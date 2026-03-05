import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo') // logo → text → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800)
    const t2 = setTimeout(() => setPhase('exit'), 2000)
    const t3 = setTimeout(onDone, 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'exit' ? null : undefined}
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/3 right-10 w-20 h-20 rounded-full bg-white/8" />
        </div>

        {/* Logo / bingo ball */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative z-10 w-28 h-28 mb-6"
        >
          <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="font-display text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                RD
              </span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase === 'text' || phase === 'exit' ? 1 : 0, y: phase === 'text' || phase === 'exit' ? 0 : 20 }}
          transition={{ duration: 0.4 }}
          className="font-display text-3xl font-bold text-white relative z-10"
        >
          Retos Diarios
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'text' || phase === 'exit' ? 0.7 : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-body text-sm text-white/70 mt-2 relative z-10"
        >
          Para ti y para mi
        </motion.p>

        {/* Loading dots */}
        <div className="absolute bottom-12 flex gap-1.5 relative z-10">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
