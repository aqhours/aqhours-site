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

The `production` GitHub Environment provides:

- Secret `AQHOURS_SSH_PRIVATE_KEY`.
- Secret `AQHOURS_SSH_KNOWN_HOSTS`.
- Variable `AQHOURS_SSH_HOST`.
- Variable `AQHOURS_SSH_USER`.

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
