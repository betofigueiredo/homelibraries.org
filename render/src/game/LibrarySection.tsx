import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Instance, Instances } from '@react-three/drei'
import { Bench, ShelfBody } from './Library'
import { stoneTexture } from './textures'
import { makeRng } from './rng'

/**
 * One library "section": an open-air reading court in stone and wood. Two
 * stone walls form an L (the rest stays open to the garden), bookshelves
 * lean against them, glowing crystals light the open corners, and the
 * section's name is written on the flagstone floor with pebbles.
 */

const STONE = '#9b9890'
const WOOD = '#6b4a2e'
const CRYSTAL = '#9ff0e0'
const CRYSTAL_GLOW = '#2fc8b0'
const PEBBLES = ['#e8dcc0', '#dcccaa', '#cfc0a0', '#e2d6b8']

/* ------------------------------ Stone walls ------------------------------- */

/** A mossy stone wall capped with a wooden beam, with a collider. */
function StoneWall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  const [w, h, d] = size
  const tex = useMemo(() => stoneTexture(Math.max(w, d) / 1.6, h / 1.6), [w, h, d])
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={tex} color={STONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, h + 0.06, 0]} castShadow>
        <boxGeometry args={[w + 0.16, 0.12, d + 0.16]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
    </RigidBody>
  )
}

/** A stacked-stone pillar crowned by a glowing crystal — the section's lamp. */
function CrystalPillar({
  position,
  height = 1.5,
}: {
  position: [number, number, number]
  height?: number
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[0.3, height / 2, 0.3]} position={[0, height / 2, 0]} />
      <mesh castShadow position={[0, height * 0.27, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.24, 0.34, height * 0.54, 5]} />
        <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0, height * 0.75, 0]} rotation={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.17, 0.25, height * 0.44, 5]} />
        <meshStandardMaterial color="#8a8880" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, height + 0.24, 0]} rotation={[0, 0.6, 0]} scale={[1, 1.7, 1]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={CRYSTAL}
          emissive={CRYSTAL_GLOW}
          emissiveIntensity={2.4}
          roughness={0.25}
          toneMapped={false}
          flatShading
        />
      </mesh>
      <pointLight
        position={[0, height + 0.35, 0]}
        intensity={5}
        distance={8}
        decay={2}
        color="#7fe0d0"
      />
    </RigidBody>
  )
}

/* --------------------------- Pebble floor text ---------------------------- */

interface Pebble {
  x: number
  z: number
  s: number
  ry: number
  c: number
}

/**
 * Renders `text` to an offscreen canvas, samples the filled pixels, and turns
 * each sample into a little pebble — so any section name can be "written" in
 * stones on the ground. One instanced draw call regardless of length.
 */
function usePebbleLayout(text: string): {
  pebbles: Pebble[]
  canvasW: number
  canvasH: number
  underlay: THREE.CanvasTexture
} {
  return useMemo(() => {
    const H = 72
    const c = document.createElement('canvas')
    // A heavy sans reads far better than a serif once it's made of pebbles.
    const font = `900 54px Arial, sans-serif`
    let ctx = c.getContext('2d')!
    ctx.font = font
    c.width = Math.ceil(ctx.measureText(text).width) + 10
    c.height = H
    ctx = c.getContext('2d')! // sizing the canvas resets its state
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(text, 5, H / 2 + 2)

    const img = ctx.getImageData(0, 0, c.width, c.height).data
    const rand = makeRng(1 + text.length * 31)
    const pebbles: Pebble[] = []
    const step = 3
    for (let py = 0; py < c.height; py += step) {
      for (let px = 0; px < c.width; px += step) {
        if (img[(py * c.width + px) * 4 + 3] > 100) {
          pebbles.push({
            x: px - c.width / 2 + (rand() - 0.5) * 0.8,
            z: py - H / 2 + (rand() - 0.5) * 0.8,
            s: 0.7 + rand() * 0.55,
            ry: rand() * Math.PI,
            c: (rand() * PEBBLES.length) | 0,
          })
        }
      }
    }
    // Engraved underlay: the same text, dark and softly blurred, painted on a
    // transparent canvas. Laid under the pebbles it reads as a groove swept
    // into the flagstones and makes the strokes legible from a distance.
    const uc = document.createElement('canvas')
    uc.width = c.width * 2
    uc.height = H * 2
    const uctx = uc.getContext('2d')!
    uctx.scale(2, 2)
    uctx.font = font
    uctx.textBaseline = 'middle'
    uctx.shadowColor = 'rgba(24,20,14,0.9)'
    uctx.shadowBlur = 7
    uctx.fillStyle = '#332c20'
    uctx.fillText(text, 5, H / 2 + 2)
    const underlay = new THREE.CanvasTexture(uc)
    underlay.anisotropy = 8

    return { pebbles, canvasW: c.width, canvasH: H, underlay }
  }, [text])
}

/** The section name laid on the floor in pebbles, reading toward +Z. */
function PebbleText({
  text,
  position,
  width,
}: {
  text: string
  position: [number, number, number]
  width: number
}) {
  const { pebbles, canvasW, canvasH, underlay } = usePebbleLayout(text)
  const k = width / canvasW // canvas px → world units
  const r = k * 3 * 0.62 // pebble radius a bit under the sampling step, so letters keep gaps
  // Stretch the letters along z (like road markings) so they stay readable
  // from the follow camera's shallow angle.
  const zStretch = 1.5
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[canvasW * k, canvasH * k * zStretch]} />
        <meshStandardMaterial
          map={underlay}
          transparent
          opacity={0.6}
          depthWrite={false}
          roughness={1}
        />
      </mesh>
      <Instances castShadow receiveShadow limit={pebbles.length}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.9} flatShading />
        {pebbles.map((p, i) => (
          <Instance
            key={i}
            position={[p.x * k, r * p.s * 0.5, p.z * k * zStretch]}
            scale={r * p.s}
            rotation={[0, p.ry, 0]}
            color={PEBBLES[p.c]}
          />
        ))}
      </Instances>
    </group>
  )
}

/* ------------------------------ Magic layer ------------------------------- */

/** Warm fireflies drifting slowly around the court, pulsing softly. */
function Fireflies({ count = 10, seed = 0 }: { count?: number; seed?: number }) {
  const ref = useRef<THREE.Group>(null)
  const seeds = useMemo(() => {
    const rand = makeRng(77 + seed)
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 9,
      y: 0.7 + rand() * 1.6,
      z: (rand() - 0.5) * 7,
      sp: 0.35 + rand() * 0.6,
      ph: rand() * Math.PI * 2,
      r: 0.4 + rand() * 0.7,
    }))
  }, [count, seed])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current?.children.forEach((m, i) => {
      const s = seeds[i]
      m.position.set(
        s.x + Math.sin(t * s.sp + s.ph) * s.r,
        s.y + Math.sin(t * s.sp * 1.7 + s.ph * 2) * 0.25,
        s.z + Math.cos(t * s.sp * 0.8 + s.ph) * s.r,
      )
      const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.7 + Math.sin(t * 2.2 + s.ph * 3) * 1.3
    })
  })

  return (
    <group ref={ref}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial
            color="#ffe9a0"
            emissive="#ffd970"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** A few enchanted books circling lazily above the court. */
function FloatingBooks({ position }: { position: [number, number, number] }) {
  const ring = useRef<THREE.Group>(null)
  const colors = ['#8c3b3b', '#35566b', '#c9a24b']

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!ring.current) return
    ring.current.rotation.y = t * 0.22
    ring.current.children.forEach((b, i) => {
      b.position.y = Math.sin(t * 0.9 + i * 2.1) * 0.2
      b.rotation.z = Math.sin(t * 0.7 + i * 1.4) * 0.18
    })
  })

  return (
    <group position={position}>
      <group ref={ring}>
        {colors.map((c, i) => {
          const a = (i / colors.length) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15]} rotation={[0, -a, 0]}>
              {/* Cover */}
              <mesh castShadow rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.36, 0.055, 0.27]} />
                <meshStandardMaterial color={c} roughness={0.8} />
              </mesh>
              {/* Pages, faintly aglow */}
              <mesh rotation={[0.35, 0, 0]} position={[0, 0.032, 0]}>
                <boxGeometry args={[0.31, 0.028, 0.22]} />
                <meshStandardMaterial
                  color="#efe4cc"
                  emissive="#c9b880"
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/* ------------------------------- The court -------------------------------- */

/** Stepping stones scattered where the court opens onto the grass. */
function useSteppingStones(seed: number) {
  return useMemo(() => {
    const rand = makeRng(55 + seed)
    const out: { position: [number, number, number]; s: number; ry: number }[] = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rand() * 0.25
      const r = 5.9 + rand() * 1.3
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      // Keep the wooden entrance path (and the nameplate on it) clear.
      if (Math.abs(x) < 2 && z > 3.5) continue
      out.push({
        position: [x, 0.02, z],
        s: 0.3 + rand() * 0.38,
        ry: rand() * Math.PI,
      })
    }
    return out
  }, [seed])
}

export function LibrarySection({
  position = [0, 0, 0],
  rotation = 0,
  title,
  seed = 0,
}: {
  position?: [number, number, number]
  rotation?: number
  title: string
  seed?: number
}) {
  const floorTex = useMemo(() => stoneTexture(4.5, 4.5), [])
  const stones = useSteppingStones(seed)

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Faceted flagstone platform */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 10]} />
        <meshStandardMaterial map={floorTex} color="#8f8d86" roughness={0.95} />
      </mesh>
      {/* Stepping stones fading out into the grass */}
      {stones.map((st, i) => (
        <mesh key={i} position={st.position} rotation={[0, st.ry, 0]} scale={[st.s, 0.05, st.s]} receiveShadow>
          <cylinderGeometry args={[1, 1.12, 1, 6]} />
          <meshStandardMaterial color="#8a8880" roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* The two stone walls — an L open toward the path and the meadow */}
      <StoneWall position={[-0.2, 0, -3.7]} size={[8.4, 2.1, 0.45]} />
      <StoneWall position={[-4.2, 0, -1.2]} size={[0.45, 2.1, 5.4]} />

      {/* Glowing crystals guard the open ends of each wall */}
      <CrystalPillar position={[4.35, 0, -3.7]} height={1.6} />
      <CrystalPillar position={[-4.2, 0, 1.9]} height={1.6} />
      <CrystalPillar position={[3.7, 0, 2.8]} height={1.1} />

      {/* Shelves leaning on the walls */}
      <ShelfBody position={[-2.5, 0.04, -3.27]} seed={100 + seed} />
      <ShelfBody position={[-0.2, 0.04, -3.27]} seed={101 + seed} />
      <ShelfBody position={[2.1, 0.04, -3.27]} seed={102 + seed} />
      <ShelfBody position={[-3.77, 0.04, -1.9]} rotation={Math.PI / 2} seed={103 + seed} />
      <ShelfBody position={[-3.77, 0.04, 0.4]} rotation={Math.PI / 2} seed={104 + seed} />

      {/* A reading rug and a bench facing the back shelves */}
      <mesh position={[-0.3, 0.045, -0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.55, 12]} />
        <meshStandardMaterial color="#4a4560" roughness={1} />
      </mesh>
      <mesh position={[-0.3, 0.055, -0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.05, 12]} />
        <meshStandardMaterial color="#6a5a80" roughness={1} />
      </mesh>
      <Bench position={[-0.3, 0.04, 0.9]} rotation={Math.PI} />

      {/* The section's name, written in pebbles across the entrance */}
      <PebbleText text={title.toUpperCase()} position={[0.4, 0.03, 3.2]} width={6.6} />

      {/* The magic */}
      <Fireflies seed={seed} />
      <FloatingBooks position={[-0.3, 2.6, -1.2]} />
    </group>
  )
}
