import React from 'react'
import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-3 border-coral/30 border-t-coral rounded-full mb-4"
      />
      <p className="font-body text-xs text-ink/30">Cargando...</p>
    </div>
  )
}
