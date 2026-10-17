# Yangfan's Space as a portfolio and blog — Product Spec (PRD)

| | |
|---|---|
| **Status** | Approved for build. Decisions are recorded in [§10](#10-decisions-log) |
| **Scope** | The gateway (`/`) and new pages around it. Apps such as `/personal-finance` keep their own routes and looks |
| **Last updated** | 2026-10-16 |

---

## 1. Summary

Turn Yangfan's Space from a page of app links into a **personal portfolio and blog**. It's a site that answers three things:

1. **Who is Yangfan?** About, background, how to get in touch.
2. **What has Yangfan built?** Projects with a short case study each and a link to try it live.
3. **What is Yangfan thinking about?** Blog posts about building things, lessons learned and notes.

The apps stay the strongest proof. A visitor can read how something was built, then click through and use it, which a typical portfolio can't offer.

## 2. Goals & non-goals

### Goals
- **G1. A clear identity in 5 seconds.** The home page says who you are and what you do, before anything else.
- **G2. Projects as evidence.** Each project has a case study page (the problem, approach, stack, what was hard, results) and a "Try it" link.
- **G3. Writing that's easy to publish.** A new post is one MDX (Markdown + components) file committed to the repo, with no CMS and no database.
- **G4. Shareable.** Post and project links show a proper title, description and image when pasted into Slack, LinkedIn or X, and search engines can read them.
- **G5. Keep what's distinctive.** The neubrutalist ink style stays; the comic-studio leftovers go.

### Non-goals (v1)
- Comments, likes, newsletter sign-ups, analytics.
- A CMS or admin UI. Posts are files.
- Dark mode, internationalization.
- Rebuilding the apps themselves. They're linked from the portfolio, not changed by it.

## 3. Audience

| Reader | Wants | Where they go |
|---|---|---|
| Recruiter / hiring manager | Quick read on skills and quality | Home → featured projects → About / résumé |
| Fellow developer | How things were built | Project case studies, blog posts |
| Friend / casual visitor | What you're up to | Latest posts, live apps |

## 4. Information architecture

```
/                         Home: intro, featured projects, latest posts
/projects                 All projects (cards; filter by tag)
/projects/<slug>          Case study, with a "Try it live →" link to the app
/blog                     All posts, newest first (filter by tag)
/blog/<slug>              A post
/about                    Bio, skills/tools, experience, contact links, résumé (PDF)
/<app-slug>               Apps, unchanged (e.g. /personal-finance)
```

- **Top navigation:** Home · Projects · Blog · About. The wordmark links home.
- **Apps aren't top-level navigation.** You reach them from their project page, so every app comes with context.
- The **placeholder apps** (Comic Reader, Avatar Builder, Ink Gallery) stay in the repo as future projects (`status: planned`). They appear only in a small **"On the workbench"** list at the bottom of `/projects`, with no links and no case study until they're built. Their placeholder routes are removed.

## 5. Functional requirements

### 5.1 Home (`/`)
- **HM1. Intro block:** your name, one-line role ("Software engineer who builds…"), a 2–3 sentence intro, and buttons for *See projects* and *Read the blog*. An optional photo or avatar.
- **HM2. Featured projects:** 2–3 project cards. The order is set in content (`featured: true`).
- **HM3. Latest posts:** the 3 newest posts, each with title, date, reading time and a one-line summary.
- **HM4. Footer:** contact links (email, GitHub, LinkedIn, and others as provided), RSS link, ©.

### 5.2 Projects
- **PR1. Project card:** title, one-line tagline, year, stack tags, status (*Live*, *In progress*), and a cover image or styled placeholder.
- **PR2. Projects page:** all projects with tag filter chips (e.g. *React*, *Finance*, *Data viz*). The filter shows in the URL (`?tag=react`) so it can be shared.
- **PR3. Case study page:** written in Markdown, with a fixed header:
  - title, tagline, year, role, stack
  - links: **Try it live →** (internal app route or external URL) and **Source** (if public)
  - body sections, suggested but not enforced: *Problem*, *Approach*, *What was hard*, *Results*, *What I'd do next*
- **PR4. First case study: Personal Finance.** Drafted from the real build record (spec, 204 tests, accessibility audit, decisions log), for you to edit into your own voice.

### 5.3 Blog
- **BL1. Post list:** newest first, with title, date, reading time, tags and summary. Tag filter as in PR2.
- **BL2. Post page:**
  - title, date (and "updated" date if set), reading time, tags
  - comfortable reading layout (about 65–75 characters per line)
  - headings with anchor links
  - code blocks with syntax highlighting and a copy button
  - images with captions
  - previous/next post links
- **BL3. Drafts:** `draft: true` in a post's front matter hides it from production builds but shows it in the dev server.
- **BL4. RSS feed** at `/rss.xml`, generated at build time.

### 5.4 About (`/about`)
This is a personal site, not a job-hunting page, so About is short and human.
- **AB1.** Bio in first person, longer than the home intro. Known so far: *Software engineer at Meta*. Everything else is a clearly marked placeholder until you write it.
- **AB2.** "Things I like working with": a short plain-text list, not skill bars.
- **AB3.** Links: email, GitHub and others, as placeholders until provided. It also links to your existing page, https://yangfancheng1.github.io/about/, for the longer professional version.
- **AB4.** No experience timeline or résumé in v1.

## 6. Content model

Posts and case studies are MDX files with front matter, stored in the repo:

```
src/content/
  posts/2026-10-20-building-a-private-fire-calculator.mdx
  projects/personal-finance.mdx
  about.mdx
  site.ts            name, role, intro, social links, featured order
```

```yaml
# posts/*.mdx
title: Building a private FIRE calculator
date: 2026-10-20
updated: 2026-10-22        # optional
summary: Why I built a finance tool that never sends your data anywhere.
tags: [react, finance, accessibility]
cover: ./cover.png         # optional; used for link previews
draft: false
```

```yaml
# projects/*.mdx
title: Personal Finance
tagline: Net worth tracker and FIRE projection, private and in-browser.
year: 2026
role: Solo — design, engineering, testing
stack: [React, TypeScript, Vite, Tailwind, Recharts, Zustand, Vitest]
tags: [react, finance, data-viz]
status: live
live: /personal-finance    # internal route or full URL
source: https://github.com/…   # optional
featured: true
order: 1
```

- **Validation:** front matter is checked at build time. A missing title or a bad date fails the build with a clear message, the same way the Personal Finance backup import validates files.
- **Reading time:** about 230 words per minute, rounded up.

## 7. Visual design

- **Keep:** the ink style. That means 2.5px borders, solid offset shadows, halftone, Archivo Black headings, Space Grotesk body text, Space Mono labels, and the cream / vermilion / teal / mustard palette.
- **Drop:** comic-studio leftovers. "Vol. 1 · Issue", "Pick a panel", the "NEW!" starburst and the "#04" counter go. The "Table of contents" heading becomes *Featured projects*.
- **Reading pages** (posts and case studies) get a calmer layout: a narrow text column, larger body text, fewer borders. Long-form reading in heavy neubrutalism is tiring, so the ink style frames the page rather than every paragraph.
- **Contrast** (decision Q6): vermilion is darkened to about `#c4432f` (re-measured to pass 4.5:1 with cream text), and the focus ring becomes ink, as in Personal Finance.

## 8. Technical approach

- **Stack:** stays Vite + React + TypeScript + Tailwind in the same repo. The apps don't move.
- **MDX** (decision Q7). Posts and case studies are `.mdx`: Markdown that can also embed live React components. For example, a post about the FIRE calculator can include the real projection chart.
  - Compiled at build time with `@mdx-js/rollup`. Front matter comes through `remark-frontmatter` + `remark-mdx-frontmatter` and is validated as in §6.
  - Code highlighting happens at build time, so no highlighter ships to the browser.
  - A small set of components is available to posts: `<Callout>`, `<Figure>`, `<Demo>` (lazy-loads an app component), and code blocks with copy.
- **Pre-rendering** (decision Q3). Today the server sends an empty page and JavaScript draws everything in the visitor's browser. Link-preview bots (Slack, LinkedIn, iMessage) and many search crawlers don't run that JavaScript, so a shared post shows up blank.
  - Pre-rendering runs each portfolio page once at build time and saves the finished HTML, with the right `<title>`, description and Open Graph image baked in. Visitors still get the same interactive React site once JavaScript loads.
  - This applies to home, projects, blog and about. The apps (e.g. `/personal-finance`) stay client-only, because they're per-visitor and private.
  - Tool: `vite-react-ssg`, or a small custom script if it fights the existing router.
- **RSS** is generated in the same build step.
- **Hosting** (decision Q5) follows `lgp-tax-wealth`: Google Cloud Run.
  - A Dockerfile builds the site, then serves `dist/` with nginx. Pre-rendered pages are served as-is; unknown paths fall back to `index.html` so app routes work. Assets get long cache headers.
  - The image is pushed to Artifact Registry (`<region>-docker.pkg.dev/<project>/yangfan-images`).
  - `deploy/deploy-site.sh` runs `gcloud run deploy yangfan-space`, region `us-central1` by default, `--allow-unauthenticated`, `--min-instances 0`, small CPU and memory. Cost is about $0 when idle.
  - One-time setup (gcloud login, project, enabling APIs, creating the repository) is documented in the README, the same way as `lgp-tax-wealth`. A custom domain can be mapped later.
  - Running the deploy itself is your call each time: it uses your Google Cloud account.
- **Testing:** unit tests for front-matter validation, reading time, sorting and drafts. Browser checks for navigation, filters and post rendering, plus the same axe audit (0 violations) and 390px checks used for Personal Finance.

## 9. Milestones

| # | Milestone | Done when |
|---|---|---|
| P0 | Shell: new nav, routes (`/projects`, `/blog`, `/about`), comic leftovers removed, placeholder apps moved to "On the workbench", gateway contrast fixed | All routes render; Personal Finance still reachable; axe clean |
| P1 | Content pipeline: MDX + front matter + validation + drafts + reading time + post components | Unit tests pass; a sample post with an embedded component renders |
| P2 | Blog: list, post page, tags, code highlighting, prev/next, RSS | Verified in browser at desktop and 390px |
| P3 | Projects: cards, filter, case study page, Personal Finance case study drafted | Live link works; content reviewed by you |
| P4 | Home + About (placeholders where your content is still missing) | Layout final; every placeholder clearly marked |
| P5 | Pre-rendering + SEO/Open Graph + RSS | Built HTML contains each page's content and meta tags; preview tags verified |
| P6 | Cloud Run: Dockerfile + nginx + `deploy/deploy-site.sh` + README | Container runs locally with app routes working; deploy run only when you choose |

## 10. Decisions log

| # | Question | Decision (2026-10-16) |
|---|---|---|
| 1 | Purpose | **Personal site.** Projects and writing come first; no résumé or experience timeline |
| 2 | Your content | **Placeholders for now.** Known: software engineer at Meta; existing about page https://yangfancheng1.github.io/about/ (linked from About) |
| 3 | Pre-rendering | **Yes**, for portfolio routes only (see §8 for what it means) |
| 4 | Placeholder apps | **Keep as future projects.** Listed under "On the workbench", not linked |
| 5 | Hosting | **Google Cloud Run, following `lgp-tax-wealth`** (Docker → Artifact Registry → `gcloud run deploy`) |
| 6 | Gateway colors | **Yes:** darker vermilion and an ink focus ring |
| 7 | Writing format | **MDX** |
