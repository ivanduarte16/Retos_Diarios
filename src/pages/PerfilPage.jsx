import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Save, Edit3, Heart, Moon, Sun, Palette } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { updateUsuario, getPosts, calcStats } from '../services/firebaseService'
import { checkAchievements } from '../utils/achievements'
import InlineError from '../components/ui/InlineError'
import ToastCenter from '../components/ui/ToastCenter'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import ActivityHeatmap from '../components/ui/ActivityHeatmap'
import CountdownWidget from '../components/CountdownWidget'
import { SkeletonProfile, SkeletonStats } from '../components/ui/Skeleton'

const EMOJIS = ['🧔', '👩', '👨', '👩‍🦱', '👨‍🦱', '😎', '🥰', '😍', '🤩', '😊', '🫶', '💪']
const COLORS = ['#E8614A', '#F0B429', '#7C3AED', '#059669', '#2563EB', '#EC4899', '#F97316']

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

function StatCard({ label, value, emoji }) {
  return (
    <motion.div variants={fadeUp} className="bg-surface rounded-2xl shadow-paper p-3 text-center">
      <p className="font-body text-lg font-bold text-ink">
        {emoji} <AnimatedCounter value={value} className="font-body text-lg font-bold text-ink" />
      </p>
      <p className="font-body text-[10px] text-ink/40">{label}</p>
    </motion.div>
  )
}

export default function PerfilPage() {
  const { currentUser, userProfile, setUserProfile, logout } = useAuth()
  const { isDark, toggleDark, themeId, selectTheme, themes } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(userProfile?.nombre || '')
  const [emoji, setEmoji] = useState(userProfile?.emoji || '😊')
  const [color, setColor] = useState(userProfile?.color || '#E8614A')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState(null)

  useEffect(() => {
    getPosts()
      .then(p => {
        setPosts(p)
        const s = calcStats(p)
        setStats(s)
        setAchievements(checkAchievements(s, p))
      })
      .catch(err => { console.error(err); setError('No se pudieron cargar tus estadisticas.') })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setNombre(userProfile?.nombre || '')
    setEmoji(userProfile?.emoji || '😊')
    setColor(userProfile?.color || '#E8614A')
  }, [userProfile?.nombre, userProfile?.emoji, userProfile?.color])

  async function handleSave() {
    if (!nombre.trim()) { setError('El nombre no puede estar vacio.'); return }
    setError(''); setSaving(true)
    try {
      await updateUsuario(currentUser.uid, { nombre: nombre.trim(), emoji, color })
      setUserProfile(prev => ({ ...prev, nombre: nombre.trim(), emoji, color }))
      setEditing(false); setToast(`Perfil actualizado ${emoji}`); setTimeout(() => setToast(''), 2500)
    } catch (err) { console.error(err); setError('No se pudo guardar el perfil.') }
    finally { setSaving(false) }
  }

  async function handleLogout() {
    try { await logout(); navigate('/login') }
    catch (err) { console.error(err); setError('No se pudo cerrar sesion.') }
  }

  return (
    <div className="min-h-full bg-cream px-4 pt-6 pb-8">
      {loading ? (
        <><SkeletonProfile /><SkeletonStats /></>
      ) : (
        <>
          <div className="flex flex-col items-center mb-6">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              onClick={() => setEditing(true)} style={{ backgroundColor: `${color}22`, borderColor: color }}
              className="w-24 h-24 rounded-full border-4 flex items-center justify-center cursor-pointer text-5xl mb-3">{emoji}</motion.div>
            <h1 className="font-display text-2xl font-bold text-ink">{userProfile?.nombre || 'Tu perfil'}</h1>
            <p className="font-body text-xs text-ink/40 mt-0.5">{currentUser?.email}</p>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 mt-2 text-coral font-body text-xs font-medium">
              <Edit3 size={12} /> Editar perfil
            </button>
          </div>

          <InlineError message={error} className="mb-4" />

          {/* Stats */}
          {stats && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-5">
              <StatCard label="Retos" value={stats.total} emoji="🎯" />
              <StatCard label="Racha" value={stats.racha} emoji="🔥" />
              <StatCard label="Record" value={stats.rachaMax} emoji="⭐" />
            </motion.div>
          )}

          {/* Activity heatmap */}
          {posts.length > 0 && <div className="mb-5"><ActivityHeatmap posts={posts} /></div>}

          {/* Achievements */}
          {achievements && (
            <div className="card mb-5">
              <p className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-3">Logros</p>
              <div className="grid grid-cols-3 gap-2">
                {achievements.unlocked.map(a => (
                  <motion.div key={a.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-2">
                    <div className="text-2xl mb-1">{a.emoji}</div>
                    <p className="font-body text-[10px] font-medium text-ink">{a.title}</p>
                  </motion.div>
                ))}
                {achievements.locked.map(a => (
                  <div key={a.id} className="text-center py-2 opacity-20">
                    <div className="text-2xl mb-1 grayscale">🔒</div>
                    <p className="font-body text-[10px] text-ink/40">{a.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countdown */}
          <div className="mb-5"><CountdownWidget /></div>
        </>
      )}

      {/* Edit profile */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="card mb-5 shadow-paper-lg">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Editar perfil</h2>
            <div className="mb-4">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-1 block">Tu nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} className="input-field" placeholder="Como te llamas?" />
            </div>
            <div className="mb-4">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-2 block">Tu emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <motion.button key={e} type="button" whileTap={{ scale: 0.85 }} onClick={() => setEmoji(e)}
                    className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${emoji === e ? 'bg-coral/20 ring-2 ring-coral scale-110' : 'bg-cream-dark hover:bg-cream'}`}>{e}</motion.button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="font-body text-xs font-medium text-ink/50 uppercase tracking-wide mb-2 block">Tu color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <motion.button key={c} type="button" whileTap={{ scale: 0.85 }} onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-9 h-9 rounded-full flex-shrink-0 transition-all ${color === c ? 'ring-2 ring-offset-2 ring-ink scale-110' : 'hover:scale-105'}`} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancelar</button>
              <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.93 }}
                className="btn-primary flex-1 flex items-center justify-center gap-1">
                <Save size={16} />{saving ? 'Guardando...' : 'Guardar'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme settings */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-coral" />
          <span className="font-body text-sm font-semibold text-ink">Apariencia</span>
        </div>

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isDark ? <Moon size={14} className="text-ink/50" /> : <Sun size={14} className="text-ink/50" />}
            <span className="font-body text-sm text-ink">{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleDark}
            className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${isDark ? 'bg-coral' : 'bg-cream-dark'}`}>
            <motion.div animate={{ x: isDark ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-white shadow-paper" />
          </motion.button>
        </div>

        {/* Theme selector */}
        <p className="font-body text-xs text-ink/40 mb-2">Tema de color</p>
        <div className="flex gap-2">
          {themes.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.85 }} onClick={() => selectTheme(t.id)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${themeId === t.id ? 'ring-2 ring-coral shadow-paper' : ''}`}
              style={{ backgroundColor: `${t.accent}15` }}>
              <span className="text-lg">{t.emoji}</span>
              <p className="font-body text-[9px] text-ink/50 mt-0.5">{t.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* About */}
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

      <motion.button whileTap={{ scale: 0.93 }} onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-400 font-body font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut size={16} />Cerrar sesion
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
