/**
 * The island's gentle meadow hills. Height is a sum of smooth cosine² bumps
 * placed only in open grass — the built spots (library sections, path,
 * nameplate, fields, dock) sit in the flat zero-height gaps between them, so
 * everything constructed stays level while the meadow rolls around it.
 */

interface Bump {
  x: number
  z: number
  h: number // peak height
  r: number // footprint radius — height is exactly 0 beyond it
}

const BUMPS: Bump[] = [
  { x: 6.5, z: 13.5, h: 0.9, r: 4 },
  { x: -7, z: 12, h: 1.1, r: 4.5 },
  { x: 13.5, z: 6, h: 0.8, r: 3.5 },
  { x: 4, z: -13, h: 1.0, r: 4 },
  { x: -16.5, z: -0.5, h: 0.7, r: 3 },
  { x: 12, z: -12, h: 0.9, r: 3.2 },
  { x: -3, z: 16.5, h: 0.7, r: 3 },
]

export function terrainHeight(x: number, z: number): number {
  let y = 0
  for (const b of BUMPS) {
    const d = Math.hypot(x - b.x, z - b.z)
    if (d < b.r) {
      const t = 0.5 + 0.5 * Math.cos((d / b.r) * Math.PI)
      y += b.h * t * t
    }
  }
  return y
}

/** Centres of the library sections — kept flat and clear of grass blades. */
export const SECTION_SPOTS: { x: number; z: number; rotation: number }[] = [
  { x: 0, z: 0, rotation: 0 },
  { x: -11, z: -8, rotation: 0.94 }, // faces the island centre
]
