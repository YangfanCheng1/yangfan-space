import { useContext, useEffect } from 'react'
import { applyMetaToDocument, MetaContext } from './meta'
import type { PageMeta } from './meta'

/**
 * Declares the current page's metadata. During pre-rendering it's recorded
 * synchronously (effects don't run on the server); in the browser it updates
 * <head> after each navigation. Pass null to let a child (e.g. NotFound) own the metadata.
 */
export function usePageMeta(meta: PageMeta | null) {
  const collect = useContext(MetaContext)
  if (collect && meta) collect(meta)
  const key = meta ? JSON.stringify(meta) : ''
  useEffect(() => {
    if (key) applyMetaToDocument(JSON.parse(key) as PageMeta)
  }, [key])
}
