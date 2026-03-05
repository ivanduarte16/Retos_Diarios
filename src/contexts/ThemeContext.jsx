import React, { createContext, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'retos_diarios_theme'
const DARK_KEY = 'retos_diarios_dark'

export const THEMES = [
  {
    id: 'coral',
    label: 'Indigo',
    emoji: '✨',
    accent: '#4F46E5',
    accentDark: '#4338CA',
    secondary: '#818CF8',
    cta: '#F97316',
    mustard: '#F59E0B',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    accent: '#2563EB',
    accentDark: '#1D4ED8',
    secondary: '#22D3EE',
    cta: '#FB7185',
    mustard: '#FACC15',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌿',
    accent: '#0F766E',
    accentDark: '#115E59',
    secondary: '#14B8A6',
    cta: '#F97316',
    mustard: '#FBBF24',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    accent: '#EA580C',
    accentDark: '#C2410C',
    secondary: '#FB923C',
    cta: '#EC4899',
    mustard: '#F59E0B',
  },
  {
    id: 'sakura',
    label: 'Sakura',
    emoji: '🌸',
    accent: '#DB2777',
    accentDark: '#BE185D',
    secondary: '#F472B6',
    cta: '#8B5CF6',
    mustard: '#F59E0B',
  },
]

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

function applyCSS(isDark, theme) {
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-accent-dark', theme.accentDark)
  root.style.setProperty('--color-primary', theme.accent)
  root.style.setProperty('--color-secondary', theme.secondary)
  root.style.setProperty('--color-cta', theme.cta)
  root.style.setProperty('--color-coral', theme.accent)
  root.style.setProperty('--color-coral-dark', theme.accentDark)
  root.style.setProperty('--color-mustard', theme.mustard || theme.secondary)
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem(DARK_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'coral'
    } catch {
      return 'coral'
    }
  })

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]

  useEffect(() => {
    applyCSS(isDark, theme)
    try {
      localStorage.setItem(DARK_KEY, String(isDark))
      localStorage.setItem(THEME_KEY, themeId)
    } catch {}
  }, [isDark, themeId, theme])

  function toggleDark() {
    setIsDark(d => !d)
  }

  function selectTheme(id) {
    setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, themeId, selectTheme, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}
