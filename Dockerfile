# Trakli web UI — multi-stage build for production
#
# Nuxt 3 bakes runtimeConfig.public values into the .output/ at build time.
# We build with a placeholder and replace it at container start via entrypoint,
# so a single image works across deployments with different API URLs.

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Placeholder — replaced at runtime by docker/entrypoint.sh
ENV NUXT_PUBLIC_API_BASE_URL=http://__NUXT_PUBLIC_API_BASE_URL__
RUN npm run build

# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:lts-alpine

LABEL org.opencontainers.image.source=https://github.com/trakli/webui
LABEL org.opencontainers.image.description="Trakli web dashboard"
LABEL org.opencontainers.image.vendor="WhileSmart LLC"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
