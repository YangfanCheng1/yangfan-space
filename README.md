# Yangfan's Space

A personal portfolio and blog, with the web apps it describes living alongside it.

- **Site:** home, projects (with case studies), blog, about. Pages are pre-rendered at build time, so link previews and search engines see real content.
- **Apps:** each app has its own route and look, e.g. `/personal-finance` (net worth + FIRE, private and in-browser). Apps run entirely in the browser.
- **Specs:** `docs/specs/portfolio-blog.md` (the site) and `docs/specs/personal-finance.md` (the app).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run lint
```

Requires Node 22.18+ (the pre-render step runs a `.ts` file directly).

## Write

| What | Where |
|---|---|
| A blog post | `src/content/posts/YYYY-MM-DD-slug.mdx` |
| A project write-up | `src/content/projects/slug.mdx` |
| Your intro, links, interests, photo | `src/site/site.ts` |
| Your bio | `src/content/about.mdx` |

A post starts with front matter:

```yaml
---
title: Building a private FIRE calculator
date: 2026-10-20
summary: One sentence for lists and link previews.
tags: [react, finance]
draft: true   # visible in `npm run dev`, never published
---
```

Below it, Markdown plus `<Callout>`, `<Figure>` and `<Demo name="fire-projection" />`. Mistakes in front matter fail the build with the file and field named. Every build also lists any unwritten "To write:" placeholders.

## Build and preview

```bash
SITE_URL=https://your-site npm run build   # client build → SSR build → pre-render
npm run preview                            # http://localhost:4173, routes like production
```

`npm run build` writes:
- `dist/<route>/index.html` for each pre-rendered page, plus `404.html` and `app-shell.html`
- `sitemap.xml`, `robots.txt` and `rss.xml`
- `dist-nginx/app-routes.conf`, the nginx routes for the apps

`SITE_URL` sets the absolute links (canonical, link previews, sitemap, RSS). Without it they point to localhost, and the build warns.

## Deploy to Google Cloud Run

Same pattern as `lgp-tax-wealth`: Docker image → Artifact Registry → Cloud Run, scaling to zero, so it costs about nothing when idle.

**Prerequisites:** Docker Desktop (running) and the gcloud CLI.

The site lives in its own project, `yangfan-space`, with the domain `yangfanc.com` registered through Cloud Domains (which also created the `yangfanc-com` DNS zone).

### One-time setup

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project yangfan-space
gcloud artifacts repositories create yangfan-images \
  --repository-format=docker --location=us-central1 --project yangfan-space
```

### Deploy (Git Bash)

```bash
export CLOUDSDK_PYTHON="/c/Users/syhhs/AppData/Local/Google/Cloud SDK/google-cloud-sdk/platform/bundledpython/python.exe"
export GCLOUD_PROJECT_ID=yangfan-space
bash deploy/deploy-site.sh
```

The script:
1. runs the tests;
2. builds the image with `https://yangfanc.com` baked in (override with `SITE_URL=...`);
3. pushes the image and deploys it.

Every gcloud call passes `--project`, so whichever project is active in gcloud (e.g. lgp-tax-services) is left alone.

`CLOUDSDK_PYTHON` is needed because Git Bash's `gcloud` script can't find Python on its own; PowerShell's `gcloud` doesn't need it.

### Custom domain (once, after the first deploy)

Same setup as lgp-tax-wealth: a Cloud Run domain mapping, with records in the Cloud DNS zone Cloud Domains created.

```bash
gcloud beta run domain-mappings create --service yangfan-space --domain yangfanc.com \
  --region us-central1 --project yangfan-space
gcloud beta run domain-mappings create --service yangfan-space --domain www.yangfanc.com \
  --region us-central1 --project yangfan-space
gcloud beta run domain-mappings describe --domain yangfanc.com \
  --region us-central1 --project yangfan-space   # lists the records to add
```

Add the records it lists to the `yangfanc-com` zone (Cloud DNS in the console): 4× A and 4× AAAA for `yangfanc.com`, and a CNAME `www` → `ghs.googlehosted.com.` Google then issues the HTTPS certificate on its own, usually within an hour.

### Try the production container locally

```bash
docker build --build-arg SITE_URL=http://localhost:8080 -t yangfan-space .
docker run --rm -p 8080:8080 yangfan-space   # http://localhost:8080
```

nginx serves the pre-rendered pages, gives app routes like `/personal-finance` the app shell, and returns a real 404 for anything else (`deploy/nginx.conf`).

**`npm ci` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`?** Something on your machine (e.g. Avast's Web Shield) is intercepting TLS, and the container doesn't trust its root certificate. Export that root as PEM and pass it in. It's used only during the build and never copied into the image:

```bash
docker build --build-arg SITE_URL=http://localhost:8080 \
  --build-arg "EXTRA_CA_CERT=$(cat interceptor-root.pem)" -t yangfan-space .
# deploy script: EXTRA_CA_CERT="$(cat interceptor-root.pem)" bash deploy/deploy-site.sh
```
