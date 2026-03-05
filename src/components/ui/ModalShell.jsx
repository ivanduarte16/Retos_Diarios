import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BASE_PANEL_CLASSES =
  'bg-surface w-full max-w-md rounded-3xl shadow-paper-lg p-6 pb-8 max-h-[85vh] overflow-y-auto overscroll-contain'

export default function ModalShell({
  children,
  onClose,
  backdropClassName = 'bg-ink/50',
  panelClassName = '',
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 ${backdropClassName} backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6`}
        onClick={e => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className={`${BASE_PANEL_CLASSES} ${panelClassName}`.trim()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
