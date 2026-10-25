#!/usr/bin/env bash
# Deploy Yangfan's Space to Google Cloud Run (same pattern as lgp-tax-wealth).
#
# One-time setup (see README):
#   gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project yangfan-space
#   gcloud artifacts repositories create yangfan-images \
#     --repository-format=docker --location=us-central1 --project yangfan-space
#
# Required env vars:
#   GCLOUD_PROJECT_ID   your GCP project ID (yangfan-space)
#
# Optional env vars:
#   SITE_URL            public address baked into canonical/preview/sitemap/RSS links.
#                       Default: https://yangfanc.com
#
# Every gcloud call passes --project, so the active gcloud project (e.g. lgp's) is never used.
#   REGION              default us-central1
#   SERVICE             default yangfan-space
#   EXTRA_CA_CERT       PEM text, for builds behind TLS interception
#   SKIP_TESTS=1        skip `npm test` before building

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_ID="${GCLOUD_PROJECT_ID:?Error: set GCLOUD_PROJECT_ID}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-yangfan-space}"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/yangfan-images/$SERVICE"
TAG="$IMAGE:$(git rev-parse --short HEAD 2>/dev/null || echo latest)"

if [ "${SKIP_TESTS:-}" != "1" ]; then
  echo "==> Running tests"
  npm test
fi

echo "==> Authenticating Docker with Artifact Registry"
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

service_url() {
  gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)' 2>/dev/null || true
}

build_and_deploy() {
  local site_url="$1"
  echo "==> Building image (linux/amd64) with SITE_URL=$site_url"
  docker build \
    --platform linux/amd64 \
    --build-arg "SITE_URL=$site_url" \
    ${EXTRA_CA_CERT:+--build-arg "EXTRA_CA_CERT=$EXTRA_CA_CERT"} \
    -t "$TAG" \
    -t "$IMAGE:latest" \
    .

  echo "==> Pushing image"
  docker push "$TAG"
  docker push "$IMAGE:latest"

  echo "==> Deploying $SERVICE to Cloud Run ($REGION)"
  gcloud run deploy "$SERVICE" \
    --image "$TAG" \
    --project "$PROJECT_ID" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --quiet
}

SITE_URL="${SITE_URL:-https://yangfanc.com}"
build_and_deploy "$SITE_URL"

echo ""
echo "==> Live at: $(service_url)"
echo "    Public links in the build point to: $SITE_URL"
