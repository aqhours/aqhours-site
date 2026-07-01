# Deployment

Static personal homepage service deployed under `/opt/apps/homepage`.

## Layout

- `compose.yaml`: runs the static homepage with Nginx on the shared Docker network.
- `.env`: service environment variables, not committed.
- `src/`: static site files served by Nginx.

## Commands

```bash
cd /opt/apps/homepage
docker compose up -d
docker compose logs -f
docker compose down
```
