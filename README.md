## The Eternal Hours Project

Started on June 30, 2026.

Homepage v0.1 is the Next.js personal homepage for aqhours.cn.

## Deployment

Pushing `main` triggers the production deployment in Coolify. The deployment server reaches
GitHub through the Tailscale mesh proxy bridge on the development Mac, so Tailscale, Nextin's
local proxy, and `cn.aqhours.mesh-proxy-bridge` must be running when a build starts. The
`pnpm deploy` script remains a manual fallback and pushes through the repository's configured
`origin` transport before rebuilding the legacy server checkout.
