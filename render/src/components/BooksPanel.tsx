import { useCallback, useEffect, useRef, useState } from 'react'
import data from '../data.json'
import { useGame } from '../game/useGame'

type Section = (typeof data.sections)[number]
type Book = Section['books'][number]

const EASE = 'cubic-bezier(0.2, 0, 0, 1)'
const PARCHMENT = '#f3e6d2'
const AMBER = '#f0b878'
const MUTED = '#c9b79b'
const FAINT = '#8f8069'

/** EN ⇄ PT pill — switches every title, description, cover and link. */
function LangToggle() {
  const lang = useGame((s) => s.lang)
  const setLang = useGame((s) => s.setLang)
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        padding: 3,
        borderRadius: 999,
        background: 'rgba(240,184,120,0.12)',
      }}
    >
      {(['en', 'pt'] as const).map((l) => (
        <button
          key={l}
          className="btn-press"
          onClick={() => setLang(l)}
          style={{
            border: 0,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '6px 12px',
            borderRadius: 999,
            color: lang === l ? '#241708' : MUTED,
            background: lang === l ? AMBER : 'transparent',
            transitionProperty: 'background-color, color',
            transitionDuration: '180ms',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** One edge of the shelf: a fade into the sheet plus a paging chevron. */
function ShelfEdge({
  side,
  visible,
  onPage,
}: {
  side: 'left' | 'right'
  visible: boolean
  onPage: () => void
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side]: -4,
          width: 44,
          pointerEvents: 'none',
          background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, rgba(22,16,10,0.96), transparent)`,
          opacity: visible ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: '220ms',
          zIndex: 1,
        }}
      />
      <button
        className="btn-press"
        onClick={onPage}
        aria-label={side === 'left' ? 'Scroll shelf left' : 'Scroll shelf right'}
        style={{
          position: 'absolute',
          [side]: -10,
          top: 62, // vertically centred on the covers, not the captions
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          padding: 0,
          paddingBottom: 3, // optical centring of the glyph
          borderRadius: 999,
          border: '1px solid rgba(240,184,120,0.3)',
          background: 'rgba(20,14,9,0.88)',
          color: AMBER,
          fontSize: 20,
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transitionProperty: 'opacity',
          transitionDuration: '220ms',
          zIndex: 2,
        }}
      >
        {side === 'left' ? '‹' : '›'}
      </button>
    </>
  )
}

/**
 * The scrolling shelf of covers. Built for sections with many books: snap
 * scrolling, hidden scrollbar, fade + chevron affordances at whichever edge
 * still has books tucked past it, and the mouse wheel scrolls it sideways.
 */
function Shelf({ section, onOpen }: { section: Section; onOpen: (b: Book) => void }) {
  const lang = useGame((s) => s.lang)
  const ref = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState({ left: false, right: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft > 4
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
    setOverflow((o) => (o.left === left && o.right === right ? o : { left, right }))
  }, [])

  // Measure once laid out, and again whenever the sheet resizes.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const raf = requestAnimationFrame(update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [update])

  const page = (dir: 1 | -1) => {
    const el = ref.current
    el?.scrollBy({ left: dir * (el.clientWidth - 108), behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <div
        ref={ref}
        className="book-shelf"
        onScroll={update}
        onWheel={(e) => {
          const el = ref.current
          if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY
        }}
      >
        {section.books.map((b, i) => (
          <button
            key={`${b.title.en}-${i}`}
            className="book-cover"
            onClick={() => onOpen(b)}
            title={`${b.title[lang]} — ${b.author}`}
            style={
              {
                '--tilt': `${(i % 2 ? 1 : -1) * 1.4}deg`,
                animation: `riseIn 440ms ${EASE} both`,
                // Stagger the first covers, then let the rest arrive together —
                // a 30-book shelf shouldn't take three seconds to settle.
                animationDelay: `${Math.min(140 + i * 70, 560)}ms`,
              } as React.CSSProperties
            }
          >
            <img src={b.image[lang]} alt={b.title[lang]} loading="lazy" />
            <span className="cap-title">{b.title[lang]}</span>
            <span className="cap-author">{b.author}</span>
          </button>
        ))}
      </div>
      <ShelfEdge side="left" visible={overflow.left} onPage={() => page(-1)} />
      <ShelfEdge side="right" visible={overflow.right} onPage={() => page(1)} />
    </div>
  )
}

/** Fullscreen card with one book: big cover, story, and the shop link. */
function BookDetail({
  book,
  section,
  onClose,
}: {
  book: Book
  section: Section
  onClose: () => void
}) {
  const lang = useGame((s) => s.lang)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rise = (delay: number) => ({
    animation: `riseIn 420ms ${EASE} both`,
    animationDelay: `${delay}ms`,
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(10,7,4,0.5)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'system-ui, sans-serif',
        color: PARCHMENT,
        animation: `fadeIn 220ms ${EASE} both`,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          width: 'min(720px, 94vw)',
          maxHeight: '86vh',
          overflowY: 'auto',
          padding: 28,
          borderRadius: 22,
          background: 'rgba(24,17,11,0.95)',
          border: '1px solid rgba(240,184,120,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.6)',
          animation: `cardIn 320ms ${EASE} both`,
        }}
      >
        <img
          src={book.image[lang]}
          alt={book.title[lang]}
          style={{
            width: 200,
            alignSelf: 'flex-start',
            borderRadius: 10,
            outline: '1px solid rgba(255,255,255,0.12)',
            outlineOffset: -1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.45), 0 20px 50px rgba(0,0,0,0.55)',
            ...rise(40),
          }}
        />
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: AMBER,
              marginBottom: 8,
              ...rise(80),
            }}
          >
            {section.title[lang]}
          </div>
          <div
            className="serif-title"
            style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.15, ...rise(120) }}
          >
            {book.title[lang]}
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 6, ...rise(160) }}>
            {lang === 'pt' ? 'por' : 'by'} {book.author}
          </div>
          <p
            className="book-desc"
            style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              color: '#e6d8c0',
              margin: '16px 0 22px',
              ...rise(200),
            }}
          >
            {book.description[lang]}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginTop: 'auto',
              ...rise(240),
            }}
          >
            <a
              className="btn-press"
              href={book.link[lang]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 20px',
                borderRadius: 999,
                background: AMBER,
                color: '#241708',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(240,184,120,0.25)',
              }}
            >
              {lang === 'pt' ? 'Ver na Amazon' : 'View on Amazon'} ↗
            </a>
            <button
              className="btn-press"
              onClick={onClose}
              style={{
                padding: '11px 18px',
                borderRadius: 999,
                background: 'transparent',
                border: '1px solid rgba(240,184,120,0.3)',
                color: MUTED,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {lang === 'pt' ? 'Fechar' : 'Close'}
            </button>
            <span style={{ fontSize: 11.5, color: FAINT, marginLeft: 'auto' }}>Esc</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * The book view. When Gorda pads into a reading court, a warm sheet rises
 * from the bottom edge with that section's books fanned on a shelf —
 * staggered in one by one. Click a cover to open the full card; walk out of
 * the court and everything slips quietly away.
 */
export function BooksPanel() {
  const activeId = useGame((s) => s.activeSectionId)
  const lang = useGame((s) => s.lang)
  const [section, setSection] = useState<Section | null>(null)
  const [book, setBook] = useState<Book | null>(null)

  // Adjust state during render (react.dev "you might not need an effect"):
  // entering or switching courts swaps the shown section immediately; walking
  // out flips `leaving` so the sheet plays its exit before the timer below
  // unmounts it. Leaving also closes any open book.
  if (activeId && section?.id !== activeId) {
    setSection(data.sections.find((s) => s.id === activeId) ?? null)
  }
  const leaving = !activeId && section !== null
  if (leaving && book) setBook(null)

  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => setSection(null), 320)
    return () => window.clearTimeout(t)
  }, [leaving])

  if (!section) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 15,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: 'system-ui, sans-serif',
          color: PARCHMENT,
        }}
      >
        {/* Re-key on the section so switching courts replays the stagger. */}
        <div
          key={section.id}
          style={{
            pointerEvents: 'auto',
            margin: '0 16px 18px',
            width: 'fit-content',
            minWidth: 'min(520px, 94vw)',
            maxWidth: 'min(860px, 94vw)',
            padding: '18px 22px 16px',
            borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(28,20,13,0.92), rgba(20,14,9,0.96))',
            border: '1px solid rgba(240,184,120,0.22)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.35), 0 24px 60px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            animation: `${leaving ? `sheetOut 300ms` : `sheetIn 460ms`} ${EASE} both`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: AMBER,
                  animation: `riseIn 380ms ${EASE} both`,
                }}
              >
                {lang === 'pt' ? 'Pátio de leitura' : 'Reading court'}
              </div>
              <div
                className="serif-title"
                style={{
                  fontSize: 25,
                  fontWeight: 600,
                  lineHeight: 1.1,
                  marginTop: 4,
                  animation: `riseIn 380ms ${EASE} 40ms both`,
                }}
              >
                {section.title[lang]}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: MUTED,
                  marginTop: 4,
                  animation: `riseIn 380ms ${EASE} 80ms both`,
                }}
              >
                {section.subtitle[lang]}
                <span style={{ color: FAINT }}>
                  {' '}
                  · {section.books.length}{' '}
                  {section.books.length === 1
                    ? lang === 'pt'
                      ? 'livro'
                      : 'book'
                    : lang === 'pt'
                      ? 'livros'
                      : 'books'}
                </span>
              </div>
            </div>
            <div style={{ animation: `riseIn 380ms ${EASE} 80ms both` }}>
              <LangToggle />
            </div>
          </div>

          <Shelf section={section} onOpen={setBook} />

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              textAlign: 'center',
              color: FAINT,
              animation: `fadeIn 600ms ${EASE} 400ms both`,
            }}
          >
            {lang === 'pt' ? 'Clique numa capa para saber mais' : 'Click a cover to read more'}
          </div>
        </div>
      </div>

      {book && <BookDetail book={book} section={section} onClose={() => setBook(null)} />}
    </>
  )
}
