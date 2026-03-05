// Demo data store — used when Firebase is not configured
// All state lives in memory + localStorage

import {
  getFechaKey,
  isFechaKey,
  getRachaActual,
  getRachaMax,
} from '../utils/streak'
import RETOS_INICIALES from '../data/retosIniciales'

const DEMO_POSTS = [
  {
    id: '2026-02-28',
    retoDiarioId: '2026-02-28',
    retoTexto: 'Mándame un selfie haciendo la mueca más rara que puedas',
    fecha: new Date('2026-02-28'),
    respuestas: [
      { usuarioId: 'user1', usuarioNombre: 'Él', emoji: '🧔', texto: 'Aquí mi obra maestra 😂', fotos: [], fechaSubida: new Date('2026-02-28') },
      { usuarioId: 'user2', usuarioNombre: 'Ella', emoji: '👩', texto: 'No me superas ni de broma', fotos: [], fechaSubida: new Date('2026-02-28') },
    ],
    completadoPor: ['user1', 'user2'],
    completadoTotal: true,
    categoria: 'foto',
  },
  {
    id: '2026-02-27',
    retoDiarioId: '2026-02-27',
    retoTexto: 'Escríbeme un haiku (5-7-5 sílabas) sobre mí',
    fecha: new Date('2026-02-27'),
    respuestas: [
      { usuarioId: 'user1', usuarioNombre: 'Él', emoji: '🧔', texto: 'Tu risa es mi luz\nen días grises y fríos\neres mi calor', fotos: [], fechaSubida: new Date('2026-02-27') },
    ],
    completadoPor: ['user1'],
    completadoTotal: false,
    categoria: 'texto',
  },
  {
    id: '2026-02-26',
    retoDiarioId: '2026-02-26',
    retoTexto: 'Escríbeme algo que nunca me hayas dicho pero quieras que sepa',
    fecha: new Date('2026-02-26'),
    respuestas: [
      { usuarioId: 'user1', usuarioNombre: 'Él', emoji: '🧔', texto: 'Que pensar en ti al despertar me hace el día más fácil', fotos: [], fechaSubida: new Date('2026-02-26') },
      { usuarioId: 'user2', usuarioNombre: 'Ella', emoji: '👩', texto: 'Que guardo cada voz que me mandas para escucharlas cuando te echo de menos', fotos: [], fechaSubida: new Date('2026-02-26') },
    ],
    completadoPor: ['user1', 'user2'],
    completadoTotal: true,
    categoria: 'romantico',
  },
]

// Simple in-memory + localStorage store
class DemoStore {
  constructor() {
    this._load()
  }

  _load() {
    try {
      const stored = localStorage.getItem('demoStore')
      if (stored) {
        const parsed = JSON.parse(stored)
        
        // Ensure new challenges from source code get appended to local storage over time
        const storedRetos = parsed.retos || []
        const newRetos = RETOS_INICIALES.filter(r => !storedRetos.some(sr => sr.id === r.id))
        this.retos = [...storedRetos, ...newRetos]
        
        this.retoDiario = parsed.retoDiario || {}
        this.posts = (parsed.posts || [...DEMO_POSTS]).map(p => ({
          ...p,
          fecha: new Date(p.fecha),
          respuestas: p.respuestas.map(r => ({ ...r, fechaSubida: new Date(r.fechaSubida) })),
        }))
        this.usuarios = parsed.usuarios || {
          user1: { id: 'user1', nombre: 'Él', emoji: '🧔', color: '#E8614A', retosCreados: 0, retosCompletados: 0 },
          user2: { id: 'user2', nombre: 'Ella', emoji: '👩', color: '#F0B429', retosCreados: 0, retosCompletados: 0 },
        }
      } else {
        this.retos = [...RETOS_INICIALES]
        this.retoDiario = {}
        this.posts = [...DEMO_POSTS]
        this.usuarios = {
          user1: { id: 'user1', nombre: 'Él', emoji: '🧔', color: '#E8614A', retosCreados: 5, retosCompletados: 12 },
          user2: { id: 'user2', nombre: 'Ella', emoji: '👩', color: '#F0B429', retosCreados: 7, retosCompletados: 12 },
        }
      }
    } catch {
      this.retos = [...RETOS_INICIALES]
      this.retoDiario = {}
      this.posts = [...DEMO_POSTS]
      this.usuarios = {
        user1: { id: 'user1', nombre: 'Él', emoji: '🧔', color: '#E8614A', retosCreados: 5, retosCompletados: 12 },
        user2: { id: 'user2', nombre: 'Ella', emoji: '👩', color: '#F0B429', retosCreados: 7, retosCompletados: 12 },
      }
    }
  }

  _save() {
    try {
      localStorage.setItem('demoStore', JSON.stringify({
        retos: this.retos,
        retoDiario: this.retoDiario,
        posts: this.posts,
        usuarios: this.usuarios,
      }))
    } catch {}
  }

  // Retos
  getRetos() { return this.retos }
  
  getRetoDiario(fecha) {
    if (this.retoDiario[fecha]) {
      return { ...this.retoDiario[fecha], retoId: this.retoDiario[fecha].retoId }
    }
    // Create one
    const disponibles = this.retos.filter(r => !r.usado)
    let pool = disponibles.length > 0 ? disponibles : this.retos
    if (disponibles.length === 0) {
      // reset all
      this.retos = this.retos.map(r => ({ ...r, usado: false }))
      pool = this.retos
    }
    if (pool.length === 0) {
      throw new Error('No hay retos disponibles. Agrega al menos un reto.')
    }
    const idx = Math.floor(Math.random() * pool.length)
    const reto = pool[idx]
    this.retos = this.retos.map(r => r.id === reto.id ? { ...r, usado: true, fechaUsado: new Date() } : r)
    const diario = {
      id: fecha,
      retoId: reto.id,
      retoTexto: reto.texto,
      categoria: reto.categoria,
      fecha: new Date(),
      completado: false,
    }
    this.retoDiario[fecha] = diario
    this._save()
    return diario
  }

  addReto(texto, categoria, creadoPor) {
    const reto = {
      id: 'custom_' + Date.now(),
      texto,
      categoria,
      creadoPor,
      fechaCreacion: new Date(),
      usado: false,
      fechaUsado: null,
    }
    this.retos.push(reto)
    this._save()
    return reto
  }

  deleteReto(id) {
    this.retos = this.retos.filter(r => r.id !== id)
    this._save()
  }

  // Posts
  getPosts() { return [...this.posts].sort((a, b) => b.fecha - a.fecha) }
  
  getPost(fecha) { return this.posts.find(p => p.id === fecha) }

  subirRespuesta(fecha, usuarioId, usuarioNombre, emoji, texto, fotos) {
    let post = this.posts.find(p => p.id === fecha)
    const diario = this.retoDiario[fecha]
    const respuesta = { usuarioId, usuarioNombre, emoji, texto, fotos: fotos || [], fechaSubida: new Date() }

    if (!post) {
      post = {
        id: fecha,
        retoDiarioId: fecha,
        retoTexto: diario?.retoTexto || '',
        categoria: diario?.categoria || 'foto',
        fecha: new Date(),
        respuestas: [respuesta],
        completadoPor: [usuarioId],
        completadoTotal: false,
      }
      this.posts.push(post)
    } else {
      // Remove old response from this user if exists
      post.respuestas = post.respuestas.filter(r => r.usuarioId !== usuarioId)
      post.respuestas.push(respuesta)
      if (!post.completadoPor.includes(usuarioId)) post.completadoPor.push(usuarioId)
      post.completadoTotal = post.completadoPor.length >= 2
    }

    if (diario) {
      this.retoDiario[fecha] = { ...diario, completado: post.completadoTotal }
    }

    this._save()
    return post
  }

  // Usuarios
  getUsuario(uid) { return this.usuarios[uid] }
  
  updateUsuario(uid, data) {
    this.usuarios[uid] = { ...this.usuarios[uid], ...data }
    this._save()
    return this.usuarios[uid]
  }

  // Stats
  getStats() {
    const posts = this.posts
    const completadoKeys = new Set(
      posts
        .filter(p => p.completadoTotal)
        .map(p => p.retoDiarioId || p.id)
        .filter(isFechaKey)
    )
    const racha = getRachaActual(completadoKeys)
    const rachaMax = getRachaMax(completadoKeys)

    return {
      total: completadoKeys.size,
      racha,
      rachaMax,
      user1Retos: this.usuarios.user1?.retosCreados || 0,
      user2Retos: this.usuarios.user2?.retosCreados || 0,
    }
  }
}

export const demoStore = new DemoStore()
