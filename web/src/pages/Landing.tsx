import { Link } from "react-router";

import { useMe } from "../auth";
import { Footer, Header } from "../components/Header";
import { SignInForm } from "../components/SignInForm";
import { useTitle } from "../components/useTitle";
import { Demo } from "./landing/Demo";

const HEADLINE = ["What", "if", "your", "bookshelf", "could"];

const FAQ = [
  [
    "Who can see my library?",
    "Anyone with the link, and any assistant using your MCP address. Libraries are public. Your email is only used to send sign-in links.",
  ],
  ["Which books are imported?", "Books on your read and currently-reading shelves. To-read books are left out."],
  [
    "What happens when I import again?",
    "Your library is made to match the new file: new books are added, changed ones updated, and ones no longer in it removed.",
  ],
  ["Can an assistant change my library?", "No. The MCP server only reads. Changes come only from your own imports."],
] as const;

/** Books read per year in the example library, 2017–2026. */
const EXAMPLE_YEARS = [39, 38, 36, 29, 30, 30, 16, 19, 13, 16];

export function Landing() {
  useTitle(undefined);
  const { me } = useMe();

  return (
    <div className="app">
      <Header>
        <a href="#how" className="nav-link hide-sm">
          How it works
        </a>
        <a href="#features" className="nav-link hide-sm">
          MCP
        </a>
        <a href="#faq" className="nav-link hide-sm">
          FAQ
        </a>
        <Link to="/beto" className="nav-link">
          Example
        </Link>
      </Header>

      <main id="main">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-inner">
            <a href="#features" className="hero-pill fade-up">
              <span className="badge">New</span>
              Hardcover exports now supported <span aria-hidden="true">→</span>
            </a>
            <h1 className="hero-title" aria-label="What if your bookshelf could talk back?" tabIndex={-1}>
              {HEADLINE.map((word, i) => (
                <span key={word} aria-hidden="true" style={{ animationDelay: `${0.05 + i * 0.08}s` }}>
                  {word}{" "}
                </span>
              ))}
              <span aria-hidden="true" className="em" style={{ animationDelay: "0.55s", animationDuration: "1.1s" }}>
                talk back?
              </span>
            </h1>
            <p className="hero-lede fade-up" style={{ animationDelay: "0.8s" }}>
              Import your Goodreads or Hardcover history and ask your AI about it: the hidden gems, the big ideas, what to
              read next.
            </p>
            <div id="signin" className="hero-cta fade-up" style={{ animationDelay: "0.95s" }}>
              {me?.username ? (
                <Link to={`/${me.username}`} className="btn btn-primary">
                  Go to your library <span aria-hidden="true">→</span>
                </Link>
              ) : me ? (
                <Link to="/onboarding" className="btn btn-primary">
                  Pick your library's address <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <SignInForm id="hero-email" />
              )}
            </div>
            <div className="hero-demo fade-up" style={{ animationDelay: "1.1s" }}>
              <Demo />
            </div>
          </div>
        </section>

        <section className="container clients">
          <p className="hint">Works with any client that speaks MCP over HTTP</p>
          <ul>
            {["Claude", "Claude Code", "Cursor", "VS Code", "Windsurf", "Zed"].map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section id="features" className="container section">
          <div className="section-head">
            <span className="pill">Features</span>
            <h2 className="section-title">
              A shelf that answers <span className="em">questions</span>
            </h2>
          </div>
          <div className="bento">
            <article className="card bento-card">
              <div className="bento-visual">
                <div className="card-row">
                  <span className="mono">goodreads_library_export.csv</span>
                  <span className="badge">Goodreads</span>
                </div>
                <div className="bento-numbers">
                  <div>
                    <strong className="num">469</strong>
                    <span>import</span>
                  </div>
                  <div>
                    <strong className="num">75</strong>
                    <span>to-read, left out</span>
                  </div>
                  <div>
                    <strong className="num">0</strong>
                    <span>errors</span>
                  </div>
                </div>
              </div>
              <div>
                <h3>Checked before it's saved</h3>
                <p>We detect the format, read every row and show you what comes in. Nothing changes until you confirm.</p>
              </div>
            </article>

            <article className="card bento-card">
              <div className="bento-visual bento-tools mono">
                {["search_books", "get_book", "library_stats"].map((tool) => (
                  <div key={tool}>
                    <span>{tool}</span>
                    <span className="muted">read-only</span>
                  </div>
                ))}
              </div>
              <div>
                <h3>Tools your assistant understands</h3>
                <p>
                  Search by title, author or status, open a single book, or get totals and books per year. Nothing an agent
                  can break.
                </p>
              </div>
            </article>

            <article className="card bento-card">
              <ol className="bento-visual bars bento-bars" aria-label="Books read per year in the example library">
                {EXAMPLE_YEARS.map((n, i) => (
                  <li key={i}>
                    <span
                      className="bar"
                      data-current={i === EXAMPLE_YEARS.length - 1 || undefined}
                      style={{ height: `${Math.round((n / 39) * 84)}px` }}
                    />
                    <span className="bar-label">'{17 + i}</span>
                  </li>
                ))}
              </ol>
              <div>
                <h3>A public page for your books</h3>
                <p>Share {window.location.host}/you: what you're reading now, everything you've read, and your years in books.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="how" className="how">
          <div className="container how-inner">
            <div className="how-intro">
              <span className="pill">How it works</span>
              <h2 className="section-title">
                Live in about <span className="em">two minutes</span>
              </h2>
              <p className="muted">Import again whenever you finish a book. The file is the source of truth.</p>
            </div>
            <ol className="how-steps">
              <li>
                <span className="mono">01</span>
                <strong>Export</strong>
                <span>Goodreads: My Books → Import and export. Hardcover: Settings → Export.</span>
              </li>
              <li>
                <span className="mono">02</span>
                <strong>Upload</strong>
                <span>Books you've read and are reading come in. Your to-read list stays out.</span>
              </li>
              <li>
                <span className="mono">03</span>
                <strong>Connect</strong>
                <span>Paste your MCP address into your assistant. Nothing to install.</span>
              </li>
            </ol>
          </div>
        </section>

        <section id="faq" className="container narrow section">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Questions
          </h2>
          <div className="faq">
            {FAQ.map(([question, answer], i) => (
              <details key={question} open={i === 0}>
                <summary>
                  <span className="mono">0{i + 1}</span>
                  {question}
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container cta-wrap">
          <div className="cta">
            <h2 className="section-title">
              Start the <span className="em">conversation</span>
            </h2>
            <Link to={me?.username ? `/${me.username}` : "/signin"} className="btn cta-button">
              {me?.username ? "Go to your library" : "Create your library"} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
