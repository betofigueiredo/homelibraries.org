import { useMemo } from 'react'
import { makeRng } from './rng'

const WOOD = '#4a3222'
const W = 1.8 // width
const H = 2.6 // height
const D = 0.42 // depth
const T = 0.07 // frame / board thickness

/** Outer dimensions, for placing physics colliders around a shelf. */
// eslint-disable-next-line react-refresh/only-export-components
export const SHELF_DIMENSIONS = { W, H, D }

// Warm, cohesive library palette for the book spines.
const BOOK_COLORS = [
  '#8c3b3b', '#b5643c', '#c9a24b', '#4b6b4a', '#35566b', '#6b4a6b',
  '#a86b4a', '#7a3b46', '#d9c5a0', '#40566b', '#8a5a3a', '#2f6b5e',
]

interface Book {
  x: number
  y: number
  sw: number // spine width
  bh: number // book height
  color: string
  tilt: number
}

/** Three vertical compartments, each packed with a row of book spines. */
function layoutBooks(seed: number): Book[] {
  const rand = makeRng(seed)
  const books: Book[] = []
  const innerW = W - 2 * T
  const boardYs = [T, H / 3, (2 * H) / 3, H - T] // bottom + 2 interior + top

  for (let c = 0; c < 3; c++) {
    const base = boardYs[c]
    const top = boardYs[c + 1]
    const avail = top - base - T
    let x = -innerW / 2 + 0.04
    while (x < innerW / 2 - 0.1) {
      const sw = 0.09 + rand() * 0.11
      if (x + sw > innerW / 2 - 0.02) break
      const bh = avail * (0.62 + rand() * 0.3)
      books.push({
        x: x + sw / 2,
        y: base + bh / 2,
        sw,
        bh,
        color: BOOK_COLORS[(rand() * BOOK_COLORS.length) | 0],
        tilt: rand() < 0.12 ? (rand() - 0.5) * 0.25 : 0,
      })
      x += sw + rand() * 0.015
    }
  }
  return books
}

/**
 * A wooden bookshelf unit packed with colourful books. Faces +Z by default;
 * rotate it when placing against a wall. Origin at floor level, centred on X.
 */
export function Bookshelf({
  position,
  rotation = 0,
  seed = 1,
}: {
  position: [number, number, number]
  rotation?: number
  seed?: number
}) {
  const books = useMemo(() => layoutBooks(seed), [seed])
  const backZ = -D / 2 + T / 2
  const bookZ = D / 2 - 0.16

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Carcass */}
      <group>
        {/* Back */}
        <mesh position={[0, H / 2, backZ]} receiveShadow castShadow>
          <boxGeometry args={[W, H, T]} />
          <meshStandardMaterial color={WOOD} roughness={0.65} />
        </mesh>
        {/* Sides */}
        <mesh position={[-W / 2 + T / 2, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, H, D]} />
          <meshStandardMaterial color={WOOD} roughness={0.65} />
        </mesh>
        <mesh position={[W / 2 - T / 2, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, H, D]} />
          <meshStandardMaterial color={WOOD} roughness={0.65} />
        </mesh>
        {/* Horizontal boards (bottom, 2 interior, top) */}
        {[T / 2, H / 3, (2 * H) / 3, H - T / 2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[W - 2 * T, T, D]} />
            <meshStandardMaterial color={WOOD} roughness={0.65} />
          </mesh>
        ))}
      </group>

      {/* Books */}
      {books.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, b.y, bookZ]}
          rotation={[0, 0, b.tilt]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.sw, b.bh, D * 0.66]} />
          <meshStandardMaterial color={b.color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
