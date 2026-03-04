// Firebase configuration
// Copy this file to .env.local and fill in your Firebase project values.
// You can find these in Firebase Console → Project Settings → Your apps → SDK setup

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Demo mode: if no Firebase project configured, use demo config
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY'

let app, auth, db, storage

if (isDemoMode) {
  // In demo mode we still initialize Firebase but will handle errors gracefully
  const demoConfig = {
    apiKey: 'demo-key',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-retos-diarios',
    storageBucket: 'demo-retos-diarios.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
  }
  app = initializeApp(demoConfig)
} else {
  app = initializeApp(firebaseConfig)
}

auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)

// Enable offline persistence (ignore errors in demo mode)
enableIndexedDbPersistence(db).catch(() => {})

export { auth, db, storage, isDemoMode }
export default app
