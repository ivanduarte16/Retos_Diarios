import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for pull-to-refresh gesture on mobile.
 * Returns refs and handlers to attach to a scrollable container.
 *
 * @param {() => Promise<void>} onRefresh - async function to run on refresh
 * @param {{ threshold?: number }} opts
 */
export default function usePullToRefresh(onRefresh, { threshold = 80 } = {}) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const scrollTop = useRef(0)

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY
    scrollTop.current = e.currentTarget?.scrollTop || 0
  }, [])

  const onTouchMove = useCallback((e) => {
    if (refreshing) return
    if (scrollTop.current > 0) return // Only allow pull when at top

    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) {
      setPulling(true)
      setPullDistance(Math.min(delta * 0.5, threshold * 1.5))
    }
  }, [refreshing, threshold])

  const onTouchEnd = useCallback(async () => {
    if (!pulling) return

    if (pullDistance >= threshold) {
      setRefreshing(true)
      try { await onRefresh() } catch (e) { console.error(e) }
      setRefreshing(false)
    }

    setPulling(false)
    setPullDistance(0)
  }, [pulling, pullDistance, threshold, onRefresh])

  return {
    pulling,
    refreshing,
    pullDistance,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  }
}
