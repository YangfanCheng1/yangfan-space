import { Outlet, Route, Routes } from 'react-router-dom'
import { Banners } from './components/Banners'
import { Nav } from './components/Nav'
import { Fire } from './pages/Fire'
import { Hub } from './pages/Hub'
import { NetWorth } from './pages/NetWorth'
import { NotFound } from './pages/NotFound'
import { Settings } from './pages/Settings'
import './theme.css'

function Layout() {
  return (
    <div className="pf-root halftone flex min-h-dvh flex-col bg-paper font-body text-ink">
      <Nav />
      <Banners />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t-[2.5px] border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 font-mono text-xs uppercase sm:px-6">
          <span>Stored only in this browser.</span>
          <span>Not financial advice.</span>
        </div>
      </footer>
    </div>
  )
}

/** Mounted by the gateway at /personal-finance/*; paths below are relative to that. */
export default function PersonalFinanceApp() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Hub />} />
        <Route path="net-worth" element={<NetWorth />} />
        <Route path="fire" element={<Fire />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
