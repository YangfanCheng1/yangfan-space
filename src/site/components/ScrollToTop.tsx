import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Client-side navigation keeps the old scroll position by default, so a post
 * opened from halfway down the list would start halfway down. Reset on every
 * new page, unless the URL targets a section (#hash), which the page handles.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
