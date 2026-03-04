import {
  collection, doc, getDoc, setDoc, updateDoc,
  query, where, getDocs, orderBy, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, isDemoMode } from '../firebase'
import { demoStore } from './demoData'
import { formatInTimeZone } from 'date-fns-tz'

const TZ = 'Europe/Madrid'

export function getFechaHoy() {
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
}

// ─── RETOS SERVICE ──────────────────────────────────────────────────────────

export async function getRetoDiario() {
  const fecha = getFechaHoy()

  if (isDemoMode) {
    return demoStore.getRetoDiario(fecha)
  }

  const diarioRef = doc(db, 'reto_diario', fecha)
  const snap = await getDoc(diarioRef)

  if (snap.exists()) return { id: snap.id, ...snap.data() }

  // Select random unused reto
  const q = query(collection(db, 'retos'), where('usado', '==', false))
  let snaps = await getDocs(q)
  let retos = snaps.docs.map(d => ({ id: d.id, ...d.data() }))

  if (retos.length === 0) {
    // Reset all retos
    const all = await getDocs(collection(db, 'retos'))
    await Promise.all(all.docs.map(d => updateDoc(d.ref, { usado: false })))
    const resetted = await getDocs(collection(db, 'retos'))
    retos = resetted.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const reto = retos[Math.floor(Math.random() * retos.length)]
  await updateDoc(doc(db, 'retos', reto.id), { usado: true, fechaUsado: Timestamp.now() })

  const diario = {
    retoId: reto.id,
    retoTexto: reto.texto,
    categoria: reto.categoria,
    fecha: Timestamp.now(),
    completado: false,
  }
  await setDoc(diarioRef, diario)
  return { id: fecha, ...diario }
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
    texto, categoria, creadoPor,
    fechaCreacion: Timestamp.now(),
    usado: false,
    fechaUsado: null,
  })
  return { id: ref2.id, texto, categoria, creadoPor, usado: false }
}

export async function deleteReto(id) {
  if (isDemoMode) { demoStore.deleteReto(id); return }
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'retos', id))
}

// ─── POSTS SERVICE ──────────────────────────────────────────────────────────

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
    fotosUrls = await Promise.all(
      archivos.map(async (file) => {
        const storageRef = ref(storage, `posts/${fecha}/${usuario.uid}/${file.name}`)
        await uploadBytes(storageRef, file)
        return getDownloadURL(storageRef)
      })
    )
  }

  if (isDemoMode) {
    return demoStore.subirRespuesta(fecha, usuario.uid, usuario.nombre, usuario.emoji, texto, fotosUrls)
  }

  const postRef = doc(db, 'posts', fecha)
  const existing = await getDoc(postRef)
  const diario = await getRetoDiario()

  const respuesta = {
    usuarioId: usuario.uid,
    usuarioNombre: usuario.nombre,
    emoji: usuario.emoji,
    texto,
    fotos: fotosUrls,
    fechaSubida: Timestamp.now(),
  }

  if (existing.exists()) {
    const data = existing.data()
    const respuestas = data.respuestas.filter(r => r.usuarioId !== usuario.uid)
    respuestas.push(respuesta)
    const completadoPor = [...new Set([...data.completadoPor, usuario.uid])]
    await updateDoc(postRef, {
      respuestas,
      completadoPor,
      completadoTotal: completadoPor.length >= 2,
    })
  } else {
    await setDoc(postRef, {
      retoId: diario.retoId,
      retoDiarioId: fecha,
      retoTexto: diario.retoTexto,
      categoria: diario.categoria,
      fecha: Timestamp.now(),
      respuestas: [respuesta],
      completadoPor: [usuario.uid],
      completadoTotal: false,
    })
  }

  return await getPost(fecha)
}

// ─── USUARIOS SERVICE ────────────────────────────────────────────────────────

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
  const completados = posts.filter(p => p.completadoTotal)
  
  let racha = 0
  const hoy = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - i)
    const key = formatInTimeZone(d, TZ, 'yyyy-MM-dd')
    if (completados.some(p => p.id === key)) { racha++ } else { break }
  }

  return { total: completados.length, racha, rachaMax: racha }
}
