#!/bin/sh
# Runs on the VPS as the site user, from the app folder (`task vps:deploy` and `task vps:rollback`).
#   activate.sh           swap in api.new, restart and check /health; put the old binary back if it fails
#   activate.sh rollback  swap api and api.prev (running it again rolls forward)
set -eu
cd "$(dirname "$0")"

SERVICE=homelibraries
HEALTH=http://127.0.0.1:3000/health

# Restarts the service and waits up to 10 s for /health.
restart() {
  sudo systemctl restart "$SERVICE"
  for _ in $(seq 20); do
    if curl -fs "$HEALTH"; then echo; return 0; fi
    sleep 0.5
  done
  return 1
}

case "${1:-}" in
  "")
    test -f api.new || { echo "api.new is missing" >&2; exit 1; }
    chmod 755 api.new
    # Renaming a running binary is safe: the process keeps the file it started from.
    if test -f api; then mv api api.prev; fi
    mv api.new api
    if restart; then exit 0; fi
    echo "the new binary failed its health check; putting the previous one back" >&2
    mv api api.failed
    mv api.prev api
    restart
    exit 1
    ;;
  rollback)
    test -f api.prev || { echo "no previous binary to roll back to" >&2; exit 1; }
    mv api api.tmp
    mv api.prev api
    mv api.tmp api.prev
    restart
    ;;
  *)
    echo "usage: activate.sh [rollback]" >&2
    exit 2
    ;;
esac
