import { useEffect, useState } from 'react'

/** Defer mounting heavy UI until after the first paint (swap form loads first). */
export function useDeferredMount(active: boolean, timeoutMs = 200): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!active) {
      setReady(false)
      return undefined
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: timeoutMs })
      return () => window.cancelIdleCallback(id)
    }

    const id = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(id)
  }, [active, timeoutMs])

  return ready
}

export default useDeferredMount
