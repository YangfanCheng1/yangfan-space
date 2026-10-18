import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'
import { missingContent } from '../src/site/site.ts'

/** Counts <Placeholder …> uses per MDX file. */
export async function placeholdersIn(dir: string, root: string): Promise<{ file: string; count: number }[]> {
  const entries = await readdir(dir, { recursive: true })
  const out: { file: string; count: number }[] = []
  for (const name of entries.filter((n) => n.endsWith('.mdx'))) {
    const text = await readFile(join(dir, name), 'utf8')
    const count = (text.match(/<Placeholder\b/g) ?? []).length
    if (count) out.push({ file: relative(root, join(dir, name)).replace(/\\/g, '/'), count })
  }
  return out.sort((a, b) => a.file.localeCompare(b.file))
}

/** Human-readable summary; empty string when nothing is missing. */
export function formatReport(missing: { required: string[]; optional: string[] }, placeholders: { file: string; count: number }[]): string {
  const lines: string[] = []
  if (missing.required.length || placeholders.length) {
    lines.push('Content still to write (shows as "To write:" on the site):')
    for (const m of missing.required) lines.push(`  • ${m}`)
    for (const p of placeholders) lines.push(`  • ${p.count} placeholder${p.count === 1 ? '' : 's'} in ${p.file}`)
  }
  if (missing.optional.length) lines.push(`Optional, not set: ${missing.optional.join(', ')}`)
  return lines.join('\n')
}

/** Lists unwritten content on every production build, so placeholders never ship unnoticed. */
export function contentCheck({ contentDir, root }: { contentDir: string; root: string }): Plugin {
  return {
    name: 'yangfan:content-check',
    apply: 'build',
    async buildStart() {
      const report = formatReport(missingContent(), await placeholdersIn(contentDir, root))
      if (report) this.warn(report)
    },
  }
}
