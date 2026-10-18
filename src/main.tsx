import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { preloadForPath } from './site/preload'

/**
 * Pre-rendered pages arrive with HTML for exactly one path (data-prerendered
 * on #root, rendered without a query string). If that's exactly the page we're
 * on, hydrate it; otherwise (an app route served the shell, a host's fallback
 * served another page's HTML, or ?tag= filters change what the page shows)
 * start fresh so React never adopts markup for a different page.
 */
async function start() {
  const root = document.getElementById('root')!
  const path = location.pathname.replace(/\/+$/, '') || '/'
  const prerenderedFor = root.dataset.prerendered
  const preloaded = await preloadForPath(path)
  const app = (
    <StrictMode>
      <App preloaded={preloaded} />
    </StrictMode>
  )
  if (prerenderedFor === path && !location.search && root.hasChildNodes()) {
    hydrateRoot(root, app)
  } else {
    root.textContent = ''
    delete root.dataset.prerendered
    createRoot(root).render(app)
  }
}

void start()
