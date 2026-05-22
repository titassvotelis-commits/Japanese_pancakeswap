import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TRADE_PATHS = ['/swap', '/liquidity', '/add', '/remove', '/find']

/** Trade routes use the same gray header as the footer (see Global.tsx). */
export function useTradeNavHeader(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    const isTrade = TRADE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    document.body.classList.toggle('trade-nav-header', isTrade)
    return () => document.body.classList.remove('trade-nav-header')
  }, [pathname])
}
