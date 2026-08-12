## The Eternal Hours Project

Started on June 30, 2026.

Homepage v0.1 is the Next.js personal homepage for aqhours.cn.

## Deployment

Pushing `main` triggers a signed webhook at `deploy.aqhours.cn`. Caddy forwards it to a
bridge-only receiver, which updates the server checkout and rebuilds the Docker Compose service.

The deployment path evolved from Coolify, through GitHub Actions over SSH, to the current
GitHub Webhook + Caddy + systemd setup. The main lessons were to keep deployment scripts outside
the checkout, authenticate every webhook, serialize builds, preserve the running container when
a build fails, and route restricted downloads through `mesh-proxy`. See [DEPLOY.md](DEPLOY.md).
