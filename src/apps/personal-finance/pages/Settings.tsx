import { PageHeader } from '../components/PageHeader'
import { UnderConstruction } from '../components/UnderConstruction'

export function Settings() {
  return (
    <>
      <PageHeader kicker="Your data" title="Settings">
        Everything here is stored only in this browser. Back it up, move it, or wipe it.
      </PageHeader>
      <UnderConstruction
        milestone="M4"
        items={['Export a JSON backup', 'Import a backup', 'Load / clear sample data', 'Delete all data']}
      />
    </>
  )
}
