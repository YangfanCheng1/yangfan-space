import { Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { apps } from '@/apps/registry'
import { GatewayPage } from '@/gateway/GatewayPage'

function Loading() {
  return <div className="grid min-h-dvh place-items-center bg-ink font-mono text-sm text-paper uppercase">Loading…</div>
}

function NotFound() {
  return (
    <div className="halftone grid min-h-dvh place-items-center bg-paper p-6 text-center text-ink">
      <div>
        <p className="font-display text-7xl">404</p>
        <p className="mt-2 font-mono uppercase">This panel was never drawn.</p>
        <Link to="/" className="mt-6 inline-block font-mono font-bold underline">
          ← Back to the front door
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<GatewayPage />} />
          {apps.map(({ slug, component: AppComponent }) =>
            AppComponent ? <Route key={slug} path={`/${slug}/*`} element={<AppComponent />} /> : null,
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
