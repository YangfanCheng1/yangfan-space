import { useEffect } from 'react'

/** Sets document.title to "<title> · Personal Finance" while mounted. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · Personal Finance`
    return () => {
      document.title = previous
    }
  }, [title])
}
