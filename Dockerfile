# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"

RUN npm install -g pnpm@11.7.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_AMAP_API_KEY
ARG NEXT_PUBLIC_MAP_PROVIDER=amap
ARG NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
RUN --mount=type=secret,id=google_maps_api_key,required=true \
    NEXT_PUBLIC_AMAP_API_KEY="$NEXT_PUBLIC_AMAP_API_KEY" \
    NEXT_PUBLIC_MAP_PROVIDER="$NEXT_PUBLIC_MAP_PROVIDER" \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$(cat /run/secrets/google_maps_api_key)" \
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="$NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID" \
    NEXT_PUBLIC_UMAMI_SCRIPT_URL="$NEXT_PUBLIC_UMAMI_SCRIPT_URL" \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID="$NEXT_PUBLIC_UMAMI_WEBSITE_ID" \
    pnpm run build

FROM nginx:alpine

COPY docker-entrypoint.d/19-amap-security-js-code.envsh /docker-entrypoint.d/19-amap-security-js-code.envsh
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN chmod 0555 /docker-entrypoint.d/19-amap-security-js-code.envsh
COPY --from=builder /app/out /usr/share/nginx/html
