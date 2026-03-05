import React, { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'retos_diarios_theme'
const DARK_KEY = 'retos_diarios_dark'

export const THEMES = [
  { id: 'coral', label: 'Coral', emoji: '🌺', accent: '#E8614A', accentDark: '#C94832', secondary: '#F0B429' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', accent: '#2563EB', accentDark: '#1D4ED8', secondary: '#06B6D4' },
  { id: 'forest', label: 'Forest', emoji: '🌿', accent: '#059669', accentDark: '#047857', secondary: '#84CC16' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅', accent: '#F97316', accentDark: '#EA580C', secondary: '#A855F7' },
  { id: 'sakura', label: 'Sakura', emoji: '🌸', accent: '#EC4899', accentDark: '#DB2777', secondary: '#F472B6' },
]

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

function applyCSS(isDark, theme) {
  const root = document.documentElement

  // Dark mode class
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Theme CSS variables
  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-accent-dark', theme.accentDark)
  root.style.setProperty('--color-secondary', theme.secondary)
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(DARK_KEY) === 'true' } catch { return false }
  })
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'coral' } catch { return 'coral' }
  })

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]

  useEffect(() => {
    applyCSS(isDark, theme)
    try {
      localStorage.setItem(DARK_KEY, isDark)
      localStorage.setItem(THEME_KEY, themeId)
    } catch {}
  }, [isDark, themeId, theme])

  function toggleDark() { setIsDark(d => !d) }
  function selectTheme(id) { setThemeId(id) }

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, themeId, selectTheme, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}
