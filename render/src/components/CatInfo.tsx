import { useEffect, useState } from 'react'

/** Facts about Gorda, shown in the info card. Edit freely. */
const FACTS: [string, string][] = [
  ['Name', 'Gorda'],
  ['Breed', 'Ginger tabby'],
  ['Favourite spot', 'The warmest bookshelf'],
  ['Hobby', 'Knocking bookmarks to the floor'],
  ['Mood', 'Perpetually hungry'],
]

/**
 * A dismissible card with info about Gorda the cat.
 * Toggle with the `i` key; close with `i` again or Escape.
 * Renders above the canvas, independent of the game loop.
 */
export function CatInfo() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore repeats and modifier combos so it stays a clean toggle.
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,7,4,0.45)',
        backdropFilter: 'blur(3px)',
        fontFamily: 'system-ui, sans-serif',
        color: '#f3e6d2',
        zIndex: 10,
        animation: 'catInfoFade 180ms ease-out',
      }}
    >
      {/* Stop clicks inside the card from closing it. */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(380px, 88vw)',
          background: 'rgba(24,17,11,0.92)',
          border: '1px solid rgba(240,184,120,0.28)',
          borderRadius: 18,
          padding: '26px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#f0b878',
            marginBottom: 6,
          }}
        >
          Meet the cat
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 18 }}>
          Gorda 🐈
        </div>

        <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
          {FACTS.map(([label, value]) => (
            <div
              key={label}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}
            >
              <dt
                style={{
                  fontSize: 13,
                  letterSpacing: '0.04em',
                  color: '#c9b79b',
                }}
              >
                {label}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'right',
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div
          style={{
            marginTop: 20,
            fontSize: 12,
            color: '#8f8069',
            textAlign: 'center',
          }}
        >
          Press <strong style={{ color: '#c9b79b' }}>I</strong> or{' '}
          <strong style={{ color: '#c9b79b' }}>Esc</strong> to close
        </div>
      </div>

      <style>{`@keyframes catInfoFade { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  )
}
