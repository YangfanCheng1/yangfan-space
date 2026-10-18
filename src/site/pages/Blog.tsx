import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui'
import { filterByTag, tagCounts } from '@/content/postUtils'
import { posts } from '@/content/posts'
import { PostList } from '../components/PostList'
import { SectionHeading } from '../components/SectionHeading'
import { TagFilter } from '../components/TagFilter'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** /blog, with a tag filter kept in the URL (?tag=react) so it can be shared (spec BL1). */
export function Blog() {
  const [params] = useSearchParams()
  const tag = params.get('tag')
  const tags = tagCounts(posts)
  const shown = filterByTag(posts, tag)

  useDocumentTitle(tag ? `Posts tagged #${tag}` : 'Blog')

  return (
    <>
      <SectionHeading level={1} note={posts.length ? `${posts.length} post${posts.length === 1 ? '' : 's'}` : undefined}>
        Blog
      </SectionHeading>
      <p className="mb-6 max-w-prose text-base sm:text-lg">Notes on building things: what worked, what didn&apos;t, and what I&apos;d change.</p>

      <TagFilter basePath="/blog" tags={tags} active={tag} />

      {shown.length ? (
        <PostList posts={shown} />
      ) : (
        <Card className="p-6">
          {posts.length ? (
            <>
              <p className="font-display text-xl uppercase">No posts tagged #{tag}</p>
              <Link to="/blog" className="mt-2 inline-block font-mono text-xs font-bold uppercase underline underline-offset-4">
                Show all posts
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-xl uppercase">No posts yet</p>
              <p className="mt-2 text-sm text-ink/75">The first one is on its way.</p>
            </>
          )}
        </Card>
      )}
    </>
  )
}
