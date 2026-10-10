import { BackToGateway } from '../_shared/BackToGateway'

export default function GalleryApp() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6 text-zinc-900">
      <div className="text-center">
        <h1 className="font-serif text-4xl">Ink Gallery</h1>
        <p className="mt-2 text-zinc-500">Coming next: filterable grid and lightbox.</p>
      </div>
      <BackToGateway />
    </main>
  )
}
