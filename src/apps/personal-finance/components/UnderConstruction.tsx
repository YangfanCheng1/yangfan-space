import { Badge, Card } from './ui'

/** Temporary placeholder while a tool is being built (milestone-tagged). */
export function UnderConstruction({ milestone, items }: { milestone: string; items: string[] }) {
  return (
    <Card className="border-dashed p-6">
      <div className="flex items-center gap-3">
        <Badge tone="gold">{milestone}</Badge>
        <span className="font-mono text-xs font-bold uppercase">Under construction</span>
      </div>
      <ul className="mt-4 list-outside list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
