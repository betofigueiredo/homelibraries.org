import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Bookshelf, SHELF_DIMENSIONS } from './Bookshelf'
import { Tree } from './Tree'
import { LampPost } from './LampPost'
import { brickTexture, grassTexture } from './textures'
import { makeRng } from './rng'

export const GROUND_HALF = 26 // grass plane spans -26..26
export const WALL_AT = 20 // brick boundary wall radius
export const WALL_H = 0.95
export const WALL_T = 0.5
const SECTION_DIST = 14 // distance of each reading court from centre
const PLAZA = 9 // side of the central brick plaza
const { W: SW, H: SH, D: SD } = SHELF_DIMENSIONS

export const BRICK = '#9a5238'

/* -------------------------------------------------------------------------- */
/*  Physics-backed props                                                       */
/* -------------------------------------------------------------------------- */

/** A bookshelf with a matching collider so the cat can't walk through it. */
export function ShelfBody({
  position,
  rotation = 0,
  seed,
}: {
  position: [number, number, number]
  rotation?: number
  seed: number
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
      <CuboidCollider args={[SW / 2, SH / 2, SD / 2]} position={[0, SH / 2, 0]} />
      <Bookshelf position={[0, 0, 0]} seed={seed} />
    </RigidBody>
  )
}

/** A tree with a trunk collider so the cat bumps into it. */
export function TreeBody({
  position,
  scale = 1,
  seed,
}: {
  position: [number, number, number]
  scale?: number
  seed: number
}) {
  const r = 0.28 * scale
  const h = 1.3 * scale
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[r, h, r]} position={[0, h, 0]} />
      <Tree position={[0, 0, 0]} scale={scale} seed={seed} />
    </RigidBody>
  )
}

/** A simple wooden garden bench, with a collider. */
export function Bench({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  const WOOD = '#5c3f28'
  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
      <CuboidCollider args={[0.75, 0.35, 0.25]} position={[0, 0.35, 0]} />
      {/* Seat */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.08, 0.45]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.68, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.36, 0.06]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.42]} />
          <meshStandardMaterial color={WOOD} roughness={0.8} />
        </mesh>
      ))}
    </RigidBody>
  )
}

/* -------------------------------------------------------------------------- */
/*  Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

/** A flat brick paving slab (top-facing) for plazas and patios. */
export function Paving({
  position,
  size,
  rotation = 0,
}: {
  position: [number, number, number]
  size: [number, number]
  rotation?: number
}) {
  const [w, d] = size
  const tex = useMemo(() => brickTexture(w / 2, d / 2), [w, d])
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={tex} color={BRICK} roughness={0.9} />
    </mesh>
  )
}

/** A low brick wall segment with a collider. */
export function BrickWall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  const [w, h, d] = size
  const tex = useMemo(() => brickTexture(Math.max(w, d) / 1.5, h / 1.5), [w, h, d])
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={tex} color={BRICK} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

/* -------------------------------------------------------------------------- */
/*  A reading court — one "place": a brick patio ringed with bookshelves,      */
/*  a bench, lamp posts and flanking trees. Faces the garden centre (+Z).      */
/* -------------------------------------------------------------------------- */

function Section({
  center,
  rotation,
  seed,
}: {
  center: [number, number, number]
  rotation: number
  seed: number
}) {
  return (
    <group position={center} rotation={[0, rotation, 0]}>
      {/* Brick patio */}
      <Paving position={[0, 0.03, 0]} size={[7.6, 6.4]} />
      {/* Low brick wall behind the shelves, wrapping three sides */}
      <BrickWall position={[0, 0, -3.3]} size={[7.8, WALL_H, WALL_T]} />
      <BrickWall position={[-3.65, 0, -1.4]} size={[WALL_T, WALL_H, 4.2]} />
      <BrickWall position={[3.65, 0, -1.4]} size={[WALL_T, WALL_H, 4.2]} />

      {/* Three bookshelves in a row along the back wall, facing the patio (+Z) */}
      <ShelfBody position={[-2.3, 0, -2.9]} seed={seed} />
      <ShelfBody position={[0, 0, -2.9]} seed={seed + 1} />
      <ShelfBody position={[2.3, 0, -2.9]} seed={seed + 2} />

      {/* A bench facing the shelves */}
      <Bench position={[0, 0, 1.9]} rotation={Math.PI} />

      {/* Lamp posts flanking the entrance */}
      <LampPost position={[-3.4, 0, 2.6]} />
      <LampPost position={[3.4, 0, 2.6]} />

      {/* Trees framing the court */}
      <TreeBody position={[-4.6, 0, -3.8]} scale={1.15} seed={seed + 10} />
      <TreeBody position={[4.6, 0, -3.8]} scale={1.25} seed={seed + 20} />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  The garden                                                                 */
/* -------------------------------------------------------------------------- */

// The four courts, one per cardinal direction, each turned to face the centre.
const SECTIONS: { center: [number, number, number]; rotation: number; seed: number }[] = [
  { center: [0, 0, -SECTION_DIST], rotation: 0, seed: 100 }, // north
  { center: [0, 0, SECTION_DIST], rotation: Math.PI, seed: 200 }, // south
  { center: [SECTION_DIST, 0, 0], rotation: -Math.PI / 2, seed: 300 }, // east
  { center: [-SECTION_DIST, 0, 0], rotation: Math.PI / 2, seed: 400 }, // west
]

/** Scatter trees in the four diagonal groves between the courts. */
function useGroves() {
  return useMemo(() => {
    const rand = makeRng(999)
    const trees: { position: [number, number, number]; scale: number; seed: number }[] = []
    const corners: [number, number][] = [
      [12, 12],
      [12, -12],
      [-12, 12],
      [-12, -12],
    ]
    let s = 500
    for (const [cx, cz] of corners) {
      const n = 5 + ((rand() * 3) | 0)
      for (let i = 0; i < n; i++) {
        const x = cx + (rand() - 0.5) * 9
        const z = cz + (rand() - 0.5) * 9
        trees.push({ position: [x, 0, z], scale: 0.9 + rand() * 0.7, seed: s++ })
      }
    }
    return trees
  }, [])
}

/** A ring of taller trees just outside the wall — a forest backdrop. */
export function useForestRing() {
  return useMemo(() => {
    const rand = makeRng(4242)
    const trees: { position: [number, number, number]; scale: number; seed: number }[] = []
    const count = 54
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand() * 0.08
      const r = WALL_AT + 1.5 + rand() * 4
      trees.push({
        position: [Math.sin(a) * r, 0, Math.cos(a) * r],
        scale: 1.3 + rand() * 0.9,
        seed: 800 + i,
      })
    }
    return trees
  }, [])
}

/** The garden: grass, brick plaza + paths, four reading courts, and trees. */
export function Library() {
  const grass = useMemo(() => grassTexture(GROUND_HALF), [])
  const groves = useGroves()
  const forest = useForestRing()

  return (
    <group>
      {/* Grassy ground (thick box so it also serves as the floor collider) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[GROUND_HALF * 2, 0.5, GROUND_HALF * 2]} />
          <meshStandardMaterial map={grass} color="#5f7a48" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Central brick plaza with a grand shade tree */}
      <Paving position={[0, 0.03, 0]} size={[PLAZA, PLAZA]} />
      <TreeBody position={[0, 0.05, 0]} scale={1.9} seed={42} />
      <LampPost position={[-3.4, 0.05, 3.4]} />
      <LampPost position={[3.4, 0.05, 3.4]} />
      <LampPost position={[-3.4, 0.05, -3.4]} />
      <LampPost position={[3.4, 0.05, -3.4]} />

      {/* Brick paths from the plaza out to each court */}
      <Paving position={[0, 0.02, -8.5]} size={[2.6, 6]} />
      <Paving position={[0, 0.02, 8.5]} size={[2.6, 6]} />
      <Paving position={[8.5, 0.02, 0]} size={[6, 2.6]} />
      <Paving position={[-8.5, 0.02, 0]} size={[6, 2.6]} />

      {/* The four reading courts */}
      {SECTIONS.map((s) => (
        <Section key={s.seed} {...s} />
      ))}

      {/* Boundary wall — four low brick runs enclosing the garden */}
      <BrickWall position={[0, 0, -WALL_AT]} size={[WALL_AT * 2, WALL_H, WALL_T]} />
      <BrickWall position={[0, 0, WALL_AT]} size={[WALL_AT * 2, WALL_H, WALL_T]} />
      <BrickWall position={[WALL_AT, 0, 0]} size={[WALL_T, WALL_H, WALL_AT * 2]} />
      <BrickWall position={[-WALL_AT, 0, 0]} size={[WALL_T, WALL_H, WALL_AT * 2]} />

      {/* Trees: diagonal groves inside, forest ring outside */}
      {groves.map((t) => (
        <TreeBody key={`g${t.seed}`} {...t} />
      ))}
      {forest.map((t) => (
        <Tree key={`f${t.seed}`} {...t} />
      ))}
    </group>
  )
}
