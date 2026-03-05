import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COUNTDOWN_KEY = 'retos_diarios_countdowns'

function loadCountdowns() {
  try {
    return JSON.parse(localStorage.getItem(COUNTDOWN_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCountdowns(list) {
  try {
    localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(list))
  } catch {}
}

function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / 86_400_000)
}

export default function CountdownWidget() {
  const [items, setItems] = useState(loadCountdowns)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  function handleAdd() {
    if (!name.trim() || !date) return
    const next = [...items, { id: Date.now(), name: name.trim(), date, emoji: '📅' }]
    setItems(next)
    saveCountdowns(next)
    setName('')
    setDate('')
    setAdding(false)
  }

  function handleRemove(id) {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    saveCountdowns(next)
  }

  // Sort by nearest first
  const sorted = [...items].sort((a, b) => daysUntil(a.date) - daysUntil(b.date))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs font-medium text-ink/50 dark:text-white/50 uppercase tracking-wide">
          Fechas especiales
        </p>
        <button
          onClick={() => setAdding(!adding)}
          className="font-body text-xs text-[var(--color-accent)] font-medium"
        >
          {adding ? 'Cancelar' : '+ Anadir'}
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2 mb-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Aniversario..."
                className="input-field flex-1 text-xs py-2"
              />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-field w-32 text-xs py-2"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleAdd}
              disabled={!name.trim() || !date}
              className="btn-primary w-full text-xs py-2 disabled:opacity-50"
            >
              Guardar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 && !adding && (
        <p className="font-body text-xs text-ink/30 dark:text-white/30 text-center py-2">
          Anade fechas especiales para ver la cuenta atras
        </p>
      )}

      <div className="space-y-2">
        {sorted.map(item => {
          const days = daysUntil(item.date)
          const isPast = days < 0
          const isToday = days === 0

          return (
            <motion.div
              key={item.id}
              layout
              className="flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                isToday ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                isPast ? 'bg-cream-dark dark:bg-white/10 text-ink/30 dark:text-white/30' :
                'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              }`}>
                {isToday ? '🎉' : isPast ? '✓' : Math.abs(days)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-ink dark:text-white truncate">{item.name}</p>
                <p className="font-body text-[10px] text-ink/40 dark:text-white/40">
                  {isToday ? 'Es hoy!' : isPast ? `Hace ${Math.abs(days)} dias` : `Faltan ${days} dias`}
                </p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 text-ink/20 hover:text-red-400 transition-all text-xs"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
