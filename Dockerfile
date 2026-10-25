# Yangfan's Space: static site served by nginx on Cloud Run (spec P6).
# Build:  docker build --build-arg SITE_URL=https://your-site -t yangfan-space .
# Run:    docker run --rm -p 8080:8080 yangfan-space

# ── Stage 1: build the site (client build + SSR build + pre-render) ──────────
FROM node:24-alpine AS build
WORKDIR /app

# Optional PEM cert for build hosts behind TLS interception (antivirus/proxy),
# as in lgp-tax-wealth. Used only while building, never copied into the image.
ARG EXTRA_CA_CERT=""

COPY package.json package-lock.json ./
RUN if [ -n "$EXTRA_CA_CERT" ]; then \
      printf '%s\n' "$EXTRA_CA_CERT" > /tmp/extra-ca.pem; \
      export NODE_EXTRA_CA_CERTS=/tmp/extra-ca.pem; \
    fi; \
    npm ci

COPY . .

# Canonical, link-preview, sitemap and RSS URLs are absolute, so the public
# address is baked in at build time.
ARG SITE_URL
RUN test -n "$SITE_URL" || (echo "error: pass --build-arg SITE_URL=https://…" && exit 1)
ENV SITE_URL=$SITE_URL
RUN npm run build

# ── Stage 2: serve with nginx (non-root, listens on 8080 for Cloud Run) ─────
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist-nginx/app-routes.conf /etc/nginx/app-routes.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
