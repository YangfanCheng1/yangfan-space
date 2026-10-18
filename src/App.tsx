import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'
import { PreloadContext } from './site/preload'
import type { Preloaded } from './site/preload'

export default function App({ preloaded = new Map() }: { preloaded?: Preloaded }) {
  return (
    <PreloadContext.Provider value={preloaded}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PreloadContext.Provider>
  )
}
