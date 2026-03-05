import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo')

  useEffect(() => {
    const textTimer = setTimeout(() => setPhase('text'), 800)
    const exitTimer = setTimeout(() => setPhase('exit'), 2000)
    const doneTimer = setTimeout(onDone, 2500)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  const isExiting = phase === 'exit'

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-36 -left-28 h-80 w-80 rounded-full bg-white/8" />
        <div className="absolute right-10 top-1/3 h-20 w-20 rounded-full bg-white/10" />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -140 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
        className="relative z-10 mb-6 h-28 w-28"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border border-white/25 bg-white/20 backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-paper-lg">
            <span className="font-display text-3xl font-bold text-accent">RD</span>
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase === 'logo' ? 0 : 1, y: phase === 'logo' ? 20 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 font-display text-3xl font-bold text-white"
      >
        Retos Diarios
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'logo' ? 0 : 0.75 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="relative z-10 mt-2 font-body text-sm text-white/80"
      >
        Para ti y para mi
      </motion.p>

      <div className="absolute bottom-12 z-10 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        ))}
      </div>
    </motion.div>
  )
}
