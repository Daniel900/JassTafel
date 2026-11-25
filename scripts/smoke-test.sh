#!/usr/bin/env sh
# Smoke test for the Docker image: starts a container and checks the endpoints.
# Usage: scripts/smoke-test.sh <image>
set -eu
IMAGE="${1:-jasstafel:test}"
NAME="jasstafel-smoke-$$"
PORT="${PORT:-18080}"

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --name "$NAME" --read-only --tmpfs /tmp -p "$PORT:8080" "$IMAGE" >/dev/null

i=0
until curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "Container did not become healthy"; docker logs "$NAME"; exit 1
  fi
  sleep 1
done

fail() { echo "FAIL: $1"; docker logs "$NAME"; exit 1; }

curl -fsS "http://127.0.0.1:$PORT/healthz" | grep -q ok || fail "/healthz"
curl -fsS "http://127.0.0.1:$PORT/" | grep -q '<title>Jass Tafel</title>' || fail "index.html"
curl -fsS "http://127.0.0.1:$PORT/some/deep/link" | grep -q '<div id="root">' || fail "SPA fallback"
curl -fsS "http://127.0.0.1:$PORT/manifest.webmanifest" | grep -q '"Jass Tafel"' || fail "manifest"
ASSET=$(curl -fsS "http://127.0.0.1:$PORT/" | grep -o '/assets/[^"]*\.js' | head -n1)
[ -n "$ASSET" ] || fail "no JS asset referenced"
curl -fsSI "http://127.0.0.1:$PORT$ASSET" | grep -qi 'immutable' || fail "asset caching header"

echo "Smoke test passed for $IMAGE"
