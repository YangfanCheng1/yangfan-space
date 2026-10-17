import { parse as parseYaml } from 'yaml'
import { ContentError, readingMinutes, slugFromPath, validatePost } from '../src/content/schema.ts'

/**
 * remark plugin for src/content/posts/*.mdx. Runs after remark-frontmatter and
 * before remark-mdx-frontmatter: it validates the YAML front matter (throwing
 * fails the build with the file and field), adds `slug` and `readingMinutes`,
 * and writes the normalized result back so it's exported as `frontmatter`.
 */
interface Node {
  type: string
  value?: string
  children?: Node[]
}

/** Prose text only (code blocks don't count toward reading time). */
function proseText(node: Node): string {
  if (node.type === 'code' || node.type === 'yaml' || node.type.startsWith('mdxjs')) return ''
  if (typeof node.value === 'string' && (node.type === 'text' || node.type === 'inlineCode')) return node.value + ' '
  return (node.children ?? []).map(proseText).join('')
}

export function remarkContentMeta() {
  return (tree: Node, file: { path?: string; history?: string[]; data: Record<string, unknown> }) => {
    const path = (file.path ?? file.history?.at(-1) ?? 'unknown.mdx').replace(/\\/g, '/')
    if (!path.includes('/src/content/posts/')) return
    const rel = path.slice(path.indexOf('src/content/'))

    const yamlNode = tree.children?.find((n) => n.type === 'yaml')
    let data: unknown
    try {
      data = yamlNode ? parseYaml(yamlNode.value ?? '') : undefined
    } catch (e) {
      throw new ContentError(rel, `front matter isn't valid YAML (${(e as Error).message.split('\n')[0]}).`)
    }
    const meta = { ...validatePost(data, rel), slug: slugFromPath(rel), readingMinutes: readingMinutes(proseText(tree)) }

    // JSON is valid YAML, so remark-mdx-frontmatter exports exactly this object.
    if (yamlNode) yamlNode.value = JSON.stringify(meta)
    // Drafts never ship: in production builds the body is dropped (spec BL3), so
    // the unpublished text isn't sitting in a public chunk.
    if (meta.draft && process.env.NODE_ENV === 'production') tree.children = yamlNode ? [yamlNode] : []
    file.data.meta = meta // read by the `?meta` loader (build/mdxMeta.ts)
  }
}
