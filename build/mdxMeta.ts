import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { compile } from '@mdx-js/mdx'
import type { CompileOptions } from '@mdx-js/mdx'
import type { Plugin } from 'vite'
import type { PostMeta } from '../src/content/schema.ts'

const PREFIX = '\0mdx-meta:'

/** Validated metadata for one post, via the same remark plugins as the real build. */
export async function readPostMeta(path: string, options: CompileOptions): Promise<PostMeta | undefined> {
  const file = await compile({ path, value: await readFile(path, 'utf8') }, options)
  return file.data.meta as PostMeta | undefined
}

/** Metadata for every post in a folder. */
export async function readAllPostMeta(dir: string, options: CompileOptions): Promise<PostMeta[]> {
  const names = (await readdir(dir)).filter((n) => n.endsWith('.mdx'))
  const metas = await Promise.all(names.map((n) => readPostMeta(join(dir, n), options)))
  return metas.filter((m): m is PostMeta => m !== undefined)
}

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
      return `export const frontmatter = ${JSON.stringify((await readPostMeta(path, options)) ?? null)}\n`
    },
  }
}
