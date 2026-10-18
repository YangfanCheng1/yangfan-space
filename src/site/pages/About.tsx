import AboutBody from '@/content/about.mdx'
import { Card } from '@/components/ui'
import { Placeholder } from '../components/Placeholder'
import { SectionHeading } from '../components/SectionHeading'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { mdxComponents } from '../mdx/components'
import '../prose.css'
import { site } from '../site'

const linkClass = 'font-bold underline decoration-2 underline-offset-4'

/** /about (spec §5.4): short and human. Bio from src/content/about.mdx, the rest from site.ts. */
export function About() {
  useDocumentTitle('About')
  const { links } = site

  return (
    <>
      <SectionHeading level={1}>About</SectionHeading>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <Card className="p-6 sm:p-8">
          <div className="prose-ink">
            <AboutBody components={mdxComponents} />
          </div>
          <p className="mt-6 text-base">
            For the professional version, see{' '}
            <a href={site.aboutPage} className={linkClass}>
              my about page
            </a>
            .
          </p>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            {site.photo ? (
              <img src={site.photo.src} alt={site.photo.alt} className="ink-border aspect-square w-full object-cover" />
            ) : (
              <Placeholder block>A photo or avatar (optional): set site.photo and add the image to public/.</Placeholder>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl uppercase">Things I like working with</h2>
            {site.interests?.length ? (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {site.interests.map((i) => (
                  <li key={i} className="before:mr-1.5 before:content-['▪']">
                    {i}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm">
                <Placeholder>Languages, tools and topics you enjoy.</Placeholder>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl uppercase">Find me</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a href={links.github} className={linkClass}>
                  GitHub
                </a>
              </li>
              <li>
                {links.email ? (
                  <a href={`mailto:${links.email}`} className={linkClass}>
                    Email
                  </a>
                ) : (
                  <Placeholder>Email address</Placeholder>
                )}
              </li>
              <li>
                {links.linkedin ? (
                  <a href={links.linkedin} className={linkClass}>
                    LinkedIn
                  </a>
                ) : (
                  <Placeholder>LinkedIn (optional)</Placeholder>
                )}
              </li>
              <li>
                <a href="/rss.xml" className={linkClass}>
                  RSS feed
                </a>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl uppercase">About this site</h2>
            <p className="mt-3 text-sm">
              Built with React, TypeScript, Vite, Tailwind CSS and MDX. Posts and project write-ups are checked when the site is built.
              Type is Archivo Black, Space Grotesk and Space Mono.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
