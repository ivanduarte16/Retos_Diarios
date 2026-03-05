import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import admin from 'firebase-admin'

const ROOT = process.cwd()
const LIST_PATH = path.join(ROOT, 'ListaRetos.txt')
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(ROOT, 'serviceAccountKey.json')

if (!fs.existsSync(LIST_PATH)) {
  console.error('No se encontro ListaRetos.txt en la raiz del proyecto.')
  process.exit(1)
}

if (!fs.existsSync(KEY_PATH)) {
  console.error('No se encontro la clave de servicio.')
  console.error('Coloca serviceAccountKey.json en la raiz o define GOOGLE_APPLICATION_CREDENTIALS.')
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

function classifyCategoria(text) {
  const lower = text.toLowerCase()
  if (
    lower.includes('foto') ||
    lower.includes('selfie') ||
    lower.includes('dibujar') ||
    lower.includes('calcetines') ||
    lower.includes('cristal')
  ) return 'foto'
  if (
    lower.includes('grabar') ||
    lower.includes('audio') ||
    lower.includes('cantar') ||
    lower.includes('llamor') ||
    lower.includes('caminando')
  ) return 'video'
  if (
    lower.includes('escribir') ||
    lower.includes('mensaje') ||
    lower.includes('resumir') ||
    lower.includes('documento')
  ) return 'texto'
  if (
    lower.includes('adivinar') ||
    lower.includes('pierde') ||
    lower.includes('regla')
  ) return 'juego'
  return 'tonteria'
}

function parseRetos(raw) {
  return raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

const raw = fs.readFileSync(LIST_PATH, 'utf8')
const retos = parseRetos(raw)

const existingSnap = await db.collection('retos').get()
const existingTextSet = new Set(
  existingSnap.docs
    .map((d) => String(d.get('texto') || '').trim().toLowerCase())
    .filter(Boolean)
)

let created = 0
let skipped = 0
let ops = 0
let batch = db.batch()
const BATCH_LIMIT = 400

for (const texto of retos) {
  const key = texto.toLowerCase()
  if (existingTextSet.has(key)) {
    skipped += 1
    continue
  }

  const ref = db.collection('retos').doc()
  batch.set(ref, {
    texto,
    categoria: classifyCategoria(texto),
    creadoPor: 'sistema',
    usado: false,
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
    fechaUsado: null,
  })
  existingTextSet.add(key)
  created += 1
  ops += 1

  if (ops >= BATCH_LIMIT) {
    await batch.commit()
    batch = db.batch()
    ops = 0
  }
}

if (ops > 0) {
  await batch.commit()
}

console.log(`Importacion completada. Creados: ${created}. Omitidos (ya existentes): ${skipped}.`)
