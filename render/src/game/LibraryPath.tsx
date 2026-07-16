import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { LampPost } from './LampPost'
import { FloorLabel } from './FloorLabel'
import { grassTexture, brickTexture } from './textures'
import { makeRng } from './rng'
import {
  BRICK,
  BrickWall,
  GROUND_HALF,
  Paving,
  ShelfBody,
  TreeBody,
  WALL_AT,
  WALL_H,
  WALL_T,
  useForestRing,
  Bench,
} from './Library'

/* -------------------------------------------------------------------------- */
/*  A meandering RPG-style trail                                               */
/*                                                                            */
/*  Instead of four courts nailed to the compass points, a single winding     */
/*  brick path threads through the garden and reading "nooks" are discovered   */
/*  along it — the way a village trail in an RPG strings together landmarks.   */
/* -------------------------------------------------------------------------- */

const PATH_W = 2.4 // width of the trail
const TILE_T = 0.06 // thickness of a paving tile

// Hand-authored control points the trail flows through (x, z). They wander so
// the loop never reads as a plain circle, encircling a central hub clearing.
const TRAIL_POINTS: [number, number][] = [
  [1, 12],
  [-7, 10],
  [-12, 2],
  [-9, -6],
  [-1, -12],
  [7, -10],
  [12, -1],
  [8, 7],
]

/** The smooth closed loop through the control points, built once. */
function useTrail() {
  return useMemo(() => {
    const pts = TRAIL_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z))
    // `true` closes the curve into a seamless loop.
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5)
  }, [])
}

/** A single flat brick tile of the trail, laid along the local +Z axis. */
function PathTile({
  position,
  heading,
  length,
  width = PATH_W,
}: {
  position: [number, number, number]
  heading: number
  length: number
  width?: number
}) {
  const tex = useMemo(() => brickTexture(width / 1.6, length / 1.6), [width, length])
  return (
    <group position={position} rotation={[0, heading, 0]}>
      <mesh position={[0, TILE_T / 2, 0]} receiveShadow>
        <boxGeometry args={[width, TILE_T, length]} />
        <meshStandardMaterial map={tex} color={BRICK} roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Pave the whole trail by sampling the curve and laying overlapping tiles. */
function TrailPaving({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const tiles = useMemo(() => {
    const SEG = 64
    const pts = curve.getSpacedPoints(SEG)
    const out: { position: [number, number, number]; heading: number; length: number }[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const dx = b.x - a.x
      const dz = b.z - a.z
      const len = Math.hypot(dx, dz)
      out.push({
        position: [(a.x + b.x) / 2, 0.02, (a.z + b.z) / 2],
        heading: Math.atan2(dx, dz),
        length: len + 0.35, // small overlap hides seams on curves
      })
    }
    return out
  }, [curve])

  return (
    <>
      {tiles.map((t, i) => (
        <PathTile key={i} {...t} />
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  A reading nook — a clearing beside the trail                              */
/* -------------------------------------------------------------------------- */

/** A patch of shelves, a bench and lamps in a small clearing off the path. */
function Nook({
  center,
  rotation,
  seed,
  shelves = 3,
}: {
  center: [number, number, number]
  rotation: number
  seed: number
  shelves?: number
}) {
  // Spread the shelves evenly along the back wall, facing the clearing (+Z).
  const xs = useMemo(() => {
    const gap = 2.3
    const start = -((shelves - 1) * gap) / 2
    return Array.from({ length: shelves }, (_, i) => start + i * gap)
  }, [shelves])
  const halfW = (xs.length * 2.3) / 2 + 0.4

  return (
    <group position={center} rotation={[0, rotation, 0]}>
      {/* Brick patio the nook sits on */}
      <Paving position={[0, 0.03, -0.3]} size={[halfW * 2, 5.6]} />

      {/* Low wall wrapping the back and sides */}
      <BrickWall position={[0, 0, -3]} size={[halfW * 2, WALL_H, WALL_T]} />
      <BrickWall position={[-halfW, 0, -1.4]} size={[WALL_T, WALL_H, 3.2]} />
      <BrickWall position={[halfW, 0, -1.4]} size={[WALL_T, WALL_H, 3.2]} />

      {/* Shelves along the back, facing the clearing */}
      {xs.map((x, i) => (
        <ShelfBody key={i} position={[x, 0, -2.6]} seed={seed + i} />
      ))}

      {/* A bench to sit and read, plus flanking lamps */}
      <Bench position={[0, 0, 1.4]} rotation={Math.PI} />
      <LampPost position={[-halfW + 0.3, 0, 1.9]} />
      <LampPost position={[halfW - 0.3, 0, 1.9]} />

      {/* A tree tucked into one corner for shade */}
      <TreeBody position={[-halfW - 0.6, 0, -3.4]} scale={1.15} seed={seed + 30} />
    </group>
  )
}

/** Place nooks around the loop, each nestled on the outer edge facing inward. */
function useNooks(curve: THREE.CatmullRomCurve3) {
  return useMemo(() => {
    const spec: { t: number; shelves: number; seed: number }[] = [
      { t: 0.1, shelves: 3, seed: 100 },
      { t: 0.35, shelves: 4, seed: 200 },
      { t: 0.6, shelves: 2, seed: 300 },
      { t: 0.85, shelves: 3, seed: 400 },
    ]
    const OFFSET = 4.3 // how far off the trail the clearing sits
    return spec.map(({ t, shelves, seed }) => {
      const p = curve.getPointAt(t)
      const tan = curve.getTangentAt(t)
      // Perpendicular to the trail; flip so it points outward (away from centre).
      const perp = new THREE.Vector3(tan.z, 0, -tan.x)
      if (perp.dot(p) < 0) perp.negate()
      const center: [number, number, number] = [
        p.x + perp.x * OFFSET,
        0,
        p.z + perp.z * OFFSET,
      ]
      // The nook's open side (+Z) should face back inward toward the trail.
      const facing = perp.clone().multiplyScalar(-1)
      const rotation = Math.atan2(facing.x, facing.z)
      // A short spur linking the clearing to the trail.
      const spurMid: [number, number, number] = [
        p.x + perp.x * (OFFSET / 2),
        0.02,
        p.z + perp.z * (OFFSET / 2),
      ]
      const spurHeading = Math.atan2(perp.x, perp.z)
      return { center, rotation, seed, shelves, spurMid, spurHeading }
    })
  }, [curve])
}

/** A short garden path linking the central hub out to the loop. */
function useConnector(curve: THREE.CatmullRomCurve3) {
  return useMemo(() => {
    // Aim the connector at the loop's northernmost point (nearest the spawn).
    const pts = curve.getSpacedPoints(120)
    let b = pts[0]
    for (const p of pts) if (p.z > b.z) b = p
    const a = new THREE.Vector3(0, 0, 4.5) // edge of the hub clearing
    const dx = b.x - a.x
    const dz = b.z - a.z
    return {
      position: [(a.x + b.x) / 2, 0.02, (a.z + b.z) / 2] as [number, number, number],
      heading: Math.atan2(dx, dz),
      length: Math.hypot(dx, dz) + 0.4,
    }
  }, [curve])
}

/* -------------------------------------------------------------------------- */
/*  A few trees scattered off the trail (hand-placed to avoid the path).      */
/* -------------------------------------------------------------------------- */

function useScatter() {
  return useMemo(() => {
    const rand = makeRng(777)
    const spots: [number, number][] = [
      [13, 15],
      [-14, 6],
      [15, -2],
      [-13, -8],
      [12, -15],
      [-8, 16],
      [8, -16],
      [-15, -15],
    ]
    return spots.map(([x, z], i) => ({
      position: [x, 0, z] as [number, number, number],
      scale: 0.9 + rand() * 0.7,
      seed: 600 + i,
    }))
  }, [])
}

/* -------------------------------------------------------------------------- */
/*  The garden, path edition                                                  */
/* -------------------------------------------------------------------------- */

export function LibraryPath() {
  const grass = useMemo(() => grassTexture(GROUND_HALF), [])
  const curve = useTrail()
  const nooks = useNooks(curve)
  const connector = useConnector(curve)
  const scatter = useScatter()
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

      {/* The looping trail */}
      <TrailPaving curve={curve} />

      {/* Connector path from the central hub out to the loop */}
      <PathTile position={connector.position} heading={connector.heading} length={connector.length} width={2} />

      {/* Central hub clearing with a landmark shade tree, ringed by the loop */}
      <Paving position={[0, 0.03, 1]} size={[7.5, 7]} />
      <TreeBody position={[0, 0.05, 0]} scale={1.9} seed={42} />

      {/* Gorda's nameplate, painted flat on the hub paving by the spawn */}
      <FloorLabel position={[0, 0.08, 2.7]} />

      <LampPost position={[-3, 0.05, 3.4]} />
      <LampPost position={[3, 0.05, 3.4]} />

      {/* Reading nooks discovered along the trail */}
      {nooks.map((n) => (
        <group key={n.seed}>
          <PathTile position={n.spurMid} heading={n.spurHeading} length={5.2} width={1.8} />
          <Nook center={n.center} rotation={n.rotation} seed={n.seed} shelves={n.shelves} />
        </group>
      ))}

      {/* Boundary wall — four low brick runs enclosing the garden */}
      <BrickWall position={[0, 0, -WALL_AT]} size={[WALL_AT * 2, WALL_H, WALL_T]} />
      <BrickWall position={[0, 0, WALL_AT]} size={[WALL_AT * 2, WALL_H, WALL_T]} />
      <BrickWall position={[WALL_AT, 0, 0]} size={[WALL_T, WALL_H, WALL_AT * 2]} />
      <BrickWall position={[-WALL_AT, 0, 0]} size={[WALL_T, WALL_H, WALL_AT * 2]} />

      {/* Trees: a loose scatter inside, dense forest ring outside */}
      {scatter.map((t) => (
        <TreeBody key={`s${t.seed}`} {...t} />
      ))}
      {forest.map((t) => (
        <TreeBody key={`f${t.seed}`} {...t} />
      ))}
    </group>
  )
}
