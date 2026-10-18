import { describe, expect, it } from 'vitest'
import { missingContent, site } from './site'

describe('missingContent', () => {
  it('lists what is still unwritten today', () => {
    expect(missingContent()).toEqual({
      required: ['Home intro (site.intro)', 'Things I like working with (site.interests)', 'Email (site.links.email)'],
      optional: ['LinkedIn (site.links.linkedin)', 'Photo (site.photo)'],
    })
  })

  it('is empty once everything is filled in', () => {
    const full = {
      ...site,
      intro: 'I build things.',
      interests: ['TypeScript'],
      photo: { src: '/me.jpg', alt: 'Yangfan' },
      links: { ...site.links, email: 'me@example.com', linkedin: 'https://linkedin.com/in/me' },
    }
    expect(missingContent(full)).toEqual({ required: [], optional: [] })
  })

  it('blank strings and empty lists still count as missing', () => {
    expect(missingContent({ ...site, intro: '   ', interests: [] }).required).toContain('Home intro (site.intro)')
    expect(missingContent({ ...site, intro: '   ', interests: [] }).required).toContain('Things I like working with (site.interests)')
  })

  it('only states facts: role and the professional page are set', () => {
    expect(site.role).toBe('Software engineer at Meta')
    expect(site.aboutPage).toBe('https://yangfancheng1.github.io/about/')
  })
})
