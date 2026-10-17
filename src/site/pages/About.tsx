import { Card } from '@/components/ui'
import { Placeholder } from '../components/Placeholder'
import { SectionHeading } from '../components/SectionHeading'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { site } from '../site'

const linkClass = 'font-bold underline decoration-2 underline-offset-4'

export function About() {
  useDocumentTitle('About')
  return (
    <>
      <SectionHeading level={1}>About</SectionHeading>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <Card className="flex flex-col gap-4 p-6 text-base sm:p-8 sm:text-lg">
          <p>
            I&apos;m {site.owner}, a {site.role.charAt(0).toLowerCase() + site.role.slice(1)}. This site is where I put the things I build
            for myself, and write about how they came together.
          </p>
          <Placeholder block>A few sentences about you: background, what you enjoy building, what you do away from the keyboard.</Placeholder>
          <p className="text-base">
            For the professional version, see{' '}
            <a href={site.aboutPage} className={linkClass}>
              my about page
            </a>
            .
          </p>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="font-display text-xl uppercase">Things I like working with</h2>
            <div className="mt-3 text-sm">
              <Placeholder>Languages, tools and topics you enjoy.</Placeholder>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl uppercase">Find me</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a href={site.links.github} className={linkClass}>
                  GitHub
                </a>
              </li>
              <li>{site.links.email ? <a href={`mailto:${site.links.email}`} className={linkClass}>Email</a> : <Placeholder>Email address</Placeholder>}</li>
              <li>{site.links.linkedin ? <a href={site.links.linkedin} className={linkClass}>LinkedIn</a> : <Placeholder>LinkedIn (optional)</Placeholder>}</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
