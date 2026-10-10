export function PageLoading() {
  return (
    <div className="center-page" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="skeleton" style={{ width: 220, height: 18 }} />
      <div className="skeleton" style={{ width: 160, height: 14 }} />
    </div>
  );
}
