import React, { createContext, useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isDemoMode } from '../firebase'

const AuthContext = createContext(null)

const DEMO_USERS = {
  'el@demo.com': { uid: 'user1', email: 'el@demo.com', nombre: 'El', emoji: '🧔', color: '#E8614A' },
  'ella@demo.com': { uid: 'user2', email: 'ella@demo.com', nombre: 'Ella', emoji: '👩', color: '#F0B429' },
}

function getDefaultNombre(email) {
  const local = (email || '').split('@')[0] || 'usuario'
  const clean = local.replace(/[._-]+/g, ' ').trim()
  if (!clean) return 'Usuario'
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function login(email, password) {
    if (isDemoMode) {
      const demo = DEMO_USERS[(email || '').toLowerCase()]
      if (demo && password === 'demo123') {
        setCurrentUser({ uid: demo.uid, email: demo.email })
        setUserProfile(demo)
        localStorage.setItem('demoUser', JSON.stringify(demo))
        return demo
      }
      throw new Error('Credenciales incorrectas. En modo demo usa el@demo.com o ella@demo.com con contrasena demo123.')
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

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (!user) {
        setUserProfile(null)
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(userRef)

        if (snap.exists()) {
          setUserProfile({ id: snap.id, ...snap.data() })
        } else {
          const profile = {
            nombre: getDefaultNombre(user.email),
            emoji: '🙂',
            color: '#E8614A',
          }
          await setDoc(userRef, profile, { merge: true })
          setUserProfile(profile)
        }
      } catch (err) {
        console.error('Error cargando perfil de usuario', err)
        setUserProfile({
          nombre: getDefaultNombre(user.email),
          emoji: '🙂',
          color: '#E8614A',
        })
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [])

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    login,
    logout,
    isDemoMode,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
