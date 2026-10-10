// Typed calls to the Rust API. Shapes mirror the structs the handlers serialize.

export type ReadingStatus = "read" | "reading";
export type Source = "goodreads" | "hardcover";
export type SortBy = "title" | "author" | "date_read";

export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  created_at: string;
}

export interface LibraryProfile {
  username: string;
  display_name: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn13: string | null;
  pages: number | null;
  year_published: number | null;
  owned: boolean;
  status: ReadingStatus;
  rating: number | null;
  date_read: string | null;
  source: Source;
}

export interface BookList {
  books: Book[];
  total: number;
}

export interface LibraryStats {
  total: number;
  read: number;
  reading: number;
  owned: number;
  five_stars: number;
  read_per_year: Record<string, number>;
}

export type ImportedBook = Omit<Book, "id" | "source">;

export interface ImportPreview {
  source: Source;
  to_import: number;
  ignored: number;
  skipped: number;
  sample: ImportedBook[];
  errors: { line: number; reason: string }[];
}

export interface ImportSummary {
  source: Source;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  ignored: number;
  deleted: number;
}

/** An error answer from the API, with its message made readable. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: BodyInit, json = false): Promise<T> {
  const headers: HeadersInit = json ? { "Content-Type": "application/json" } : {};
  let response: Response;
  try {
    response = await fetch(path, { method, body, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // The API writes "bad request: <detail>"; people only need the detail.
    const raw: string = data?.error ?? `Something went wrong (${response.status}).`;
    const message = raw.replace(/^(bad request|conflict): /, "");
    throw new ApiError(response.status, message.charAt(0).toUpperCase() + message.slice(1));
  }
  return data as T;
}

const get = <T>(path: string) => request<T>("GET", path);
const send = <T>(method: string, path: string, body: unknown) =>
  request<T>(method, path, JSON.stringify(body), true);

function upload<T>(path: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<T>("POST", path, form);
}

const library = (username: string) => `/api/libraries/${encodeURIComponent(username)}`;

export const api = {
  /** The signed-in user, or `null` when signed out. */
  me: () =>
    get<User>("/api/me").catch((e) => {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }),
  updateMe: (changes: { username?: string; display_name?: string }) =>
    send<User>("PATCH", "/api/me", changes),
  requestLink: (email: string) => send<void>("POST", "/api/auth/link", { email }),
  verify: (token: string) => send<User>("POST", "/api/auth/verify", { token }),
  logout: () => request<void>("POST", "/api/auth/logout"),

  library: (username: string) => get<LibraryProfile>(library(username)),
  stats: (username: string) => get<LibraryStats>(`${library(username)}/stats`),
  books: (username: string, query: { q?: string; status?: ReadingStatus; sort?: SortBy }) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status) params.set("status", query.status);
    if (query.sort) params.set("sort", query.sort);
    const qs = params.toString();
    return get<BookList>(`${library(username)}/books${qs ? `?${qs}` : ""}`);
  },

  previewImport: (file: File) => upload<ImportPreview>("/api/me/import/preview", file),
  runImport: (file: File) => upload<ImportSummary>("/api/me/import", file),
};

export const sourceName: Record<Source, string> = {
  goodreads: "Goodreads",
  hardcover: "Hardcover",
};

/** Where a library's MCP server is, e.g. `https://homelibraries.org/beto/mcp`. */
export const mcpUrl = (username: string) => `${window.location.origin}/${username}/mcp`;
