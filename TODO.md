# Home Libraries roadmap

Ideas for richer data and better search through each library's MCP server. Roughly in order; each
step fits the handler → service → repository pattern (see `.claude/skills/api-structure/SKILL.md`).
Everything is per user: new tables get a `user_id` (or hang off a book), and every query is scoped
to the library's owner.

## 1. Import more from the export files
- [ ] Goodreads `My Review` / Hardcover `Review` → notes (needs step 2). `Private Notes` must stay private: libraries are public
- [ ] Goodreads `Bookshelves` / Hardcover `Tags`, `Genres` → tags
- [ ] Goodreads `Additional Authors` → co-authors and translators (needs step 4); Hardcover's `Author` already lists several with roles ("Rod Dreher (Foreword), Carl R. Trueman")
- [ ] Hardcover half-star ratings: store them instead of rounding up (rating becomes tenths or `f32`)

## 2. `notes` domain (link domain, depends on `books`)
- [ ] `Note { book_id, kind: note | quote | review, text, page: Option<u32>, created_at }`
- [ ] Migration, repository (in-memory + SQLite), `GET /api/libraries/{username}/books/{id}/notes`; notes are written only by imports
- [ ] MCP tool: `search_notes` (adding notes is HTTP-only, the MCP server is read-only)
- [ ] `get_book` returns the book's notes
- [ ] Later: import Kindle highlights from `My Clippings.txt`

## 3. Full-text search with SQLite FTS5
- [ ] One FTS5 index over title, author, description, subjects, tags and notes
- [ ] Use the `unicode61 remove_diacritics` tokenizer, so "marquez" finds "Márquez" (the current `LIKE` only ignores ASCII case)
- [ ] Rank results with `bm25`; return a `snippet` showing why each book matched

## 4. `authors` domain and Open Library enrichment
- [ ] `authors` base domain + `book_authors` link table (replace `author: String`)
- [ ] Author fields: name, birth/death year, nationality, short bio
- [ ] `tags` table: `book_tags(book_id, tag)` for shelves and subjects
- [ ] `enrich_book` operation: look up the ISBN on Open Library (https://openlibrary.org/developers/api, free, no key) → description, subjects, cover URL, author bio. Store the result once; don't call the API on every search. Enrichment is shared across users (keyed by ISBN), not per library
- [ ] Real covers on the library page, replacing the drawn cloth covers when a cover URL is known
- [ ] HTTP client (`reqwest`) behind a trait, injected like the repositories, so tests can fake it
- [ ] Later: Wikidata for nationality, literary movement

## 5. More agent-friendly MCP tools
- [ ] `search_books` returns short summaries (id, title, authors, status, rating, snippet) + a `limit`
- [ ] More filters: `author`, `tag`, `min_rating`, `read_between`, `sort_by`
- [ ] New tools: `get_author` (`enrich_book` writes, so it stays HTTP-only)
- [ ] MCP prompt: "recommend my next read" (ratings, unread owned books, recent notes)
- [ ] Keep tool descriptions specific; they're all the agent sees when picking a tool

## 6. Semantic search (only if FTS isn't enough)
- [ ] Embeddings for descriptions and notes (`fastembed` crate, local model)
- [ ] Store vectors with the `sqlite-vec` extension
- [ ] Hybrid search: combine FTS5 ranking with vector similarity

## Also pending
- [ ] Deploy to the VPS as `homelibraries.org` (see `DEPLOY.md`): DNS, CloudPanel site, Resend with the domain verified,
  SSH keys and GitHub secrets, Litestream to R2, an uptime monitor
- [ ] Check every page at phone width (390 px) on a real phone
- [ ] Frontend tests: at least the import flow (Vitest + Testing Library, API mocked)
- [ ] Delete account (and its books) from Settings
- [ ] Where each book is at home (room / shelf), for users who track physical copies
- [ ] MCP Registry (https://registry.modelcontextprotocol.io): there's one server per library now, so a
      single listing needs a URL template (`https://homelibraries.org/{username}/mcp`). Check whether
      `server.json` remotes support URL variables before publishing; otherwise list only an example library
