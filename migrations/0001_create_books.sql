CREATE TABLE books (
    id             TEXT PRIMARY KEY NOT NULL,
    title          TEXT NOT NULL,
    author         TEXT NOT NULL,
    isbn13         TEXT,
    pages          INTEGER,
    year_published INTEGER,
    owned          BOOLEAN NOT NULL,
    status         TEXT NOT NULL,
    rating         INTEGER,
    date_read      TEXT,
    goodreads_id   INTEGER UNIQUE
);
