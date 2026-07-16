import { useGame } from '../game/useGame'

const css = `
@keyframes hl-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-7px); opacity: 1; }
}
.hl-loader {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background: radial-gradient(120% 100% at 50% 30%, #241a12 0%, #140e09 60%, #0c0805 100%);
  color: #f3e6d2;
  transition: opacity 0.9s ease, visibility 0.9s ease;
}
.hl-loader.ready {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.hl-title {
  font-size: clamp(28px, 5vw, 46px);
  font-weight: 300;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.hl-title b { font-weight: 600; color: #f0b878; }
.hl-sub { font-size: 13px; letter-spacing: 0.06em; opacity: 0.65; }
.hl-dots { display: flex; gap: 8px; }
.hl-dots span {
  width: 9px; height: 9px; border-radius: 50%;
  background: #e0964a;
  animation: hl-bounce 1.3s infinite ease-in-out both;
}
.hl-dots span:nth-child(2) { animation-delay: 0.16s; }
.hl-dots span:nth-child(3) { animation-delay: 0.32s; }
`

/** Full-screen intro that covers the physics-init gap, then fades away. */
export function LoadingOverlay() {
  const ready = useGame((s) => s.ready)
  return (
    <>
      <style>{css}</style>
      <div className={`hl-loader${ready ? ' ready' : ''}`}>
        <div className="hl-title">
          Home&nbsp;<b>Libraries</b>
        </div>
        <div className="hl-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="hl-sub">Entering the library…</div>
      </div>
    </>
  )
}
