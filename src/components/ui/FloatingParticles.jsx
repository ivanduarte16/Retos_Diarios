import React from 'react'
import { motion } from 'framer-motion'

/**
 * Subtle floating particles in theme colors.
 * Respects prefers-reduced-motion.
 */
export default function FloatingParticles() {
  const particles = React.useMemo(() =>
    Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 40 + Math.random() * 60,
      delay: Math.random() * 4,
      duration: 8 + Math.random() * 6,
    })),
    []
  )

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 motion-reduce:hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[var(--color-accent)] opacity-[0.04] dark:opacity-[0.06]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
