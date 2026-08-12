# Deployment

The production site is deployed without Coolify or inbound SSH automation:

```text
local main -> GitHub -> deploy.aqhours.cn -> Caddy -> webhook (172.18.0.1:9000)
                                                    -> /opt/deploy/aqhours-site.sh
                                                    -> git fetch/reset -> Compose build/up
```

Only a signed GitHub `push` for `aqhours/aqhours-site` on `main` can start the
fixed deployment command. Request data is never interpolated into a shell
command.

## Server layout

```text
/opt/apps/homepage/                 production Git checkout
  .env                              public build-time configuration
  secrets/                          Docker secret source files
  compose.yaml
/opt/deploy/aqhours-site.sh         stable deployment entrypoint
/opt/deploy/github-deployment-status.sh
                                    GitHub Deployments API reporter
/etc/aqhours-webhook/
  hooks.json.tmpl                   receiver rules
/etc/aqhours-webhook.env            HMAC secret (mode 600)
/etc/systemd/system/
  aqhours-webhook.service
```

The deployed script lives outside the Git checkout so `git reset --hard` cannot
replace the script while it is running. Copy it again when the repository's
server deployment script intentionally changes.

## One-time server setup

The production Caddy container reaches the host receiver through the
`aqhours-web` bridge gateway. Confirm its current gateway before installation:

```bash
docker network inspect aqhours-web \
  --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}'
```

Install the receiver and create a dedicated deployment account. Membership in
the `docker` group is effectively root-level access, so do not reuse this
account for interactive logins or unrelated services.

```bash
sudo apt-get update
sudo apt-get install webhook git curl openssl
sudo useradd --system --create-home --home-dir /var/lib/aqhours-deploy \
  --shell /usr/sbin/nologin aqhours-deploy
sudo usermod --append --groups docker aqhours-deploy
sudo chown -R aqhours-deploy:aqhours-deploy \
  /opt/apps/homepage /opt/apps/eternal-card
sudo -u aqhours-deploy git -C /opt/apps/homepage fetch origin main
```

Keep the existing ignored `.env` and `secrets/` files in the checkout. A hard
reset changes tracked files only; it does not remove these ignored production
files.

Install the versioned deployment assets from the server checkout:

```bash
sudo install -d -m 755 /opt/deploy /etc/aqhours-webhook
sudo install -m 755 /opt/apps/homepage/scripts/server-deploy-homepage.sh \
  /opt/deploy/aqhours-site.sh
sudo install -m 755 /opt/apps/homepage/scripts/github-deployment-status.sh \
  /opt/deploy/github-deployment-status.sh
sudo install -m 755 /opt/apps/eternal-card/scripts/server-deploy.sh \
  /opt/deploy/eternal-card.sh
sudo install -m 644 /opt/apps/homepage/deploy/hooks.json.tmpl \
  /etc/aqhours-webhook/hooks.json.tmpl
sudo install -m 644 /opt/apps/homepage/deploy/aqhours-webhook.service \
  /etc/systemd/system/aqhours-webhook.service
```

Generate the shared secret on the server. Copy the printed value directly into
the GitHub webhook form; do not commit it.

```bash
webhook_secret="$(openssl rand -hex 32)"
printf 'AQHOURS_WEBHOOK_SECRET=%s\nAQHOURS_WEBHOOK_IP=172.18.0.1\n' "$webhook_secret" \
  | sudo tee /etc/aqhours-webhook.env >/dev/null
sudo chmod 600 /etc/aqhours-webhook.env
printf '%s\n' "$webhook_secret"
unset webhook_secret
```

Create a fine-grained GitHub personal access token scoped only to the deployed
repositories, with **Deployments: Read and write** permission. Add it to the
same mode-600 environment file without committing or printing it:

```dotenv
AQHOURS_GITHUB_TOKEN=github_pat_...
```

Merge `deploy/Caddyfile.example` into the shared Caddy container configuration.
The receiver binds only to the Docker bridge gateway; only Caddy exposes its
two fixed POST routes.

If UFW uses a default-deny input policy, allow only the shared Docker bridge to
reach the receiver. Docker assigns the bridge name from the first 12 characters
of the network ID:

```bash
network_id="$(docker network inspect aqhours-web --format '{{.Id}}')"
bridge_name="br-${network_id:0:12}"
sudo ufw allow in on "$bridge_name" from 172.18.0.0/16 \
  to 172.18.0.1 port 9000 proto tcp comment 'Caddy to aqhours webhook'
unset network_id bridge_name
```

Do not expose TCP 9000 on the public interface.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aqhours-webhook.service
sudo systemctl status aqhours-webhook.service
docker compose -f /opt/apps/caddy/compose.yaml run --rm caddy \
  validate --config /etc/caddy/Caddyfile
docker compose -f /opt/apps/caddy/compose.yaml exec caddy \
  caddy reload --config /etc/caddy/Caddyfile
```

Create a repository webhook under **GitHub -> Settings -> Webhooks**:

- Payload URL: `https://deploy.aqhours.cn/hooks/aqhours-site`
- Content type: `application/json`
- Secret: the generated value
- SSL verification: enabled
- Events: **Just the push event**

Use the same secret for the Eternal Card repository with payload URL
`https://deploy.aqhours.cn/hooks/eternal-card`. The receiver applies repository- and
branch-specific rules before choosing either fixed deployment script.

The receiver additionally verifies `X-Hub-Signature-256`, the `push` event
header, repository name, `refs/heads/main`, and that the ref was not deleted.

## Production configuration

AMap's JavaScript security code is not stored in GitHub or in the generated
static site. Keep it in `/opt/apps/homepage/secrets/amap-security-js-code`, with
only the code and no variable name or quotes:

```bash
sudo install -d -o aqhours-deploy -g aqhours-deploy -m 700 \
  /opt/apps/homepage/secrets
sudo install -o aqhours-deploy -g aqhours-deploy -m 600 /dev/null \
  /opt/apps/homepage/secrets/amap-security-js-code
read -rsp "AMap security JS code: " amap_security_js_code && echo
printf '%s' "$amap_security_js_code" \
  | sudo -u aqhours-deploy tee \
    /opt/apps/homepage/secrets/amap-security-js-code >/dev/null
unset amap_security_js_code
```

Keep the website-restricted Google browser API key in the separate mode-600
file `/opt/apps/homepage/secrets/google-maps-api-key`. Store the remaining
public build settings in `/opt/apps/homepage/.env`:

```dotenv
NEXT_PUBLIC_MAP_PROVIDER=amap
NEXT_PUBLIC_AMAP_API_KEY=your_amap_javascript_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_google_maps_map_id
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://your-umami.example.com/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your_umami_website_id
```

Restrict browser map keys to the production origins and only the required APIs.
Do not put `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE` in the production `.env`.

## Normal deployment

Ordinary Git pushes are enough:

```bash
git push origin main
```

`pnpm run deploy` is the guarded local variant: it requires a clean local
`main`, runs type-checking and a production build, confirms the remote is not
ahead, and then pushes. It no longer opens an SSH session.

The server deployment script waits on a lock, so closely spaced webhook
deliveries cannot run simultaneous builds. It fetches `origin/main`, resets the
tracked checkout to that commit, builds the image, recreates the Compose
service, and checks `https://aqhours.cn/`. It creates a GitHub production
deployment before the build and marks it `success` or `failure` afterwards.
The previous container remains up if the new image fails to build.

Git fetches and build downloads run through the server's `mesh-proxy` helper.
The helper forwards only the child command through the Headscale/Tailscale
bridge to the Mac proxy; it does not grant GitHub an SSH path into the server.
Keep the Mac bridge available when a deployment needs uncached source,
packages, or base images.

## Why this replaced the earlier approaches

- Coolify was convenient, but added a control plane, proxy, generated resource names,
  and migration coupling for several otherwise small Compose services.
- GitHub Actions over SSH removed that control plane but required exposing and managing
  deployment SSH credentials in CI.
- Signed webhooks keep GitHub's responsibility to notification only. The server owns its
  credentials, fixed commands, locking, build, health checks, and rollback boundary.

During migrations, bring up the replacement stack beside the old one, copy persistent data,
verify it internally, switch the proxy last, and remove old containers and volumes only after
real GitHub deliveries and public health checks pass.

## Operations and recovery

Follow receiver and deployment output:

```bash
sudo journalctl -u aqhours-webhook.service -f
```

Inspect the application:

```bash
cd /opt/apps/homepage
docker compose ps
docker compose logs --tail=200 homepage
```

After changing a receiver template or the external deployment script:

```bash
sudo install -m 755 scripts/server-deploy-homepage.sh /opt/deploy/aqhours-site.sh
sudo install -m 755 scripts/github-deployment-status.sh \
  /opt/deploy/github-deployment-status.sh
sudo install -m 644 deploy/hooks.json.tmpl /etc/aqhours-webhook/hooks.json.tmpl
sudo systemctl restart aqhours-webhook.service
```

To deploy a known commit manually, stop automatic replacement long enough to
build it, then re-enable the receiver:

```bash
sudo systemctl stop aqhours-webhook.service
cd /opt/apps/homepage
git fetch origin main
git reset --hard <known-good-commit>
docker compose build
docker compose up -d --remove-orphans --no-build
sudo systemctl start aqhours-webhook.service
```

Before retiring another deployment path, verify a real GitHub delivery, confirm Caddy owns
ports 80/443, and check every public service plus its persistent data.
