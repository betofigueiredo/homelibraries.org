import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

import { useMe } from "../auth";
import { Logo } from "./Logo";

/** Initials for the avatar: "Beto Figueiredo" → "BF". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0]![0]! + parts.at(-1)![0]! : name.slice(0, 2);
  return letters.toUpperCase();
}

export function Header({ children }: { children?: ReactNode }) {
  const { me } = useMe();
  return (
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav className="nav" aria-label="Main">
          {children}
          {me?.username ? (
            <>
              <NavLink to={`/${me.username}`} className="nav-link" end>
                My library
              </NavLink>
              <NavLink to="/import" className="nav-link">
                Import
              </NavLink>
              <Link
                to="/settings"
                className="avatar"
                aria-label={`Settings, signed in as ${me.display_name ?? me.username}`}
                title="Settings"
              >
                {initials(me.display_name ?? me.username)}
              </Link>
            </>
          ) : me ? (
            <Link to="/onboarding" className="btn btn-primary btn-sm">
              Pick your address <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link to="/signin" className="btn btn-primary btn-sm">
              Create your library <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <strong>Home Libraries</strong>
        <span>© {new Date().getFullYear()} homelibraries.org</span>
      </div>
    </footer>
  );
}
