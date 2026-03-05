import React from 'react'
import { motion } from 'framer-motion'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            😵‍💫
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Algo ha salido mal</h1>
          <p className="font-body text-sm text-ink/50 mb-6 max-w-xs">
            Ha ocurrido un error inesperado. Recarga la pagina para continuar.
          </p>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => window.location.reload()}
            className="btn-primary px-8"
          >
            Recargar
          </motion.button>
          <p className="font-body text-[10px] text-ink/20 mt-6 max-w-xs break-all">
            {this.state.error?.message}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
