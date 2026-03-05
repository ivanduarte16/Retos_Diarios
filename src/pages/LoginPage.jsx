import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import InlineError from '../components/ui/InlineError'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-coral/10" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-mustard/15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-6xl mb-4 inline-block"
          >
            🎯
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-ink">Retos Diarios</h1>
          <p className="font-body text-ink/50 mt-2 text-sm">Tu app de retos para cada dia juntos</p>
        </div>

        <div className="card shadow-paper-lg">
          <h2 className="font-display text-xl font-semibold text-ink mb-6">Bienvenido</h2>

          <InlineError message={error} className="rounded-2xl p-3 mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                className="input-field"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-4 border-t border-cream-dark">
            <p className="font-body text-xs text-ink/40 text-center">
              Modo demo: usa <strong>el@demo.com</strong> o <strong>ella@demo.com</strong>
              <br />
              contrasena: <strong>demo123</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
