import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25,
}

/**
 * Wrapper for smooth page transitions using AnimatePresence.
 * Wrap each page's content with this component.
 */
export default function PageTransition({ children }) {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
