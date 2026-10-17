import { readFile } from 'node:fs/promises'
import { compile } from '@mdx-js/mdx'
import type { CompileOptions } from '@mdx-js/mdx'
import type { Plugin } from 'vite'

const PREFIX = '\0mdx-meta:'

/**
 * `import.meta.glob('./posts/*.mdx', { query: '?meta', … })` → a tiny module
 * exporting only the post's validated `frontmatter`. Lists can then load every
 * post's metadata eagerly while each post body stays a separate lazy chunk.
 *
 * Meta comes from compiling the MDX with the same remark plugins as the real
 * build (remarkContentMeta puts it on file.data.meta), so validation and
 * reading time have one source of truth. The id is virtual (\0-prefixed), so
 * @mdx-js/rollup doesn't try to compile the generated module as MDX.
 */
export function mdxMeta(options: CompileOptions): Plugin {
  return {
    name: 'yangfan:mdx-meta',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith('.mdx?meta')) return null
      const resolved = await this.resolve(source.slice(0, -'?meta'.length), importer, { skipSelf: true })
      return resolved ? PREFIX + resolved.id : null
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) return null
      const path = id.slice(PREFIX.length)
      this.addWatchFile(path)
      const file = await compile({ path, value: await readFile(path, 'utf8') }, options)
      return `export const frontmatter = ${JSON.stringify(file.data.meta ?? null)}\n`
    },
  }
}
