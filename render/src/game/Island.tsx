import { useMemo } from 'react'
import * as THREE from 'three'
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
  TrimeshCollider,
} from '@react-three/rapier'
import { Instance, Instances } from '@react-three/drei'
import { Grass } from './Grass'
import { LampPost } from './LampPost'
import { FloorLabel } from './FloorLabel'
import { grassTexture, woodTexture } from './textures'
import { makeRng } from './rng'
import { TreeBody } from './Library'
import { LibrarySection } from './LibrarySection'
import { terrainHeight, SECTION_SPOTS } from './terrain'
import data from '../data.json'

/* -------------------------------------------------------------------------- */
/*  A small island: the library house in the middle, fields and grass around  */
/*  it, water all the way to the horizon.                                     */
/* -------------------------------------------------------------------------- */

const TRIM = '#6b4a2e' // wooden trim used on the dock rails

const ISLAND_R = 22 // sandy plateau radius (top of the island cylinder)
const GRASS_R = 20.5 // grass disc radius — the rim beyond is beach
const BARRIER_R = 21.2 // invisible fence keeping the cat out of the water
const DOCK_ANGLE = 0.6 // radians from +X — where the dock juts out

/* ------------------------------ The terrain ------------------------------- */

/**
 * The grassy ground as a polar-grid mesh displaced by `terrainHeight`, so the
 * meadow rolls in gentle hills while every built spot stays flat. Its trimesh
 * collider is what the cat actually walks on.
 */
function useTerrainGeometry() {
  return useMemo(() => {
    const RINGS = 40
    const SECTORS = 80
    const verts: number[] = [0, terrainHeight(0, 0), 0]
    const uvs: number[] = [0.5, 0.5]
    const indices: number[] = []
    for (let i = 1; i <= RINGS; i++) {
      const r = (i / RINGS) * GRASS_R
      for (let j = 0; j < SECTORS; j++) {
        const a = (j / SECTORS) * Math.PI * 2
        const x = Math.cos(a) * r
        const z = Math.sin(a) * r
        verts.push(x, terrainHeight(x, z), z)
        uvs.push((x / GRASS_R + 1) / 2, (z / GRASS_R + 1) / 2)
      }
    }
    const at = (i: number, j: number) => 1 + (i - 1) * SECTORS + (j % SECTORS)
    for (let j = 0; j < SECTORS; j++) indices.push(0, at(1, j + 1), at(1, j))
    for (let i = 2; i <= RINGS; i++) {
      for (let j = 0; j < SECTORS; j++) {
        const a = at(i - 1, j)
        const b = at(i - 1, j + 1)
        const c = at(i, j)
        const d = at(i, j + 1)
        indices.push(a, d, c, a, b, d)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return {
      geometry,
      vertices: new Float32Array(verts),
      indices: new Uint32Array(indices),
    }
  }, [])
}

function Terrain() {
  const grass = useMemo(() => grassTexture(GRASS_R), [])
  const { geometry, vertices, indices } = useTerrainGeometry()
  return (
    <RigidBody type="fixed" colliders={false}>
      <TrimeshCollider args={[vertices, indices]} />
      <mesh geometry={geometry} position={[0, 0.012, 0]} receiveShadow>
        <meshStandardMaterial map={grass} color="#8aa668" roughness={1} />
      </mesh>
    </RigidBody>
  )
}

/* ----------------------------- The fields -------------------------------- */

/** A tilled field: a soil patch planted with jittered rows of crops. */
function Field({
  center,
  rotation,
  size,
  crop,
  seed,
}: {
  center: [number, number, number]
  rotation: number
  size: [number, number]
  crop: 'wheat' | 'greens'
  seed: number
}) {
  const [w, d] = size
  const plants = useMemo(() => {
    const rand = makeRng(seed)
    const rows = Math.floor(d / 1.1)
    const cols = Math.floor(w / 0.95)
    const out: { pos: [number, number, number]; scale: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          pos: [
            -w / 2 + 0.7 + c * ((w - 1.4) / Math.max(1, cols - 1)) + (rand() - 0.5) * 0.2,
            0,
            -d / 2 + 0.7 + r * ((d - 1.4) / Math.max(1, rows - 1)) + (rand() - 0.5) * 0.15,
          ],
          scale: 0.75 + rand() * 0.5,
        })
      }
    }
    return out
  }, [w, d, seed])

  return (
    <group position={center} rotation={[0, rotation, 0]}>
      {/* Tilled soil */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#5c4430" roughness={1} />
      </mesh>
      {crop === 'wheat' ? (
        <Instances castShadow limit={plants.length}>
          <coneGeometry args={[0.22, 0.48, 6]} />
          <meshStandardMaterial color="#d9b45c" roughness={0.9} flatShading />
          {plants.map((p, i) => (
            <Instance key={i} position={[p.pos[0], 0.24 * p.scale, p.pos[2]]} scale={p.scale} />
          ))}
        </Instances>
      ) : (
        <Instances castShadow limit={plants.length}>
          <icosahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#4f7a3c" roughness={0.95} flatShading />
          {plants.map((p, i) => (
            <Instance key={i} position={[p.pos[0], 0.16 * p.scale, p.pos[2]]} scale={p.scale} />
          ))}
        </Instances>
      )}
    </group>
  )
}

/* ------------------------------ The dock --------------------------------- */

/** A little wooden dock jutting into the water, fenced so the cat stays dry. */
function Dock() {
  const planks = useMemo(() => woodTexture(3, 1), [])
  return (
    <group
      position={[Math.cos(DOCK_ANGLE) * 20.4, 0, Math.sin(DOCK_ANGLE) * 20.4]}
      rotation={[0, -DOCK_ANGLE, 0]}
    >
      <RigidBody type="fixed" colliders="cuboid">
        {/* Deck */}
        <mesh position={[2.5, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.12, 1.5]} />
          <meshStandardMaterial map={planks} color="#8a6a48" roughness={0.85} />
        </mesh>
        {/* Side + end rails (low walls so the cat can't hop in) */}
        <mesh position={[2.5, 0.3, 0.72]} castShadow>
          <boxGeometry args={[4.6, 0.45, 0.1]} />
          <meshStandardMaterial color={TRIM} roughness={0.8} />
        </mesh>
        <mesh position={[2.5, 0.3, -0.72]} castShadow>
          <boxGeometry args={[4.6, 0.45, 0.1]} />
          <meshStandardMaterial color={TRIM} roughness={0.8} />
        </mesh>
        <mesh position={[4.75, 0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.45, 1.5]} />
          <meshStandardMaterial color={TRIM} roughness={0.8} />
        </mesh>
      </RigidBody>
      {/* Posts down into the water */}
      {[
        [0.6, 0.6],
        [0.6, -0.6],
        [4.5, 0.6],
        [4.5, -0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.5, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 1.3, 7]} />
          <meshStandardMaterial color="#5c4430" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------- Scattered decoration --------------------------- */

const TREE_SPOTS: [number, number][] = [
  [7.5, 10.5],
  [-6, 11],
  [-14.5, -2],
  [-4.5, -12], // moved off the second reading court
  [2, -12.5],
  [12, -11],
  [16, 2.5],
  [-16, 8.5],
  [10, 14],
  [-3, -15.5],
]

const ROCK_SPOTS: [number, number, number][] = [
  // x, z, scale
  [19, 5.5, 0.55],
  [-18.5, -6, 0.7],
  [-2.5, 18.8, 0.45],
  [5, -18.5, 0.6],
  [17.5, -9, 0.4],
]

function useTrees() {
  return useMemo(() => {
    const rand = makeRng(1234)
    return TREE_SPOTS.map(([x, z], i) => ({
      position: [x, terrainHeight(x, z), z] as [number, number, number],
      scale: 0.9 + rand() * 0.7,
      seed: 700 + i,
    }))
  }, [])
}

/** A loose trail of stepping stones linking the two reading courts. */
function useTrailStones() {
  return useMemo(() => {
    const rand = makeRng(313)
    const from = { x: -3.9, z: -2.9 } // edge of the central court
    const to = { x: -7.6, z: -5.6 } // edge of the second court's stone ring
    const out: { position: [number, number, number]; s: number; ry: number }[] = []
    for (let i = 0; i < 6; i++) {
      const t = i / 5
      const x = from.x + (to.x - from.x) * t + (rand() - 0.5) * 0.7
      const z = from.z + (to.z - from.z) * t + (rand() - 0.5) * 0.7
      out.push({
        position: [x, terrainHeight(x, z) + 0.02, z],
        s: 0.3 + rand() * 0.3,
        ry: rand() * Math.PI,
      })
    }
    return out
  }, [])
}

/** Invisible fence ring at the beach edge, with a gap where the dock leaves. */
function ShoreBarrier() {
  const segments = useMemo(() => {
    const N = 64
    const out: { position: [number, number, number]; rotation: number }[] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      // Leave the gap for the dock mouth — its rails seal the sides.
      let diff = Math.abs(a - DOCK_ANGLE)
      diff = Math.min(diff, Math.PI * 2 - diff)
      if (diff < Math.PI / N) continue
      out.push({
        position: [Math.cos(a) * BARRIER_R, 1, Math.sin(a) * BARRIER_R],
        rotation: -a + Math.PI / 2,
      })
    }
    return out
  }, [])
  return (
    <RigidBody type="fixed" colliders={false}>
      {segments.map((s, i) => (
        <CuboidCollider
          key={i}
          args={[1.2, 1, 0.25]}
          position={s.position}
          rotation={[0, s.rotation, 0]}
        />
      ))}
    </RigidBody>
  )
}

/* ------------------------------- The island ------------------------------- */

export function Island() {
  const pathWood = useMemo(() => woodTexture(1.4, 4), [])
  const trees = useTrees()
  const trail = useTrailStones()

  return (
    <group>
      {/* The island body: a sand plateau rising out of the water. Its cylinder
          collider is also the floor the cat walks on (top at y = 0). */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.7, ISLAND_R]} position={[0, -0.7, 0]} />
        <mesh position={[0, -0.7, 0]} receiveShadow>
          <cylinderGeometry args={[ISLAND_R, ISLAND_R + 1.4, 1.4, 48]} />
          <meshStandardMaterial color="#c9a97a" roughness={1} flatShading />
        </mesh>
      </RigidBody>

      {/* Rolling grass on top — the sand rim left showing becomes the beach */}
      <Terrain />

      <ShoreBarrier />

      {/* Wind-blown grass blades and meadow flowers across the open ground */}
      <Grass />

      {/* The library sections — open reading courts around the island, one
          per author, each on its own flat clearing in the meadow. */}
      {data.sections.map((s, i) => {
        const spot = SECTION_SPOTS[i]
        if (!spot) return null
        return (
          <LibrarySection
            key={s.id}
            position={[spot.x, 0, spot.z]}
            rotation={spot.rotation}
            title={s.title.en}
            seed={i * 40}
          />
        )
      })}

      {/* Stepping-stone trail between the two courts */}
      {trail.map((st, i) => (
        <mesh
          key={i}
          position={st.position}
          rotation={[0, st.ry, 0]}
          scale={[st.s, 0.05, st.s]}
          receiveShadow
        >
          <cylinderGeometry args={[1, 1.12, 1, 6]} />
          <meshStandardMaterial color="#8a8880" roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* Front garden: path from the door, nameplate, and welcoming lamps */}
      <mesh position={[0, 0.03, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 6.4]} />
        <meshStandardMaterial map={pathWood} color="#8a6a48" roughness={0.9} />
      </mesh>
      <FloorLabel position={[0, 0.07, 5.4]} />
      <LampPost position={[-1.8, 0, 6.6]} />
      <LampPost position={[1.8, 0, 6.6]} />

      {/* Fields flanking the house */}
      <Field center={[-11.5, 0, 5.5]} rotation={0.45} size={[7.5, 5.5]} crop="wheat" seed={31} />
      <Field center={[10.8, 0, -6]} rotation={-0.5} size={[6.5, 5]} crop="greens" seed={32} />

      {/* A dock reaching into the water */}
      <Dock />

      {/* Trees and shore rocks */}
      {trees.map((t) => (
        <TreeBody key={t.seed} {...t} />
      ))}
      {ROCK_SPOTS.map(([x, z, s], i) => (
        <mesh key={i} position={[x, s * 0.35 + terrainHeight(x, z), z]} scale={s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a8480" roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}
