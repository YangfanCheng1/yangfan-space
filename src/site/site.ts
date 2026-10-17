/**
 * Site-wide identity and links. Facts only: anything not yet provided is
 * `null` and renders as a visible placeholder (see components/Placeholder).
 */
export const site = {
  name: "Yangfan's Space",
  owner: 'Yangfan',
  role: 'Software engineer at Meta',
  /** The existing, longer professional page. */
  aboutPage: 'https://yangfancheng1.github.io/about/',
  links: {
    /** Derived from the yangfancheng1.github.io domain. */
    github: 'https://github.com/yangfancheng1',
    email: null as string | null,
    linkedin: null as string | null,
  },
}
