# Deployment

The production site is deployed without Coolify or inbound SSH automation:

```text
local main -> GitHub -> HTTPS webhook -> Caddy -> webhook (127.0.0.1:9000)
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

These instructions assume Caddy runs directly on the host. A containerized
Caddy cannot reach a host service through `127.0.0.1`; give it an explicit host
route or use a Unix socket instead.

Install the receiver and create a dedicated deployment account. Membership in
the `docker` group is effectively root-level access, so do not reuse this
account for interactive logins or unrelated services.

```bash
sudo apt-get update
sudo apt-get install webhook git curl openssl
sudo useradd --system --create-home --home-dir /var/lib/aqhours-deploy \
  --shell /usr/sbin/nologin aqhours-deploy
sudo usermod --append --groups docker aqhours-deploy
sudo chown -R aqhours-deploy:aqhours-deploy /opt/apps/homepage
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
sudo install -m 644 /opt/apps/homepage/deploy/hooks.json.tmpl \
  /etc/aqhours-webhook/hooks.json.tmpl
sudo install -m 644 /opt/apps/homepage/deploy/aqhours-webhook.service \
  /etc/systemd/system/aqhours-webhook.service
```

Generate the shared secret on the server. Copy the printed value directly into
the GitHub webhook form; do not commit it.

```bash
webhook_secret="$(openssl rand -hex 32)"
printf 'AQHOURS_WEBHOOK_SECRET=%s\n' "$webhook_secret" \
  | sudo tee /etc/aqhours-webhook.env >/dev/null
sudo chmod 600 /etc/aqhours-webhook.env
printf '%s\n' "$webhook_secret"
unset webhook_secret
```

Add the contents of `deploy/Caddyfile.example` to the host Caddy configuration,
adjusting `deploy.aqhours.cn` if necessary. The receiver itself remains bound to
loopback; only Caddy exposes its one POST route.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aqhours-webhook.service
sudo systemctl status aqhours-webhook.service
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Create a repository webhook under **GitHub -> Settings -> Webhooks**:

- Payload URL: `https://deploy.aqhours.cn/hooks/aqhours-site`
- Content type: `application/json`
- Secret: the generated value
- SSL verification: enabled
- Events: **Just the push event**

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
service, and checks `https://aqhours.cn/`. The previous container remains up if
the new image fails to build.

The server still needs outbound access to GitHub for `git fetch` and to the
package/image registries used by changed builds. That egress can use the
server's normal network or an independently configured proxy; it is not routed
through Coolify.

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

Bring this webhook path up and verify one GitHub delivery before disabling or
removing Coolify. Also confirm that the host Caddy instance owns ports 80/443
and that the site's existing Caddy-to-Compose route still reaches the
`homepage` service. The webhook change does not alter that application route.
