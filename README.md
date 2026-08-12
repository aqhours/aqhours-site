## The Eternal Hours Project

Started on June 30, 2026.

Homepage v0.1 is the Next.js personal homepage for aqhours.cn.

## Deployment

Pushing `main` triggers the production webhook. Caddy forwards the signed GitHub request to a
localhost-only receiver, which updates the server checkout and rebuilds the Docker Compose
service. Coolify and GitHub Actions SSH access are not part of the deployment path. See
[DEPLOY.md](DEPLOY.md) for server networking requirements, setup, and recovery commands.
