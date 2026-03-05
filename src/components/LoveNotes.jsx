import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NOTES_KEY = 'retos_diarios_love_notes'

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch {}
}

export function LoveNoteBanner() {
  const { currentUser } = useAuth()
  const [notes, setNotes] = useState(loadNotes)
  const [dismissed, setDismissed] = useState(false)

  // Find latest note NOT from current user
  const latestForMe = notes
    .filter(n => n.fromUid !== currentUser?.uid && !n.read)
    .sort((a, b) => b.timestamp - a.timestamp)[0]

  function markRead() {
    const updated = notes.map(n =>
      n.id === latestForMe?.id ? { ...n, read: true } : n
    )
    setNotes(updated)
    saveNotes(updated)
    setDismissed(true)
  }

  if (!latestForMe || dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card mb-4 border-l-4 border-[var(--color-accent)] bg-[var(--color-accent)]/5 dark:bg-[var(--color-accent)]/10 cursor-pointer"
      onClick={markRead}
    >
      <div className="flex items-start gap-2">
        <Heart size={14} className="text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="currentColor" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs font-medium text-[var(--color-accent)] mb-0.5">
            💌 Nota de {latestForMe.fromName}
          </p>
          <p className="font-body text-sm text-ink dark:text-white leading-relaxed">
            {latestForMe.text}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function LoveNoteComposer({ className = '' }) {
  const { currentUser, userProfile } = useAuth()
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!text.trim()) return

    const notes = loadNotes()
    notes.push({
      id: Date.now(),
      fromUid: currentUser?.uid,
      fromName: userProfile?.nombre || 'Alguien',
      fromEmoji: userProfile?.emoji || '💛',
      text: text.trim(),
      timestamp: Date.now(),
      read: false,
    })
    // Keep last 50 notes
    if (notes.length > 50) notes.splice(0, notes.length - 50)
    saveNotes(notes)
    setText('')
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <div className={`card ${className}`}>
      <p className="font-body text-xs font-medium text-ink/50 dark:text-white/50 uppercase tracking-wide mb-2">
        💌 Nota rapida
      </p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe algo bonito..."
          maxLength={200}
          className="input-field flex-1 text-sm py-2"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-[var(--color-accent)] text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          {sent ? <Heart size={16} fill="currentColor" /> : <Send size={16} />}
        </motion.button>
      </div>
      <AnimatePresence>
        {sent && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-body text-xs text-[var(--color-accent)] mt-1"
          >
            Nota enviada 💕
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
