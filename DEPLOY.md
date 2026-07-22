# Deployment

Static personal homepage service deployed under `/opt/apps/homepage`.

## Layout

- `compose.yaml`: builds the Next.js static export and serves it with Nginx on the shared Docker network.
- `.env`: service environment variables, not committed.
- `src/`: Next.js source files.
- `out/`: generated static export from `pnpm run build`.

The Docker build keeps two complementary caches. The regular layer cache skips
the dependency installation while the package manifests are unchanged. A
BuildKit cache mount named `pnpm-store` keeps downloaded package content across
install-layer invalidations, so a lockfile change only needs to download new or
changed packages. The first build after introducing or clearing this cache is a
cold fill and can still take longer.

## Commands

Local development:

```bash
pnpm install
pnpm run dev
```

Automatic production deployment:

Push a clean, reviewed revision to `main`. GitHub Actions runs the type-check and
static build, then connects to the server with the restricted
`github-actions-homepage` key and rebuilds the Compose service. The workflow can
also be started manually from the Actions page.

The validation build uses deliberately non-working placeholder values so both
map-provider branches are compiled without copying real browser keys into GitHub.
That validation artifact is never deployed.

The `production` GitHub Environment provides:

- Secret `AQHOURS_SSH_PRIVATE_KEY`.
- Secret `AQHOURS_SSH_KNOWN_HOSTS`.
- Variable `AQHOURS_SSH_HOST`.
- Variable `AQHOURS_SSH_USER`.

AMap's JavaScript security code is never stored in GitHub or in the generated
static site. The production server keeps it in
`/opt/apps/homepage/secrets/amap-security-js-code`. The file contains only the
code, with no variable name or quotes, and should be readable only by its owner:

```bash
install -d -m 700 /opt/apps/homepage/secrets
install -m 600 /dev/null /opt/apps/homepage/secrets/amap-security-js-code
read -rsp "AMap security JS code: " AMAP_SECURITY_JS_CODE && echo
printf '%s' "$AMAP_SECURITY_JS_CODE" > /opt/apps/homepage/secrets/amap-security-js-code
unset AMAP_SECURITY_JS_CODE
```

Enter the security code directly on the server without placing it in shell
history. The running Nginx container receives the file as a Docker secret, then
injects it only while proxying the fixed `/_AMapService` endpoint required by
AMap. It is never written into JavaScript, HTML, or the image filesystem.

The default map is chosen at build time. Store its public browser configuration
and the retained Google Map ID in `/opt/apps/homepage/.env` so Compose can pass
them into the static build:

```bash
NEXT_PUBLIC_MAP_PROVIDER=amap
NEXT_PUBLIC_AMAP_API_KEY=your_amap_javascript_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_google_maps_map_id
```

In AMap Console, create a Web (JS API) key and set its domain allowlist to
`aqhours.cn` and `www.aqhours.cn` if both hostnames serve the site. Keep a
separate local-development key if you need `localhost`; never copy the local
development `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE` into this production `.env`.
The production map uses AMap's secure server-proxy mode; the browser receives
only the domain-restricted Web key.

Google Maps remains available as a build-time fallback. Keep its public,
website-restricted JavaScript API key in the separate build secret
`/opt/apps/homepage/secrets/google-maps-api-key` (the file contains only the
key and is mode `600`). It is baked into the static site only because browser
map keys must be visible to the browser; restrict it to the site origins and
only the required Maps APIs in Google Cloud. To switch providers later, set
`NEXT_PUBLIC_MAP_PROVIDER=google` and rebuild the Compose service. Keep the
Google Map ID in `.env` even while AMap is active so the fallback remains ready.

Production Compose starts fail when the security-code secret file is absent. Real
`.env*` files and the complete `secrets/` directory are excluded from Git and the
Docker build context; only `.env.example` may be committed for
local-development guidance.

Manual deployment fallback:

```bash
pnpm run deploy
```

Manual server commands:

```bash
cd /opt/apps/homepage
docker compose up -d --build
docker compose logs -f
docker compose down
```
