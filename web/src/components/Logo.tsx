import { Link } from "react-router";

/** Four book spines, the last one leaning. */
export function Spines() {
  return (
    <span className="logo-spines" aria-hidden="true">
      <span style={{ height: 18, background: "var(--cloth-1)" }} />
      <span style={{ height: 22, background: "var(--ink)" }} />
      <span style={{ height: 15, background: "var(--cloth-2)" }} />
      <span
        style={{
          height: 20,
          background: "var(--cloth-3)",
          transform: "rotate(-12deg)",
          transformOrigin: "bottom left",
          marginLeft: 2,
        }}
      />
    </span>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo">
      <Spines />
      Home Libraries
    </Link>
  );
}
