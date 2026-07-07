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

Production service:

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
