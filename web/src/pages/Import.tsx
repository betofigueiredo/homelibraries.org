import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";

import { api, mcpUrl, sourceName, type ImportPreview, type ImportSummary } from "../api";
import { RequireUser } from "../auth";
import { CopyButton } from "../components/CopyButton";
import { AlertIcon, CheckIcon, UploadIcon } from "../components/Icons";
import { StatusBadge } from "../components/StatusBadge";
import { shortTitle } from "../components/books";

/** The server's body limit (axum's default). */
const MAX_BYTES = 2 * 1024 * 1024;

const STEPS = ["Upload", "Check", "Done"] as const;

export function ImportPage() {
  return <RequireUser>{(me) => <Import username={me.username} />}</RequireUser>;
}

/**
 * Upload → check → done. The file stays in memory between the check and the import,
 * and is sent again to import, so the server keeps no state in between.
 */
function Import({ username }: { username: string }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const preview = useMutation({ mutationFn: api.previewImport });
  const run = useMutation({
    mutationFn: api.runImport,
    // The library page shows the new books next time it's opened.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library", username] }),
  });

  const choose = (chosen: File | undefined) => {
    if (!chosen) return;
    setFile(chosen);
    run.reset();
    setTooBig(chosen.size > MAX_BYTES);
    if (chosen.size > MAX_BYTES) preview.reset();
    else preview.mutate(chosen);
  };

  const restart = () => {
    setFile(null);
    setTooBig(false);
    preview.reset();
    run.reset();
  };

  const step = run.isSuccess ? 2 : preview.isSuccess ? 1 : 0;

  return (
    <div className="container narrow page">
      <div className="import-head">
        <h1 className="page-title" tabIndex={-1}>
          Import your <span className="em">books</span>
        </h1>
        <ol className="steps" aria-label="Steps">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined} data-state={i < step ? "done" : i === step ? "now" : "next"}>
              <span className="step-dot">{i < step ? <CheckIcon size={12} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <Upload
          file={file}
          checking={preview.isPending}
          error={tooBig ? "The file is bigger than 2 MB. Exports with thousands of books still fit, so check it's the right file." : preview.error?.message}
          onChoose={choose}
        />
      )}
      {step === 1 && preview.data && file && (
        <Check
          file={file}
          preview={preview.data}
          importing={run.isPending}
          error={run.error?.message}
          onImport={() => run.mutate(file)}
          onRestart={restart}
        />
      )}
      {step === 2 && run.data && <Done summary={run.data} username={username} onRestart={restart} />}
    </div>
  );
}

function Upload({
  file,
  checking,
  error,
  onChoose,
}: {
  file: File | null;
  checking: boolean;
  error: string | undefined;
  onChoose: (file: File | undefined) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <section className="card card-pad">
      <p className="muted">
        Upload the CSV you exported from Goodreads or Hardcover. We check it and show you what comes in before anything
        is saved.
      </p>
      <label
        className="dropzone"
        data-dragging={dragging || undefined}
        aria-busy={checking}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onChoose(e.dataTransfer.files[0]);
        }}
      >
        <span className="dropzone-icon">{checking ? <span className="spinner" /> : <UploadIcon />}</span>
        <span className="dropzone-title">
          {checking ? (
            <>Checking {file?.name}…</>
          ) : (
            <>
              Drop your CSV here, or <span className="dropzone-link">choose a file</span>
            </>
          )}
        </span>
        <span className="hint">Goodreads or Hardcover export · up to 2 MB</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={checking}
          onChange={(e) => {
            onChoose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>

      {error && file && (
        <div className="alert" role="alert">
          <AlertIcon />
          <div>
            <strong>We can't import {file.name}</strong>
            <p>{error} Nothing was imported.</p>
          </div>
        </div>
      )}

      <div className="howto">
        <div>
          <strong>From Goodreads</strong>
          <p>My Books → Import and export → Export Library.</p>
        </div>
        <div>
          <strong>From Hardcover</strong>
          <p>Settings → Export → download as CSV.</p>
        </div>
      </div>
    </section>
  );
}

function Check({
  file,
  preview,
  importing,
  error,
  onImport,
  onRestart,
}: {
  file: File;
  preview: ImportPreview;
  importing: boolean;
  error: string | undefined;
  onImport: () => void;
  onRestart: () => void;
}) {
  const source = sourceName[preview.source];
  const books = preview.to_import === 1 ? "book" : "books";

  return (
    <section className="import-check fade-up">
      <div className="valid-file">
        <span className="ok-icon">
          <CheckIcon />
        </span>
        <strong>Valid {source} export</strong>
        <span className="mono hint">{file.name}</span>
      </div>

      <div className="stats">
        <div className="stat stat-focus">
          <div className="stat-label">Will be imported</div>
          <div className="stat-value">{preview.to_import}</div>
          <div className="stat-sub">Read and currently reading</div>
        </div>
        <div className="stat">
          <div className="stat-label">Left out</div>
          <div className="stat-value">{preview.ignored}</div>
          <div className="stat-sub">To-read and other shelves</div>
        </div>
        <div className="stat">
          <div className="stat-label">Rows with problems</div>
          <div className="stat-value">{preview.skipped}</div>
          <div className="stat-sub">{preview.skipped ? "Skipped, see below" : "Nothing to fix"}</div>
        </div>
      </div>

      {preview.sample.length > 0 && (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="table">
              <caption>First books</caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Author</th>
                  <th scope="col">Status</th>
                  <th scope="col">Read</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((book, i) => (
                  <tr key={i}>
                    <td className="td-title">{shortTitle(book.title)}</td>
                    <td className="td-quiet">{book.author}</td>
                    <td>
                      <StatusBadge status={book.status} />
                    </td>
                    <td className="td-date">{book.date_read ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.errors.length > 0 && (
        <details className="card card-pad problems">
          <summary>
            {preview.errors.length} {preview.errors.length === 1 ? "row" : "rows"} will be skipped
          </summary>
          <ul>
            {preview.errors.map((e) => (
              <li key={e.line}>
                <span className="mono">Line {e.line}</span> {e.reason}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="note">
        Your library will match this file. Books from an earlier {source} import that aren't in it will be removed.
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="button-row">
        <button type="button" className="btn btn-primary" onClick={onImport} disabled={importing || preview.to_import === 0}>
          {importing ? "Importing…" : `Import ${preview.to_import} ${books}`} <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRestart} disabled={importing}>
          Choose another file
        </button>
      </div>
    </section>
  );
}

function Done({ summary, username, onRestart }: { summary: ImportSummary; username: string; onRestart: () => void }) {
  const url = mcpUrl(username);
  const onShelf = summary.created + summary.updated + summary.unchanged;
  const counts = [
    ["Added", summary.created],
    ["Updated", summary.updated],
    ["Unchanged", summary.unchanged],
    ["Removed", summary.deleted],
  ] as const;

  return (
    <section className="import-check fade-up">
      <div className="card card-pad">
        <span className="badge" style={{ alignSelf: "flex-start" }}>
          Import complete
        </span>
        <h2 className="done-title">
          {onShelf} {sourceName[summary.source]} {onShelf === 1 ? "book is" : "books are"} on your{" "}
          <span className="em">shelf</span>
        </h2>
        <dl className="done-counts">
          {counts.map(([label, n]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="num">{n}</dd>
            </div>
          ))}
        </dl>
        <div className="connect-url done-mcp">
          <code>{url}</code>
          <CopyButton text={url} label="Copy MCP address" className="connect-copy" />
        </div>
      </div>
      <div className="button-row">
        <Link to={`/${username}`} className="btn btn-primary">
          See your library <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          Import another file
        </button>
      </div>
    </section>
  );
}
