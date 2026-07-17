# Deployment

Static personal homepage service deployed under `/opt/apps/homepage`.

## Layout

- `compose.yaml`: builds the Next.js static export and serves it with Nginx on the shared Docker network.
- `.env`: service environment variables, not committed.
- `src/`: Next.js source files.
- `out/`: generated static export from `pnpm run build`.

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

The validation build uses a deliberately non-working placeholder value so the
Google Maps production branch is compiled without copying the real browser key
into GitHub. That validation artifact is never deployed.

The `production` GitHub Environment provides:

- Secret `AQHOURS_SSH_PRIVATE_KEY`.
- Secret `AQHOURS_SSH_KNOWN_HOSTS`.
- Variable `AQHOURS_SSH_HOST`.
- Variable `AQHOURS_SSH_USER`.

The Google Maps browser key is not stored in GitHub. The production server keeps
the referrer-restricted key in
`/opt/apps/homepage/secrets/google-maps-api-key`. The file contains only the key,
with no variable name or quotes, and should be readable only by its owner:

```bash
install -d -m 700 /opt/apps/homepage/secrets
install -m 600 /dev/null /opt/apps/homepage/secrets/google-maps-api-key
read -rsp "Google Maps API key: " GOOGLE_MAPS_KEY && echo
printf '%s' "$GOOGLE_MAPS_KEY" > /opt/apps/homepage/secrets/google-maps-api-key
unset GOOGLE_MAPS_KEY
```

Enter the key directly on the server without placing it in shell history. The
Compose build exposes the file only to the single `next build` instruction through
a BuildKit secret mount. Because
`NEXT_PUBLIC_` values are intentionally embedded in browser JavaScript, the key
must be restricted in Google Cloud rather than treated as a server-only secret:

- Application restriction: **Websites**.
- Allowed production referrers: `https://aqhours.cn/*` and, if served,
  `https://www.aqhours.cn/*`.
- API restriction: **Maps JavaScript API** only.
- Keep billing alerts and API quotas enabled.

The JavaScript Map ID is public configuration rather than a secret. Store the
production value in `/opt/apps/homepage/.env` so Compose can pass it into the
static build:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_google_maps_javascript_map_id
```

The Map ID must have the aqhours cloud map style associated with it. Embedded
JSON styles cannot be combined with a Map ID.

Production Compose builds fail when the secret file is absent. Real `.env*` files
and the complete `secrets/` directory are excluded from Git and the Docker build
context; only `.env.example` may be committed for local-development guidance.

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
