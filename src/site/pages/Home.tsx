import { Link } from 'react-router-dom'
import { ButtonLink, Card } from '@/components/ui'
import { posts } from '@/content/posts'
import { featuredProjects, plannedProjects, projects } from '@/content/projects'
import { PostList } from '../components/PostList'
import { Placeholder, showPlaceholders } from '../components/Placeholder'
import { ProjectCard } from '../components/ProjectCard'
import { SectionHeading } from '../components/SectionHeading'
import { usePageMeta } from '../seo/usePageMeta'
import { site } from '../site'

export function Home() {
  usePageMeta({ description: site.intro ?? site.description, path: '/' })

  return (
    <>
      {/* Intro (spec HM1) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card className="min-w-0 p-6 sm:p-10">
          <p className="font-mono text-xs font-bold tracking-widest uppercase">{site.role}</p>
          <h1 className="mt-4 font-display text-[2.6rem] leading-[0.92] uppercase sm:text-6xl lg:text-7xl">
            Hi, I&apos;m
            <br />
            <span className="ink-border shadow-pop-sm my-2 inline-block -rotate-1 bg-vermilion px-2 text-paper">{site.owner}.</span>
          </h1>
          <p className="mt-6 max-w-prose text-base sm:text-lg">
            This is my space for the things I build outside work, and for writing about how they came together.
          </p>
          {(site.intro || showPlaceholders) && (
            <div className="mt-4 max-w-prose text-base sm:text-lg">
              {site.intro ? <p>{site.intro}</p> : <Placeholder>Two or three sentences about you: what you work on, what you&apos;re curious about.</Placeholder>}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink to="/projects" size="lg">
              See projects
            </ButtonLink>
            <ButtonLink to="/blog" size="lg" variant="ghost">
              Read the blog
            </ButtonLink>
          </div>
        </Card>

        <Card
          tone="teal"
          className="halftone flex min-h-64 flex-col justify-between gap-6 p-6"
          style={{ ['--halftone' as string]: 'rgb(248 246 240 / 0.16)' }}
        >
          <div className="flex flex-col gap-5">
            <p className="font-mono text-xs font-bold tracking-widest uppercase">Now</p>
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="font-mono text-xs uppercase opacity-90">Building</dt>
                <dd className="font-display text-xl leading-tight uppercase">{site.now.building}</dd>
              </div>
              {site.now.shipped && (
                <div>
                  <dt className="font-mono text-xs uppercase opacity-90">Recently shipped</dt>
                  <dd className="font-display text-xl leading-tight uppercase">
                    <Link to={site.now.shipped.href} className="underline decoration-2 underline-offset-4">
                      {site.now.shipped.label}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <dl className="grid auto-cols-fr grid-flow-col gap-3 border-t-2 border-dashed border-paper/60 pt-4">
            {(
              [
                [projects.filter((p) => p.status === 'live').length, 'Live'],
                [plannedProjects.length, 'On the bench'],
                [posts.length, 'Posts'],
              ] as const
            )
              // A zero reads as "nothing here"; show a count once there's something to count.
              .filter(([n]) => n > 0)
              .map(([n, label]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="mt-1 font-mono text-[11px] uppercase">{label}</dt>
                  <dd className="font-display text-4xl leading-none">{n}</dd>
                </div>
              ))}
          </dl>
        </Card>
      </section>

      {/* Featured projects (spec HM2) */}
      <section className="mt-16" aria-labelledby="featured">
        <SectionHeading note={<Link to="/projects" className="underline underline-offset-4">All projects →</Link>}>
          <span id="featured">Featured projects</span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.slice(0, 3).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* Latest posts (spec HM3) */}
      <section className="mt-16" aria-labelledby="latest">
        <SectionHeading note={<Link to="/blog" className="underline underline-offset-4">All posts →</Link>}>
          <span id="latest">Latest writing</span>
        </SectionHeading>
        {posts.length ? (
          <PostList posts={posts.slice(0, 3)} headingLevel={3} />
        ) : (
          <Card className="p-6">
            <p className="font-display text-xl uppercase">First post coming soon</p>
            <p className="mt-2 text-sm text-ink/75">Notes on building things: what worked, what didn&apos;t, and what I&apos;d change.</p>
          </Card>
        )}
      </section>
    </>
  )
}
