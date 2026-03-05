import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Save, Edit3, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateUsuario, getStats } from '../services/firebaseService'
import InlineError from '../components/ui/InlineError'
import ToastCenter from '../components/ui/ToastCenter'

const EMOJIS = ['🧔', '👩', '👨', '👩‍🦱', '👨‍🦱', '😎', '🥰', '😍', '🤩', '😊', '🫶', '💪']
const COLORS = ['#E8614A', '#F0B429', '#7C3AED', '#059669', '#2563EB', '#EC4899', '#F97316']

function StatCard({ label, value, emoji }) {
  return (
    <div className="bg-surface rounded-2xl shadow-paper p-3 text-center">
      <p className="font-body text-lg font-bold text-ink">{emoji} {value}</p>
      <p className="font-body text-[10px] text-ink/40">{label}</p>
    </div>
  )
}

export default function PerfilPage() {
  const { currentUser, userProfile, setUserProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(userProfile?.nombre || '')
  const [emoji, setEmoji] = useState(userProfile?.emoji || '😊')
  const [color, setColor] = useState(userProfile?.color || '#E8614A')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar tus estadisticas.')
      })
  }, [])

  useEffect(() => {
    setNombre(userProfile?.nombre || '')
    setEmoji(userProfile?.emoji || '😊')
    setColor(userProfile?.color || '#E8614A')
  }, [userProfile?.nombre, userProfile?.emoji, userProfile?.color])

  async function handleSave() {
    if (!nombre.trim()) {
      setError('El nombre no puede estar vacio.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await updateUsuario(currentUser.uid, { nombre: nombre.trim(), emoji, color })
      setUserProfile(prev => ({ ...prev, nombre: nombre.trim(), emoji, color }))
      setEditing(false)
      setToast(`Perfil actualizado ${emoji}`)
      setTimeout(() => setToast(''), 2500)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el perfil. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-8">
      <div className="flex flex-col items-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          onClick={() => setEditing(true)}
          style={{ backgroundColor: `${color}22`, borderColor: color }}
          className="w-24 h-24 rounded-full border-4 flex items-center justify-center cursor-pointer text-5xl mb-3"
        >
          {emoji}
        </motion.div>
        <h1 className="font-display text-2xl font-bold text-ink">{userProfile?.nombre || 'Tu perfil'}</h1>
        <p className="font-body text-xs text-ink/40 mt-0.5">{currentUser?.email}</p>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 mt-2 text-coral font-body text-xs font-medium">
          <Edit3 size={12} /> Editar perfil
        </button>
      </div>

      <InlineError message={error} className="mb-4" />

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Retos" value={stats.total} emoji="🎯" />
          <StatCard label="Racha" value={`${stats.racha}🔥`} emoji="" />
          <StatCard label="Record" value={stats.rachaMax} emoji="⭐" />
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="card mb-5 shadow-paper-lg"
          >
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Editar perfil</h2>

            <div className="mb-4">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">
                Tu nombre
              </label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="input-field"
                placeholder="Como te llamas?"
              />
            </div>

            <div className="mb-4">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-2 block">
                Tu emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${emoji === e ? 'bg-coral/20 ring-2 ring-coral scale-110' : 'bg-cream-dark hover:bg-cream'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-2 block">
                Tu color
              </label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-9 h-9 rounded-full flex-shrink-0 transition-all ${color === c ? 'ring-2 ring-offset-2 ring-ink scale-110' : 'hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancelar</button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex-1 flex items-center justify-center gap-1"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-coral" fill="currentColor" />
          <span className="font-body text-sm font-semibold text-ink">Sobre la app</span>
        </div>
        <p className="font-body text-xs text-ink/50 leading-relaxed">
          Retos Diarios es tu espacio privado para compartir un reto cada dia con tu persona especial.
          Cada dia sale una bola del bingo y toca un reto diferente.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-400 font-body font-medium text-sm hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesion
      </motion.button>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <ToastCenter>{toast}</ToastCenter>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
