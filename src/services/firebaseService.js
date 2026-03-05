import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  runTransaction,
  deleteDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, isDemoMode } from '../firebase'
import { demoStore } from './demoData'
import { formatInTimeZone } from 'date-fns-tz'

const TZ = 'Europe/Madrid'
const FECHA_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function getFechaHoy() {
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
}

function getFechaKey(date) {
  return formatInTimeZone(date, TZ, 'yyyy-MM-dd')
}

function isFechaKey(value) {
  return FECHA_KEY_REGEX.test(String(value || ''))
}

function plusDays(fechaKey, days) {
  const [y, m, d] = fechaKey.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  base.setUTCDate(base.getUTCDate() + days)
  return formatInTimeZone(base, TZ, 'yyyy-MM-dd')
}

function getRachaActual(completadoKeys) {
  const today = new Date()
  const todayKey = getFechaKey(today)

  // If today is not completed yet, keep the streak alive from yesterday.
  const startOffset = completadoKeys.has(todayKey) ? 0 : 1

  let racha = 0
  for (let i = startOffset; i < 366; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = getFechaKey(d)
    if (completadoKeys.has(key)) {
      racha += 1
    } else {
      break
    }
  }

  return racha
}

function getRachaMax(completadoKeys) {
  const keys = [...completadoKeys].filter(isFechaKey).sort()
  if (keys.length === 0) return 0

  let max = 1
  let current = 1

  for (let i = 1; i < keys.length; i++) {
    if (keys[i] === plusDays(keys[i - 1], 1)) {
      current += 1
    } else {
      current = 1
    }
    if (current > max) max = current
  }

  return max
}

function getCompletadoKeySet(posts) {
  const keys = posts
    .filter(p => p?.completadoTotal)
    .map(p => p?.retoDiarioId || p?.id)
    .filter(isFechaKey)
  return new Set(keys)
}

function getNombreUsuarioSeguro(usuario) {
  const nombre = String(usuario?.nombre || '').trim()
  if (nombre && nombre.toLowerCase() !== 'usuario') return nombre

  const emailPrefix = String(usuario?.email || '').split('@')[0].trim()
  if (emailPrefix) return emailPrefix

  const uid = String(usuario?.uid || '').trim()
  if (uid) return `Usuario ${uid.slice(0, 6)}`

  return 'Usuario'
}

async function getRetosDisponibles() {
  const q = query(collection(db, 'retos'), where('usado', '==', false))
  const unused = await getDocs(q)
  if (!unused.empty) {
    return unused.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const all = await getDocs(collection(db, 'retos'))
  if (all.empty) return []

  console.info('[getRetosDisponibles] Todos los retos usados; reiniciando ciclo')
  await Promise.all(
    all.docs.map(d => updateDoc(d.ref, { usado: false, fechaUsado: null }))
  )

  return all.docs.map(d => ({ id: d.id, ...d.data(), usado: false, fechaUsado: null }))
}

// RETOS SERVICE
export async function getRetoDiario() {
  const fecha = getFechaHoy()

  if (isDemoMode) {
    return demoStore.getRetoDiario(fecha)
  }

  const diarioRef = doc(db, 'reto_diario', fecha)
  const snap = await getDoc(diarioRef)
  if (snap.exists()) return { id: snap.id, ...snap.data() }

  for (let attempt = 0; attempt < 8; attempt++) {
    const retos = await getRetosDisponibles()
    if (retos.length === 0) {
      throw new Error('No hay retos en la coleccion "retos". Agrega al menos uno.')
    }

    const reto = retos[Math.floor(Math.random() * retos.length)]
    const retoRef = doc(db, 'retos', reto.id)

    try {
      const diario = await runTransaction(db, async (tx) => {
        const existingDiario = await tx.get(diarioRef)
        if (existingDiario.exists()) {
          return { id: existingDiario.id, ...existingDiario.data() }
        }

        const retoSnap = await tx.get(retoRef)
        if (!retoSnap.exists()) throw new Error('RETRY_RETO_MISSING')

        const retoData = retoSnap.data()
        if (retoData?.usado) throw new Error('RETRY_RETO_USED')

        const now = Timestamp.now()
        const diarioData = {
          retoId: reto.id,
          retoTexto: retoData?.texto || '',
          categoria: retoData?.categoria || 'foto',
          fecha: now,
          completado: false,
        }

        tx.update(retoRef, { usado: true, fechaUsado: now })
        tx.set(diarioRef, diarioData)
        return { id: fecha, ...diarioData }
      })

      return diario
    } catch (error) {
      if (error?.message === 'RETRY_RETO_USED' || error?.message === 'RETRY_RETO_MISSING') {
        continue
      }
      throw error
    }
  }

  throw new Error('No se pudo crear el reto diario por concurrencia. Intenta recargar.')
}

export async function getRetos() {
  if (isDemoMode) return demoStore.getRetos()
  const snaps = await getDocs(collection(db, 'retos'))
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addReto(texto, categoria, creadoPor) {
  if (isDemoMode) return demoStore.addReto(texto, categoria, creadoPor)
  const ref2 = doc(collection(db, 'retos'))
  await setDoc(ref2, {
    texto,
    categoria,
    creadoPor,
    fechaCreacion: Timestamp.now(),
    usado: false,
    fechaUsado: null,
  })
  return { id: ref2.id, texto, categoria, creadoPor, usado: false }
}

export async function deleteReto(id) {
  if (isDemoMode) {
    demoStore.deleteReto(id)
    return
  }
  await deleteDoc(doc(db, 'retos', id))
}

// POSTS SERVICE
export async function getPost(fecha) {
  if (isDemoMode) return demoStore.getPost(fecha) || null
  const snap = await getDoc(doc(db, 'posts', fecha))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getPosts() {
  if (isDemoMode) return demoStore.getPosts()
  const q = query(collection(db, 'posts'), orderBy('fecha', 'desc'))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function subirRespuesta(fecha, usuario, texto, archivos) {
  let fotosUrls = []

  if (!isDemoMode && archivos.length > 0) {
    const resultados = await Promise.allSettled(
      archivos.map(async (file) => {
        const storageRef = ref(storage, `posts/${fecha}/${usuario.uid}/${file.name}`)
        await uploadBytes(storageRef, file)
        return getDownloadURL(storageRef)
      })
    )

    const ok = resultados.filter(r => r.status === 'fulfilled')
    const fail = resultados.filter(r => r.status === 'rejected')
    if (fail.length > 0) {
      console.error(`[subirRespuesta] ${fail.length} archivo(s) no se pudieron subir`, fail)
      if (ok.length === 0) {
        throw new Error('No se pudieron subir los archivos a Storage')
      }
    }
    fotosUrls = ok.map(r => r.value)
  }

  if (isDemoMode) {
    return demoStore.subirRespuesta(
      fecha,
      usuario.uid,
      getNombreUsuarioSeguro(usuario),
      usuario.emoji,
      texto,
      fotosUrls
    )
  }

  const diario = await getRetoDiario()
  const postRef = doc(db, 'posts', fecha)

  const respuestaBase = {
    usuarioId: usuario.uid,
    usuarioNombre: getNombreUsuarioSeguro(usuario),
    emoji: usuario.emoji,
    texto,
    fotos: fotosUrls,
    fechaSubida: Timestamp.now(),
  }

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(postRef)
    const respuesta = { ...respuestaBase, fechaSubida: Timestamp.now() }

    if (existing.exists()) {
      const data = existing.data()
      const respuestas = (data.respuestas || []).filter(r => r.usuarioId !== usuario.uid)
      respuestas.push(respuesta)
      const completadoPor = [...new Set([...(data.completadoPor || []), usuario.uid])]
      tx.update(postRef, {
        respuestas,
        completadoPor,
        completadoTotal: completadoPor.length >= 2,
      })
      return
    }

    tx.set(postRef, {
      retoId: diario.retoId,
      retoDiarioId: fecha,
      retoTexto: diario.retoTexto,
      categoria: diario.categoria,
      fecha: Timestamp.now(),
      respuestas: [respuesta],
      completadoPor: [usuario.uid],
      completadoTotal: false,
    })
  })

  return getPost(fecha)
}

// USUARIOS SERVICE
export async function getUsuario(uid) {
  if (isDemoMode) return demoStore.getUsuario(uid)
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUsuario(uid, data) {
  if (isDemoMode) return demoStore.updateUsuario(uid, data)
  await setDoc(doc(db, 'usuarios', uid), data, { merge: true })
  return data
}

export async function getStats() {
  if (isDemoMode) return demoStore.getStats()
  const posts = await getPosts()
  const completadoKeys = getCompletadoKeySet(posts)
  const racha = getRachaActual(completadoKeys)
  const rachaMax = getRachaMax(completadoKeys)

  return { total: completadoKeys.size, racha, rachaMax }
}
