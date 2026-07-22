#!/bin/sh

set -eu

secret_path="/run/secrets/amap_security_js_code"

if [ ! -s "$secret_path" ]; then
  echo "AMap security code secret is missing." >&2
  exit 1
fi

export AMAP_SECURITY_JS_CODE="$(cat "$secret_path")"
