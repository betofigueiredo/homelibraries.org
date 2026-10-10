import type { ImportedBook } from "../api";

const CLOTHS = ["--cloth-1", "--cloth-2", "--cloth-3", "--cloth-4", "--cloth-5", "--cloth-6"];

/** A stable cloth color per title, so a book keeps its color between visits. */
export function cloth(title: string) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `var(${CLOTHS[Math.abs(hash) % CLOTHS.length]})`;
}

export function stars(rating: number | null) {
  return rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "—";
}

export function ratingLabel(rating: number | null) {
  return rating ? `${rating} of 5 stars` : "Not rated";
}

export const statusLabel = (status: ImportedBook["status"]) => (status === "reading" ? "Reading" : "Read");

/** Goodreads titles end with the series: "Dune (Dune, #1)" → "Dune". */
export const shortTitle = (title: string) => title.replace(/\s*\([^)]*#\d+(\.\d+)?\)$/, "");
