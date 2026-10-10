import { Link } from "react-router";

import { Spines } from "../components/Logo";

export function NotFound({ what = "page" }: { what?: string }) {
  return (
    <div className="center-page">
      <Spines />
      <h1 className="page-title" tabIndex={-1}>
        No such <span className="em">{what}</span>
      </h1>
      <p className="muted">It may have moved, or the address has a typo.</p>
      <Link to="/" className="btn btn-secondary">
        Go home
      </Link>
    </div>
  );
}
