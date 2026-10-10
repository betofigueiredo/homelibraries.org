# Home Libraries

[homelibraries.org](https://homelibraries.org): sign in with your email, import your Goodreads or
Hardcover export, and get a public page for your books plus your own
[MCP](https://modelcontextprotocol.io) server, so AI assistants can answer questions about them.

One Rust binary serves everything: the React app, the JSON API and every library's MCP server.

## How it works

1. **Sign in** with a link sent to your email. The same link creates your account; there are no passwords.
2. **Pick an address**, like `homelibraries.org/beto`.
3. **Import** your export. The file's format is detected and checked first, and you see what comes
   in before anything is saved. Only books you've **read** or are **currently reading** are imported.
4. **Connect your AI** to `https://homelibraries.org/{username}/mcp`.

Libraries and their MCP servers are public. Emails are only used to send sign-in links.

### Imports

| Export | Where to find it | Matched by |
|---|---|---|
| Goodreads | My Books → Import and export → Export Library | `Book Id` |
| Hardcover | Settings → Export (CSV) | `Hardcover Book ID` |

The file is the source of truth for books from its service: importing again adds new books,
updates changed ones and removes the ones no longer in the file. Books from the other service are
left alone. Hardcover's half stars round up to whole stars (4.5 → 5).

## Use a library with your AI assistant

Every library has a read-only MCP server; there's nothing to install. For `beto`:

**Claude Code**

```sh
claude mcp add --transport http beto-library https://homelibraries.org/beto/mcp
```

Add `--scope user` to have it in every project.

**Claude.ai / Claude Desktop**: Settings → Connectors → Add custom connector, with the URL above.

**Cursor, VS Code and other clients with a JSON config**

```json
{
  "mcpServers": {
    "beto-library": {
      "type": "http",
      "url": "https://homelibraries.org/beto/mcp"
    }
  }
}
```

### Tools

- `search_books`: filter by text (title or author), reading status and owned, sorted by title, author or date read
- `get_book`: one book by id
- `library_stats`: totals by status, owned, five stars, and books read per year

### Prompts

Ready-made questions you can pick from your client's menu (in Claude Code: `/mcp__beto-library__hidden_gems`):
`hidden_gems`, `world_changing_ideas`, `interesting_ideas`, `reading_path` and `outside_comfort_zone`.

## HTTP API

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/link` `{"email"}` | anyone (always 202) |
| POST | `/api/auth/verify` `{"token"}` | anyone; sets the `session` cookie |
| POST | `/api/auth/logout` | signed in |
| GET / PATCH | `/api/me` `{"username", "display_name"}` | signed in |
| POST | `/api/me/import/preview` (multipart `file`) | signed in; writes nothing |
| POST | `/api/me/import` (multipart `file`) | signed in |
| GET | `/api/libraries/{username}` | public |
| GET | `/api/libraries/{username}/books?q=&status=&owned=&sort=` | public |
| GET | `/api/libraries/{username}/books/{id}` | public |
| GET | `/api/libraries/{username}/stats` | public |
| POST | `/{username}/mcp` | public, MCP over streamable HTTP |
| GET | `/health` | public |

Public routes are rate limited per IP (a burst of 30, then 2 per second). Signed-in routes check
that browser requests come from the app's own origin. Any other `GET` returns the React app.

## Development

Needs Rust (pinned in `rust-toolchain.toml`), Node 24 and [Task](https://taskfile.dev).

```sh
task setup     # install the Rust dev tools and the frontend's dependencies
task dev       # API on :3000 + app on :5173, both reload on changes: open http://localhost:5173
task check     # before a commit: formatting, both linters, tests
task ci        # everything CI runs (adds the frontend build and cargo-deny)
task build     # release binary with the app inside: target/release/api
```

Signing in locally: `task signin EMAIL=you@example.com` (or the form), then open the link printed in
the API's log. `task --list` shows the rest: `dev:api` + `web:dev` in separate terminals,
`serve` (production-like, no Vite), `test:watch`, `fix`, `db:reset`, `mcp:add LIBRARY=beto`, `outdated`…

`cargo test` and `cargo clippy` work without Node: `build.rs` creates an empty `web/dist`.

| Env var | Default | |
|---|---|---|
| `DATABASE_URL` | `sqlite://library.db` | created and migrated at startup |
| `PUBLIC_URL` | `http://localhost:{PORT}` | where people reach the app: sign-in links, cookie `Secure` flag, same-origin check, MCP `Host` check |
| `RESEND_API_KEY` | unset | a [Resend](https://resend.com) API key (`re_…`) that can send; unset → links are only logged |
| `MAIL_FROM` | | required with `RESEND_API_KEY`, on a domain verified in Resend, e.g. `Home Libraries <hello@homelibraries.org>` |
| `PORT` / `HOST` | `3000` / `127.0.0.1` | |

Code layout and conventions: `.claude/skills/api-structure/SKILL.md`. Deploying: `DEPLOY.md` (once set up, every
push to `master` that passes CI deploys itself).
