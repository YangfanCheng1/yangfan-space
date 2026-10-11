import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ButtonLink, Card } from '../components/ui'
import { BASE } from '../tools'

export function NotFound() {
  useDocumentTitle('Not found')
  return (
    <Card className="mx-auto mt-12 max-w-lg p-8 text-center">
      <p className="pf-num text-6xl font-bold">$0.00</p>
      <p className="mt-3 font-mono text-sm uppercase">Nothing on this line of the ledger.</p>
      <ButtonLink to={BASE} className="mt-6">
        Back to the hub
      </ButtonLink>
    </Card>
  )
}
