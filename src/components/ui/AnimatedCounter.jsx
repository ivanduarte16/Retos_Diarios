import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated number counter that rolls digits upward when value changes.
 * Creates an "odometer" effect for stats and streaks.
 */
export default function AnimatedCounter({ value, className = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (value === displayValue) return

    const start = displayValue || 0
    const end = value || 0
    const diff = end - start
    const steps = Math.min(Math.abs(diff), 20)
    const stepTime = Math.max(30, 600 / steps)

    let current = start
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.round(start + (diff * step) / steps)
      setDisplayValue(current)
      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(end)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.span
      key={displayValue}
      initial={{ y: 4, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {displayValue}{suffix}
    </motion.span>
  )
}
