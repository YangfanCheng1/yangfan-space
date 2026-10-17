/// <reference types="vitest/config" />
import type { CompileOptions } from '@mdx-js/mdx'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import { mdxMeta } from './build/mdxMeta.ts'
import { remarkContentMeta } from './build/remarkContentMeta.ts'

/** MDX for posts and case studies (spec: docs/specs/portfolio-blog.md §8). */
const mdxOptions: CompileOptions = {
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkContentMeta, [remarkMdxFrontmatter, { name: 'frontmatter' }]],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdxMeta(mdxOptions), // `*.mdx?meta` → front matter only (keeps post bodies out of the main bundle)
    { enforce: 'pre', ...mdx(mdxOptions) },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
})
