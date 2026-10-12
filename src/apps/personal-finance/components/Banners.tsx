import { useState } from 'react'
import { Link } from 'react-router-dom'
import { canPersist } from '../lib/browser'
import { usePersonalFinance } from '../store'
import { BASE } from '../tools'

const shell = 'mx-auto mt-4 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6'

/** App-wide notices above every page: sample data (spec ST3) and storage unavailable (spec §7). */
export function Banners() {
  const isSampleData = usePersonalFinance((s) => s.isSampleData)
  const clearAll = usePersonalFinance((s) => s.clearAll)
  const [persistOk] = useState(canPersist)
  const [storageDismissed, setStorageDismissed] = useState(false)

  return (
    <>
      {!persistOk && !storageDismissed && (
        <div className={shell} role="alert">
          <p className="ink-border basis-full bg-pf-gold px-4 py-2 text-sm sm:flex-1 sm:basis-0">
            <strong>▲ This browser isn't letting the page save data</strong> (private mode or blocked site data). Everything works,
            but it's gone when you close the tab — export a backup from Settings to keep it.
          </p>
          <button
            type="button"
            className="ink-border cursor-pointer bg-paper px-3 py-2 font-mono text-xs font-bold uppercase"
            onClick={() => setStorageDismissed(true)}
          >
            Dismiss
          </button>
        </div>
      )}
      {isSampleData && (
        <div className={shell} role="status">
          <p className="ink-border flex basis-full flex-wrap items-center gap-x-3 gap-y-1 bg-pf-lime px-4 py-2 text-sm sm:flex-1 sm:basis-0">
            <strong>You're viewing sample data.</strong>
            <span>Edit anything to make it yours, or start fresh.</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="ink-border cursor-pointer bg-ink px-3 py-2 font-mono text-xs font-bold text-paper uppercase"
              onClick={() => clearAll()}
            >
              Clear sample data
            </button>
            <Link to={`${BASE}/settings`} className="ink-border bg-paper px-3 py-2 font-mono text-xs font-bold uppercase">
              Settings
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
