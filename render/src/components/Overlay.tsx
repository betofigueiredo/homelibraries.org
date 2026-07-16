/** Minimal HUD: wordmark + movement hint, layered above the canvas. */
export function Overlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px 26px',
        color: '#f3e6d2',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 300,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}
      >
        Home <b style={{ fontWeight: 600, color: '#f0b878' }}>Libraries</b>
      </div>
      <div
        style={{
          alignSelf: 'center',
          fontSize: 13,
          letterSpacing: '0.03em',
          color: '#e9dcc6',
          background: 'rgba(20,14,9,0.55)',
          border: '1px solid rgba(240,184,120,0.18)',
          padding: '9px 16px',
          borderRadius: 999,
          backdropFilter: 'blur(6px)',
        }}
      >
        <strong>W</strong>/<strong>S</strong> walk{' · '}
        <strong>A</strong>/<strong>D</strong> turn the camera
        {' · '}Press <strong>I</strong> for info about Gorda
      </div>
    </div>
  )
}
