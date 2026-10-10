import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { api, ApiError, type LibraryStats, type ReadingStatus, type SortBy } from "../api";
import { useMe } from "../auth";
import { ConnectPanel } from "../components/ConnectPanel";
import { Cover } from "../components/Cover";
import { PageLoading } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { cloth, ratingLabel, shortTitle, stars } from "../components/books";
import { useTitle } from "../components/useTitle";
import { NotFound } from "./NotFound";

const PAGE = 50;

export function LibraryPage() {
  const { username = "" } = useParams();
  const { me } = useMe();
  const profile = useQuery({
    queryKey: ["library", username, "profile"],
    queryFn: () => api.library(username),
  });
  const stats = useQuery({
    queryKey: ["library", username, "stats"],
    queryFn: () => api.stats(username),
    enabled: profile.isSuccess,
  });
  const name = profile.data?.display_name ?? profile.data?.username ?? username;
  useTitle(profile.isSuccess ? `${name}'s library` : undefined);

  if (profile.error instanceof ApiError && profile.error.status === 404) return <NotFound what="library" />;
  if (profile.isError) return <ErrorState message={profile.error.message} />;
  if (!profile.data || !stats.data) return <PageLoading />;

  const isOwner = me?.username === username;
  const host = window.location.host;

  return (
    <div className="container library">
      <section className="library-head">
        <div className="library-head-text">
          <span className="pill pill-mono">
            <span className="dot" aria-hidden="true" />
            {host}/{username}
          </span>
          <h1 className="library-title" tabIndex={-1}>
            {name}'s <span className="em">library</span>
          </h1>
        </div>
        {isOwner && (
          <Link to="/import" className="btn btn-secondary btn-sm">
            Import again
          </Link>
        )}
      </section>

      {stats.data.total === 0 ? (
        <EmptyLibrary isOwner={isOwner} name={name} />
      ) : (
        <>
          <StatCards stats={stats.data} />
          <div className="library-body">
            <div className="library-main">
              {stats.data.reading > 0 && <ReadingNow username={username} />}
              <AllBooks username={username} total={stats.data.total} />
            </div>
            <aside className="library-side">
              <ConnectPanel username={username} />
              <YearBars perYear={stats.data.read_per_year} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function StatCards({ stats }: { stats: LibraryStats }) {
  const year = new Date().getFullYear();
  const thisYear = stats.read_per_year[year] ?? 0;
  const lastYear = stats.read_per_year[year - 1] ?? 0;
  const diff = thisYear - lastYear;

  return (
    <section className="stats" aria-label="Numbers">
      <div className="stat">
        <div className="stat-label">Read</div>
        <div className="stat-value">{stats.read}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Reading now</div>
        <div className="stat-value">{stats.reading}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Read in {year}</div>
        <div className="stat-inline">
          <span className="stat-value">{thisYear}</span>
          {lastYear > 0 && (
            <span className={diff > 0 ? "badge" : "badge badge-quiet"}>
              {diff > 0 ? "+" : ""}
              {diff} vs {year - 1}
            </span>
          )}
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">Five-star books</div>
        <div className="stat-value">{stats.five_stars}</div>
      </div>
    </section>
  );
}

function ReadingNow({ username }: { username: string }) {
  const reading = useQuery({
    queryKey: ["library", username, "books", { status: "reading" }],
    queryFn: () => api.books(username, { status: "reading", sort: "title" }),
  });
  if (!reading.data?.books.length) return null;

  return (
    <section className="card card-pad">
      <h2 className="card-title">Reading now</h2>
      <ul className="covers">
        {reading.data.books.map((book) => (
          <li key={book.id}>
            <Cover title={book.title} author={book.author} />
            <div className="cover-caption">{shortTitle(book.title)}</div>
            <div className="hint">{book.author}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FILTERS: { value: ReadingStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "read", label: "Read" },
  { value: "reading", label: "Reading" },
];

function AllBooks({ username, total }: { username: string; total: number }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ReadingStatus | undefined>();
  const [sort, setSort] = useState<SortBy>("date_read");
  // Search once typing pauses, not on every key (public reads are rate limited).
  const query = useDebounced(q.trim(), 250);

  const books = useQuery({
    queryKey: ["library", username, "books", { q: query, status, sort }],
    queryFn: () => api.books(username, { q: query, status, sort }),
    placeholderData: keepPreviousData,
  });

  // "Load more" belongs to one search; a new search starts from the top of the list.
  const searchKey = JSON.stringify([query, status, sort]);
  const [paging, setPaging] = useState({ searchKey, shown: PAGE });
  const shown = paging.searchKey === searchKey ? paging.shown : PAGE;

  const list = books.data?.books ?? [];
  const filtered = Boolean(query || status);

  return (
    <section className="card all-books" aria-labelledby="all-books">
      <div className="all-books-bar">
        <h2 id="all-books" className="card-title">
          All books
        </h2>
        <div className="all-books-controls">
          <label htmlFor="q" className="sr-only">
            Search title or author
          </label>
          <input
            id="q"
            type="search"
            className="input search"
            placeholder="Search title or author"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="segmented" role="group" aria-label="Status">
            {FILTERS.map((f) => (
              <button key={f.label} type="button" aria-pressed={status === f.value} onClick={() => setStatus(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <select id="sort" className="input select" value={sort} onChange={(e) => setSort(e.target.value as SortBy)}>
            <option value="date_read">Recently read</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>
      </div>

      <div className="table-wrap" aria-busy={books.isFetching}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Author</th>
              <th scope="col">Status</th>
              <th scope="col">Rating</th>
              <th scope="col">Read</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(0, shown).map((book) => (
              <tr key={book.id}>
                <td className="td-title">
                  <span className="title-cell">
                    <span className="spine" style={{ background: cloth(book.title) }} aria-hidden="true" />
                    {shortTitle(book.title)}
                  </span>
                </td>
                <td className="td-quiet">{book.author}</td>
                <td>
                  <StatusBadge status={book.status} />
                </td>
                <td className="stars" aria-label={ratingLabel(book.rating)}>
                  <span aria-hidden="true">{stars(book.rating)}</span>
                </td>
                <td className="td-date">{book.date_read ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {books.isSuccess && list.length === 0 && (
          <p className="empty-row">No books match{query ? ` “${query}”` : ""}.</p>
        )}
        {books.isError && <p className="empty-row form-error">{books.error.message}</p>}
      </div>

      <div className="all-books-foot">
        <span aria-live="polite">
          Showing {Math.min(shown, list.length)} of {filtered ? list.length : total}
        </span>
        {shown < list.length && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPaging({ searchKey, shown: shown + PAGE })}>
            Load more
          </button>
        )}
      </div>
    </section>
  );
}

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/** Books finished per year, for the last ten years. */
function YearBars({ perYear }: { perYear: Record<string, number> }) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => thisYear - 9 + i);
  const counts = years.map((y) => perYear[y] ?? 0);
  const max = Math.max(1, ...counts);
  if (counts.every((n) => n === 0)) return null;

  return (
    <section className="card card-pad">
      <div className="card-row">
        <h2 className="card-title">Books per year</h2>
        <span className="hint">last 10 years</span>
      </div>
      <ol className="bars" aria-label="Books finished per year">
        {years.map((year, i) => (
          <li key={year} aria-label={`${year}: ${counts[i]} books`}>
            <span className="bar-count num" aria-hidden="true">
              {counts[i] || ""}
            </span>
            <span
              className="bar"
              data-current={year === thisYear || undefined}
              style={{ height: `${Math.round((counts[i]! / max) * 90)}px` }}
              aria-hidden="true"
            />
            <span className="bar-label" aria-hidden="true">
              '{String(year).slice(2)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EmptyLibrary({ isOwner, name }: { isOwner: boolean; name: string }) {
  return (
    <section className="card card-pad empty-library">
      <h2 className="card-title">No books yet</h2>
      {isOwner ? (
        <>
          <p className="muted">Import your Goodreads or Hardcover export to fill your shelves.</p>
          <Link to="/import" className="btn btn-primary" style={{ alignSelf: "center" }}>
            Import your books <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <p className="muted">{name} hasn't imported any books yet.</p>
      )}
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="center-page">
      <h1 className="page-title" tabIndex={-1}>
        Something <span className="em">went wrong</span>
      </h1>
      <p className="muted">{message}</p>
      <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}
