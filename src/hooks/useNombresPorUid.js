import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUsuario } from '../services/firebaseService'
import { isGenericNombre } from '../utils/user'

/**
 * Hook que resuelve nombres de usuario por UID a partir de las respuestas de un post.
 * Elimina duplicacion entre ModalVerRespuestas y HistorialPage.PostDetail.
 *
 * @param {Object|null} post — El post con campo `respuestas[]`
 * @returns {{ resolveNombre: (resp) => string }}
 */
export default function useNombresPorUid(post) {
  const { currentUser, userProfile } = useAuth()
  const [nombresPorUid, setNombresPorUid] = useState({})

  useEffect(() => {
    let alive = true

    async function loadNombres() {
      const uids = [...new Set((post?.respuestas || []).map(r => r?.usuarioId).filter(Boolean))]
      if (uids.length === 0) {
        if (alive) setNombresPorUid({})
        return
      }

      const pairs = await Promise.all(
        uids.map(async (uid) => {
          const perfil = await getUsuario(uid)
          return [uid, perfil?.nombre || null]
        })
      )

      if (!alive) return
      const map = {}
      for (const [uid, nombre] of pairs) {
        if (nombre) map[uid] = nombre
      }
      setNombresPorUid(map)
    }

    loadNombres().catch(() => {
      if (alive) setNombresPorUid({})
    })

    return () => {
      alive = false
    }
  }, [post?.id, post?.respuestas])

  function resolveNombre(resp) {
    if (!resp) return ''

    const byUid = resp.usuarioId ? nombresPorUid[resp.usuarioId] : null
    if (!isGenericNombre(byUid)) return byUid

    const raw = String(resp.usuarioNombre || '').trim()
    if (!isGenericNombre(raw)) return raw

    if (resp.usuarioId && resp.usuarioId === currentUser?.uid) {
      return userProfile?.nombre || 'Tu'
    }
    return 'Tu pareja'
  }

  return { resolveNombre }
}
