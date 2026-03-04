import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isDemoMode } from '../firebase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// Demo users for when Firebase is not configured
const DEMO_USERS = {
  'el@demo.com':  { uid: 'user1', email: 'el@demo.com',  nombre: 'Él',  emoji: '🧔', color: '#E8614A' },
  'ella@demo.com':{ uid: 'user2', email: 'ella@demo.com', nombre: 'Ella', emoji: '👩', color: '#F0B429' },
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function login(email, password) {
    if (isDemoMode) {
      const demo = DEMO_USERS[email.toLowerCase()]
      if (demo && password === 'demo123') {
        setCurrentUser({ uid: demo.uid, email: demo.email })
        setUserProfile(demo)
        localStorage.setItem('demoUser', JSON.stringify(demo))
        return demo
      }
      throw new Error('Credenciales incorrectas. En modo demo usa el@demo.com o ella@demo.com con contraseña: demo123')
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    if (isDemoMode) {
      setCurrentUser(null)
      setUserProfile(null)
      localStorage.removeItem('demoUser')
      return
    }
    return signOut(auth)
  }

  useEffect(() => {
    if (isDemoMode) {
      const saved = localStorage.getItem('demoUser')
      if (saved) {
        const demo = JSON.parse(saved)
        setCurrentUser({ uid: demo.uid, email: demo.email })
        setUserProfile(demo)
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

  const value = { currentUser, userProfile, setUserProfile, login, logout, isDemoMode }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
