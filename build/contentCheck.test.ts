import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { formatReport, placeholdersIn } from './contentCheck.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const contentDir = fileURLToPath(new URL('../src/content', import.meta.url))

describe('placeholdersIn (real content)', () => {
  it('finds the About placeholder and nothing else unexpected', async () => {
    const found = await placeholdersIn(contentDir, root)
    expect(found).toContainEqual({ file: 'src/content/about.mdx', count: 1 })
    expect(found.every((f) => f.file.startsWith('src/content/'))).toBe(true)
  })
})

describe('formatReport', () => {
  it('lists required items and placeholder files', () => {
    const r = formatReport({ required: ['Email (site.links.email)'], optional: ['Photo (site.photo)'] }, [{ file: 'src/content/about.mdx', count: 2 }])
    expect(r).toBe(
      [
        'Content still to write (shows as "To write:" in npm run dev; hidden on the live site):',
        '  • Email (site.links.email)',
        '  • 2 placeholders in src/content/about.mdx',
        'Optional, not set: Photo (site.photo)',
      ].join('\n'),
    )
  })

  it('is empty when everything is written', () => expect(formatReport({ required: [], optional: [] }, [])).toBe(''))

  it('optional-only is a single gentle line', () => expect(formatReport({ required: [], optional: ['Photo (site.photo)'] }, [])).toBe('Optional, not set: Photo (site.photo)'))
})
