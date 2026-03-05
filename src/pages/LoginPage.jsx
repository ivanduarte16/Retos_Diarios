import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogIn, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import InlineError from '../components/ui/InlineError'
import { hapticMedium, hapticError } from '../utils/haptics'

const floatingEmojis = ['🎲', '📸', '💛', '🔥', '✨', '🎯']

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
      hapticMedium()
      navigate('/')
    } catch (err) {
      hapticError()
      setError(err.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--color-cream) 0%, color-mix(in srgb, var(--color-accent) 8%, var(--color-cream)) 50%, var(--color-cream) 100%)' }}>

      {/* Floating decorative emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl select-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 8, -5, 3, 0],
              rotate: [0, 10, -10, 5, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            {emoji}
          </motion.span>
        ))}

        {/* Large gradient circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, var(--color-accent), transparent)` }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, var(--color-secondary), transparent)` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-5"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 rounded-full bg-white shadow-paper-lg flex items-center justify-center"
            >
              <span className="font-display text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>RD</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-display text-3xl font-bold text-ink"
          >
            Retos Diarios
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-body text-ink/50 mt-2 text-sm"
          >
            Tu app de retos para cada dia juntos
          </motion.p>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card shadow-paper-lg"
        >
          <h2 className="font-display text-xl font-semibold text-ink mb-5">Bienvenido</h2>

          <InlineError message={error} className="rounded-2xl p-3 mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.01 }}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-base py-3.5"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          <div className="mt-5 pt-4 border-t border-cream-dark">
            <p className="font-body text-[10px] text-ink/30 text-center leading-relaxed">
              Demo: <strong>el@demo.com</strong> / <strong>ella@demo.com</strong> · pass: <strong>demo123</strong>
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 font-body text-[10px] text-ink/20"
        >
          Hecho con 💛 para nosotros
        </motion.p>
      </motion.div>
    </div>
  )
}
