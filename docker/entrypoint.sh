#!/bin/sh
set -e

# Replace the build-time placeholder with the actual runtime value.
# This is how a single Docker image serves deployments with different API URLs
# without rebuilding — Nuxt 3 bakes runtimeConfig.public into .output/ at
# build time, so we patch the built files before starting the server.
if [ -n "$NUXT_PUBLIC_API_BASE_URL" ]; then
  find /app/.output -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.cjs' \) \
    -exec sed -i "s|http://__NUXT_PUBLIC_API_BASE_URL__|${NUXT_PUBLIC_API_BASE_URL}|g" {} +
fi

exec node .output/server/index.mjs
