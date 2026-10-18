/**
 * Everything personal on the site, in one place to edit. Facts only: anything
 * not provided yet is `null` and renders as a visible "To write" placeholder,
 * and `npm run build` lists what's still missing. The longer bio lives in
 * src/content/about.mdx.
 */
export interface SiteConfig {
  name: string
  owner: string
  role: string
  /** Existing, longer professional page. */
  aboutPage: string
  /** Home page intro, 2–3 sentences in your voice. */
  intro: string | null
  /** The "Now" panel on the home page. */
  now: { building: string; shipped: { label: string; href: string } | null }
  /** About → "Things I like working with". */
  interests: string[] | null
  /** Optional photo or avatar for About (put the file in public/). */
  photo: { src: string; alt: string } | null
  links: {
    /** Derived from the yangfancheng1.github.io domain. */
    github: string
    email: string | null
    linkedin: string | null
  }
}

export const site: SiteConfig = {
  name: "Yangfan's Space",
  owner: 'Yangfan',
  role: 'Software engineer at Meta',
  aboutPage: 'https://yangfancheng1.github.io/about/',
  intro: null,
  now: {
    building: 'This site: a portfolio + blog',
    shipped: { label: 'Personal Finance', href: '/projects/personal-finance' },
  },
  interests: null,
  photo: null,
  links: {
    github: 'https://github.com/yangfancheng1',
    email: null,
    linkedin: null,
  },
}

/** What's still unwritten. `optional` items are fine to leave out for good. */
export function missingContent(s: SiteConfig = site): { required: string[]; optional: string[] } {
  const required: string[] = []
  const optional: string[] = []
  if (!s.intro?.trim()) required.push('Home intro (site.intro)')
  if (!s.interests?.length) required.push('Things I like working with (site.interests)')
  if (!s.links.email) required.push('Email (site.links.email)')
  if (!s.links.linkedin) optional.push('LinkedIn (site.links.linkedin)')
  if (!s.photo) optional.push('Photo (site.photo)')
  return { required, optional }
}
