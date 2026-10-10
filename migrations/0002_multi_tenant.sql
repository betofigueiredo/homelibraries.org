-- One library per user. Books from the single-library days are dropped:
-- the import file is the source of truth, so the owner signs up and imports again.

CREATE TABLE users (
    id           TEXT PRIMARY KEY NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    username     TEXT UNIQUE,
    display_name TEXT,
    created_at   TEXT NOT NULL
);

-- Pending sign-in links. Only the SHA-256 of the secret is stored; expires_at is Unix seconds.
CREATE TABLE login_tokens (
    token_hash TEXT PRIMARY KEY NOT NULL,
    email      TEXT NOT NULL,
    expires_at INTEGER NOT NULL
);

-- Signed-in browsers. Only the SHA-256 of the cookie is stored; expires_at is Unix seconds.
CREATE TABLE sessions (
    id_hash    TEXT PRIMARY KEY NOT NULL,
    user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
);

DROP TABLE books;

CREATE TABLE books (
    id             TEXT PRIMARY KEY NOT NULL,
    user_id        TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    -- Where the book was imported from (`goodreads` or `hardcover`) and its id there,
    -- so re-importing the same file updates books instead of duplicating them.
    source         TEXT NOT NULL,
    external_id    TEXT NOT NULL,
    title          TEXT NOT NULL,
    author         TEXT NOT NULL,
    isbn13         TEXT,
    pages          INTEGER,
    year_published INTEGER,
    owned          BOOLEAN NOT NULL,
    status         TEXT NOT NULL,
    rating         INTEGER,
    date_read      TEXT,
    UNIQUE (user_id, source, external_id)
);
