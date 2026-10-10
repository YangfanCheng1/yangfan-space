import { BackToGateway } from '../_shared/BackToGateway'

export default function AvatarBuilderApp() {
  return (
    <main className="grid min-h-dvh place-items-center bg-sky-50 p-6 text-slate-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Avatar Builder</h1>
        <p className="mt-2 text-slate-500">Coming next: SVG layers, color pickers, PNG export.</p>
      </div>
      <BackToGateway />
    </main>
  )
}
