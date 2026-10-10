import type { ReadingStatus } from "../api";
import { statusLabel } from "./books";

export function StatusBadge({ status }: { status: ReadingStatus }) {
  return <span className={status === "reading" ? "badge" : "badge badge-quiet"}>{statusLabel(status)}</span>;
}
