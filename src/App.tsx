import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { builtApps } from '@/apps/registry'
import { SiteLayout } from '@/site/components/SiteLayout'
import { About } from '@/site/pages/About'
import { Blog } from '@/site/pages/Blog'
import { Home } from '@/site/pages/Home'
import { NotFound } from '@/site/pages/NotFound'
import { Post } from '@/site/pages/Post'
import { Projects } from '@/site/pages/Projects'

function Loading() {
  return <div className="grid min-h-dvh place-items-center bg-ink font-mono text-sm text-paper uppercase">Loading…</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Portfolio + blog (spec: docs/specs/portfolio-blog.md) */}
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<Post />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Apps keep their own routes and looks */}
          {builtApps.map(({ slug, component: AppComponent }) =>
            AppComponent ? <Route key={slug} path={`/${slug}/*`} element={<AppComponent />} /> : null,
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
