import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
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

const isDemoMode =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'YOUR_API_KEY'

const demoConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo-retos-diarios',
  storageBucket: 'demo-retos-diarios.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
}

const app = initializeApp(isDemoMode ? demoConfig : firebaseConfig)
const auth = getAuth(app)

// Firebase recomienda la inicialización de caché persistente en initializeFirestore.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
})

const storage = getStorage(app)

export { auth, db, storage, isDemoMode }
export default app
