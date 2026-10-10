# Deploying to the VPS (CloudPanel)

Target: `https://homelibraries.org`, on the same VPS as the PHP blog on `betofigueiredo.com`.

Each project gets its own domain and CloudPanel site, so the blog's vhost is never touched.

How it runs:
- **Nothing is built on the VPS.** GitHub Actions builds one static Linux binary (the React app is
  inside it) and copies it up over SSH on every push to `master` that passes the checks.
- **systemd keeps it running**: it starts at boot, comes back after any exit and runs sandboxed as the
  site user.
- **Litestream** streams every database change to Cloudflare R2, so losing the VPS loses seconds of
  data, not the libraries.
- **A failed deploy undoes itself**: if the new binary doesn't answer `/health` within 10 seconds,
  the previous one is put back.

The files the steps copy to the server are in `deploy/`.

## Steps (once)

### 1. DNS
At the registrar of `homelibraries.org`: an `A` record for `@` → VPS IP, and one for `www` → VPS IP
(CloudPanel can redirect `www` to the bare domain).

### 2. CloudPanel site
- Add Site → **Create a Reverse Proxy**
  - Domain: `homelibraries.org`
  - Reverse Proxy URL: `http://127.0.0.1:3000`
  - Site user: `homelibraries` (the app runs as this user, and deploys log in as it)
- SSL/TLS → issue a Let's Encrypt certificate (for `homelibraries.org` and `www.homelibraries.org`)
- Vhost editor: check that the `location /` block passes the original host and the client IP
  (CloudPanel's reverse-proxy template usually does; add them if not):
  ```nginx
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  ```
  - `Host`: the MCP servers (`/{username}/mcp`) only accept the host in `PUBLIC_URL`; any other host
    gets 403
  - `X-Real-IP`: public routes are rate limited per IP from it (`src/rate_limit.rs`: a burst of 30,
    then 2 per second). Without it every visitor shares one limit
- Uploads can be up to 2 MB, more than nginx's default `client_max_body_size` (1 MB): set
  `client_max_body_size 2m;` in the vhost.

### 3. Email
Sign-in links are sent with [Resend](https://resend.com), over its HTTP API. That's HTTPS on port
443, so it works even if the VPS provider blocks outgoing SMTP.
- Domains → Add domain → `homelibraries.org`, then add the DNS records it lists (SPF and DKIM,
  plus the optional DMARC) at the registrar, and wait until Resend shows **Verified**. Choosing a
  region near the VPS is fine, any works.
- API Keys → Create API key with **Sending access** for `homelibraries.org` only.

Without `RESEND_API_KEY` the app still runs, but links only go to the log. If emails don't arrive,
`task vps:logs` shows Resend's reason, e.g. a domain that isn't verified yet.

### 4. App folder and SSH access (as root)
The VPS only needs `curl` (used by the health check), which it almost certainly has.

```sh
U=homelibraries
mkdir -p /home/$U/app /home/$U/.ssh

# Secrets, readable only by the site user.
cat > /home/$U/app/.env <<'ENV'
RESEND_API_KEY=re_...
MAIL_FROM=Home Libraries <hello@homelibraries.org>
ENV
chmod 600 /home/$U/app/.env

# Let the site user read its service's logs (`task vps:logs`).
usermod -aG systemd-journal $U
```

Two SSH keys log in as the site user: yours (for `task vps:*` from your machine) and a deploy key
that only GitHub Actions has. Make the deploy key on your machine:
```sh
ssh-keygen -t ed25519 -N "" -C "homelibraries deploy" -f ~/.ssh/homelibraries-deploy
```
Put both public keys (yours, and `~/.ssh/homelibraries-deploy.pub`) in
`/home/homelibraries/.ssh/authorized_keys`, then:
```sh
chown -R $U:$U /home/$U/app /home/$U/.ssh
chmod 700 /home/$U/.ssh && chmod 600 /home/$U/.ssh/authorized_keys
```
Check from your machine: `ssh homelibraries@homelibraries.org true`.

### 5. The service (as root)
Copy `deploy/homelibraries.service` to `/etc/systemd/system/homelibraries.service` and
`deploy/sudoers` to `/etc/sudoers.d/homelibraries`. The sudoers line lets the site user restart
its own service, which the deploy does after swapping the binary, and nothing else.
```sh
chmod 440 /etc/sudoers.d/homelibraries
visudo -c                              # must say "parsed OK"
systemctl daemon-reload
systemctl enable homelibraries         # starts at boot; the first deploy (step 6) starts it now
```
The unit keeps the default `HOST` (`127.0.0.1`), so only nginx can reach the app, and only
through HTTPS. `PUBLIC_URL` must be exactly the address people use (`https`, no trailing slash):
sign-in links point to it, the session cookie is `Secure` because it is `https`, and browser
requests from any other origin are refused. The sandbox (`ProtectSystem=strict` and friends) lets
the app write only to `/home/homelibraries/app`.

> Don't use `systemctl --user` as root: that starts the service under root's own login, and it
> stops when you log out.

### 6. First deploy (from your machine)
The build needs the musl linker once: `sudo apt install musl-tools`. Then:
```sh
task vps:deploy
```
It builds `target/x86_64-unknown-linux-musl/release/api`, copies it up as `api.new` with
`deploy/activate.sh`, and runs that script on the VPS. The script swaps the binaries, restarts the
service and waits for `/health`.

Use `VPS_SSH=homelibraries@<IP> task vps:deploy` while DNS is still new.

### 7. Deploy on every push (GitHub)
In the repository's Settings → Secrets and variables → Actions:

| Kind | Name | Value |
|---|---|---|
| Variable | `VPS_SSH` | `homelibraries@homelibraries.org` |
| Secret | `VPS_SSH_KEY` | contents of `~/.ssh/homelibraries-deploy` (the private key) |
| Secret | `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 homelibraries.org` |

The `deploy` job in `.github/workflows/ci.yml` stays off until `VPS_SSH` is set. After that, every
push to `master` deploys once the checks pass. To redeploy by hand: Actions → CI → Run workflow
on `master`.

### 8. Backups with Litestream (as root)
1. In Cloudflare: R2 → create a bucket `homelibraries-backups`, then **Manage API tokens** →
   create a token with *Object Read & Write* on that bucket only. Note the access key ID, the
   secret, and your account ID (it appears in the bucket's S3 endpoint URL).
2. Install Litestream: take the `linux-x86_64.deb` from the
   [latest release](https://github.com/benbjohnson/litestream/releases/latest), then:
   ```sh
   dpkg -i litestream-*-linux-x86_64.deb
   ```
3. Copy `deploy/litestream.yml` to `/etc/litestream.yml` and fill in the two keys and
   `ACCOUNT_ID`. It holds the keys, so:
   ```sh
   chown homelibraries:homelibraries /etc/litestream.yml && chmod 600 /etc/litestream.yml
   ```
4. Copy `deploy/litestream-override.conf` to
   `/etc/systemd/system/litestream.service.d/override.conf`. It runs Litestream as the site user;
   as root it could leave database files the app can't open.
   ```sh
   systemctl daemon-reload
   systemctl enable --now litestream
   journalctl -u litestream -n 20         # should show it replicating library.db
   ```

The app runs SQLite in WAL mode, which Litestream needs (`src/state.rs`).

**Check that a restore works** (do it now, and every few months):
```sh
sudo -u homelibraries litestream restore -config /etc/litestream.yml \
  -o /tmp/restore-check.db /home/homelibraries/app/library.db
sudo -u homelibraries sqlite3 /tmp/restore-check.db "select count(*) from books"   # if sqlite3 is installed
rm /tmp/restore-check.db
```

**To restore for real** (new VPS, or a broken database): go through steps 4 to 6 and 8, then:
```sh
systemctl stop homelibraries litestream
mv /home/homelibraries/app/library.db{,.broken} 2>/dev/null; rm -f /home/homelibraries/app/library.db-{wal,shm}
sudo -u homelibraries litestream restore -config /etc/litestream.yml /home/homelibraries/app/library.db
systemctl start homelibraries litestream
```

### 9. Uptime monitoring
systemd restarts the app when it crashes, but it can't tell you when the whole VPS or nginx is
down. Add a free HTTP monitor (UptimeRobot, Better Stack, or similar) on
`https://homelibraries.org/health` that emails you after a couple of failed checks.

### 10. Check it
```sh
task vps:health                                          # {"status":"ok",...}
task vps:status                                          # both services active (running)
curl -sI https://homelibraries.org/ | head -1            # 200, the app
curl -s https://homelibraries.org/api/me                 # 401 when signed out
```
Then in a browser: sign in (the link arrives by email, or is in `task vps:logs` without `RESEND_API_KEY`),
pick a username, import a file, and open `https://homelibraries.org/{username}`.

Connect an assistant to a library (other clients are in `README.md`), e.g. Claude Code:
```sh
claude mcp add --transport http beto-library https://homelibraries.org/beto/mcp
```
If the MCP returns 403 "Host header is not allowed", check `PUBLIC_URL` and the vhost's `Host` line.

## Updating
Push to `master`. CI runs the checks, then deploys, and new migrations run at startup. The VPS
keeps the previous binary as `api.prev`:

- If the new binary fails its health check, the deploy puts the old one back on its own and the
  job fails.
- If it starts but misbehaves, `task vps:rollback` swaps back. Running it again rolls forward.

From your machine (`task --list` shows them all): `vps:deploy` (deploy without pushing),
`vps:rollback`, `vps:status`, `vps:logs`, `vps:logs:recent`, `vps:restart` and `vps:health`.

Changes to the files in `deploy/` aren't deployed automatically, except `activate.sh`. Copy them
by hand as in steps 5 and 8, then run `systemctl daemon-reload` and restart.

## Future projects
Repeat the steps with a new domain, site user and port (3001, 3002, …).
