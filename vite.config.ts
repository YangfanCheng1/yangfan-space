/// <reference types="vitest/config" />
import type { CompileOptions } from '@mdx-js/mdx'
import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import { mdxMeta } from './build/mdxMeta.ts'
import { remarkContentMeta } from './build/remarkContentMeta.ts'
import { rssPlugin } from './build/rssPlugin.ts'

/** MDX for posts and case studies (spec: docs/specs/portfolio-blog.md §8). */
const remarkPlugins: CompileOptions['remarkPlugins'] = [
  remarkFrontmatter,
  remarkGfm,
  remarkContentMeta,
  [remarkMdxFrontmatter, { name: 'frontmatter' }],
]
/** Metadata only: no rehype work, so lists and the feed stay quick to build. */
const metaOptions: CompileOptions = { remarkPlugins }
/** Full content: heading ids for anchors, and build-time syntax highlighting (no highlighter ships). */
const contentOptions: CompileOptions = {
  remarkPlugins,
  rehypePlugins: [rehypeSlug, [rehypeShiki, { theme: 'github-dark-default' }]],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdxMeta(metaOptions), // `*.mdx?meta` → front matter only (keeps post bodies out of the main bundle)
    { enforce: 'pre', ...mdx(contentOptions) },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
    rssPlugin({
      postsDir: fileURLToPath(new URL('./src/content/posts', import.meta.url)),
      metaOptions,
      title: "Yangfan's Space",
      description: 'Notes on building things, and the projects that came out of them.',
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
})
