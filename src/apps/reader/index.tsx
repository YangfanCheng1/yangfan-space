import { BackToGateway } from '../_shared/BackToGateway'

export default function ReaderApp() {
  return (
    <main className="grid min-h-dvh place-items-center bg-neutral-900 p-6 text-neutral-100">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Comic Reader</h1>
        <p className="mt-2 text-neutral-400">Coming next: pages, panel zoom, commentary, ← → navigation.</p>
      </div>
      <BackToGateway />
    </main>
  )
}
