---
name: api-structure
description: Architecture rules for the homelibraries.org axum API — domain folders, one folder per operation (handler + service), repository traits injected through AppState, MCP tools as a second adapter over the same services. Use whenever adding or changing an endpoint, MCP tool, service, repository, domain, or AppState in this repo, or when reviewing code for structure.
---

# API structure

A multi-user platform: each user (the `users` domain) has one library of books, a public page and a public MCP server at `/{username}/mcp`. The React app in `web/` is compiled into the same binary (see "Frontend" below).

Follow these rules for every change under `src/`. The existing code is the reference implementation: copy from `src/books/import_library/` (write: multipart body + format parsing + service unit tests), `src/books/get_book/` (path param + 404), `src/books/search_books/` (query params) and `src/mcp/tools.rs` (MCP tools) rather than inventing new shapes.

## Layout

```
src/
  lib.rs            app(state): public routers (rate limited) + private routers + web fallback + tower-http layers
  main.rs           serves app(AppState::sqlite(DATABASE_URL, mailer, PUBLIC_URL)); binds 127.0.0.1 unless HOST is set
  state.rs          AppState: repositories + mailer + public_url, and its constructors (composition root)
  auth.rs           `CurrentUser` (session cookie → user, 401 without) and `SameOrigin` (CSRF: Origin must be public_url)
  mailer.rs         `Mailer` port: `LogMailer` (dev/tests, keeps the links) and `ResendMailer` (Resend's HTTP API, via reqwest)
  rate_limit.rs     per-IP limit (X-Real-IP from nginx) on the public routers and the MCP; signed-in routes are not limited
  error.rs          AppError -> HTTP status; every fallible handler/service/repository returns it
  mcp/              one read-only MCP server per library at /{username}/mcp: mod.rs resolves the user,
                    tools.rs holds `LibraryMcp { state, owner }` with one #[tool] per read operation
  web.rs            the router's fallback: serves web/dist (embedded with rust-embed), index.html for any other GET
build.rs            creates an empty web/dist so cargo works without Node
migrations/         SQL files applied by sqlx::migrate!() at startup (and in SQLite repo tests)
  <domain>/
    mod.rs          declares modules + its routers, e.g. `read_router()` (public) and `write_router()` (signed in); nothing else
    model.rs        domain entities and id newtypes (BookId(Uuid)); no HTTP request types
    repository/     mod.rs: `#[async_trait] pub trait XRepository: Send + Sync`;
                    in_memory.rs (tests) + sqlite.rs (real storage)
    <operation>/    one folder per endpoint, named verb_noun: get_book, import_library
      mod.rs        `mod handler; mod service; pub use handler::handler;`
                    + `pub(crate) use` of the request DTO and service if an MCP tool uses them
      handler.rs    `pub async fn handler(...)` + the request DTO and its `validate`
      service.rs    `pub struct <Operation>Service` + its input type + unit tests
```

When a `model.rs` grows too big, turn it into a folder the same way `repository/` is, keeping the same public paths.

## Rules

### Handler (`handler.rs`) — input only
- It extracts (`State`, `Path`, `Query`, `Json`), validates, calls **exactly one** service, and maps the result to a response (status code + `Json`).
- The request DTO (`XRequest`, `#[derive(Deserialize)]`, private fields) lives in `handler.rs`. `fn validate(self) -> Result<XInput, AppError>` checks things that need no stored data: required fields, trimming, lengths, formats. Return `AppError::BadRequest`.
- Use typed ids in `Path`/body (`Path<BookId>`) so bad UUIDs are rejected by the extractor.
- A handler for the signed-in user takes `current: CurrentUser` as its first argument (401 without a session, 403 from another origin) and passes `current.user.id` to the service. Public sign-in routes that set cookies take `_: SameOrigin`.
- A public handler about one library takes `Library(owner): Library` (`src/books/library.rs`), which resolves `{username}` to a `UserId` or 404s.
- Every read and write is scoped to a `UserId`: repository methods take the owner, so one user can never see or change another's books (another user's book id is a 404).
- It builds its service from `AppState`: `XService::new(state.books).execute(input).await`.
- Checks shared by several operations' `validate` live as functions in `model.rs`.
- It contains no business rules and never calls a repository directly.

### Service (`service.rs`) — business rules only
- It has one struct, `<Operation>Service`, with `pub fn new(<repos>) -> Self` and `pub async fn execute(&self, ...)`.
- Its fields are `Arc<dyn XRepository>` only. **It never imports or holds another service.** It may use other domains' repositories.
- Rules that need stored data go here: exists → `NotFound`, duplicates → `Conflict`, ownership, state transitions.
- Input comes as an already-validated `<Operation>Input` struct defined in this file (or as typed ids when that's all it needs). It never takes the raw request DTO.
- Return `Result<T, AppError>` only if it can fail; otherwise return `T`. Clippy pedantic flags wrapping in a `Result` that never fails.
- If two services need the same logic, put it on the model (`impl User { ... }`) or in a repository method, not in a shared service.

### Repository (`repository.rs`)
- Traits are the only persistence API. Implementations are picked in `AppState` constructors and nowhere else.
- Every method returns `Result<_, AppError>`; `From<sqlx::Error> for AppError` lets the SQLite impl use `?`.
- `InMemoryXRepository` uses `tokio::sync::RwLock<HashMap<Id, Entity>>` (or `HashSet` for link tables), derives `Default`, and backs the HTTP integration tests.
- `SqliteXRepository` uses `sqlx::query`/`query_as` with static SQL (no `query!` macros, so no `DATABASE_URL` at compile time), maps rows through a private `XRow` struct, and has its own tests on `sqlite::memory:` (pool with `max_connections(1)`).
- Schema changes are new files in `migrations/`; never edit an applied one.

### Domains and dependencies
- Base domains (`users`) import nothing from other domains.
- Link domains (`books`, which belongs to a user) may import base domains' `model` and `repository`, never the reverse.
- Cross-cutting ports (`Mailer`) live at the top of `src/` and are injected through `AppState` like repositories.
- A route that spans domains lives in the link domain, even if its URL starts with another domain's name.
- Never import across operation folders (`import_library` must not use `get_book`).

### MCP tools (`src/mcp/tools.rs`) — a second adapter, same rules as a handler
- The MCP servers are public, so they only expose reads. Never add a tool that changes data; writes are HTTP-only behind `CurrentUser`.
- A tool always works on `self.owner`'s library; it never takes a user or username as a parameter.
- A tool deserializes its params (usually the operation's own request DTO, which derives `JsonSchema`), calls `validate`, builds exactly one service from `self.state`, and returns `reply(result)` (JSON text, or an error message with `isError`).
- No business rules in tools. Anything a tool needs that a handler doesn't goes into the service or model.
- Doc comments on DTO fields become the tool's parameter descriptions; the `#[tool(description)]` is what the agent reads to choose a tool, so make it specific. Mark read-only tools `annotations(read_only_hint = true)`.
- Unit-test tools by calling the methods on `LibraryMcp::new(AppState::in_memory(), owner)`.

### AppState
- It holds one `Arc<dyn XRepository>` field per repository, plus the `mailer` port and `public_url`. It never holds services.
- New repository → add the field + wire it in both `AppState::in_memory()` and `AppState::sqlite()`.

## Checklists

**New endpoint in an existing domain**
1. `src/<domain>/<verb_noun>/{mod.rs,handler.rs,service.rs}` following the templates above.
2. Add a repository method to the trait + both impls (in-memory and SQLite) if needed; new tables/columns go in a new `migrations/` file.
3. `mod <verb_noun>;` and `.route(...)` in `src/<domain>/mod.rs`: public routes in the router `lib.rs` rate limits, signed-in ones in the private router (a public route put there escapes the rate limit). API routes start with `/api/`; anything else is a page of the React app.
4. Integration test in `tests/<domain>.rs` using `common::app()` / `common::send()`: happy path, 400 from validation, and 404/409 from service rules.
5. Unit test in `service.rs` for non-trivial rules, building the service directly with `InMemory*` repos (no HTTP).
6. If it only reads and agents should use it: re-export the DTO/service in the operation's `mod.rs`, add a `#[tool]` in `src/mcp/tools.rs`, and a tool test.

**New domain**
1. `src/<domain>/{mod.rs,model.rs,repository.rs}` + operation folders.
2. `pub mod <domain>;` in `src/lib.rs`, merging its public router into `public` and its signed-in router into `private`.
3. Repository field in `AppState` + both constructors, plus a migration for its table.
4. Decide whether it's a base or link domain, and document that in the `mod.rs` doc comment.

## Frontend (`web/`)
- React + Vite + TypeScript, `react-router` and `@tanstack/react-query`, plain CSS with tokens in `web/src/styles/tokens.css`. Pages in `web/src/pages/`, shared pieces in `web/src/components/`.
- `web/src/api.ts` is the only place that calls the API; its types mirror the structs the handlers serialize, so change both together.
- A new page route must not clash with usernames: add its first path segment to `RESERVED_USERNAMES` in `src/users/model.rs`.
- Dev: `task dev` runs the API on :3000 (with `PUBLIC_URL=http://localhost:5173`) and Vite on :5173, which proxies `/api` and `/*/mcp`; open :5173.

## Verify before finishing
`task fmt`, then `task lint` (clippy pedantic, `-D warnings`) and `task test` must pass. `cargo test` works if nextest isn't installed. After frontend changes, `task web:lint` and `task web:build` too.
