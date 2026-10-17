import { useEffect } from 'react'
import { site } from '../site'

/** "<title> · Yangfan's Space", or just the site name on the home page. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : site.name
  }, [title])
}
