import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A black cat, papercraft-style like the paodao explorer, with chibi
// proportions: an oversized faceted head on a stubby body, huge glossy eyes
// with catch-light dots, pink blush cheeks and big pink-lined ears. The
// catch-lights glow faintly so she reads at dusk.
const FUR = '#26262c'
const FUR_LIGHT = '#8d8d96' // chest / paw tips / tail tip
const EAR_INNER = '#e0506e'
const EYE = '#111116'
const BLUSH = '#f28bab'
const NOSE = '#d96b8a'

/** Hip positions: [x, z]. Front pair at +z (nose side), back pair at -z. */
const LEGS: [number, number][] = [
  [-0.13, 0.2], // front-left
  [0.13, 0.2], // front-right
  [-0.13, -0.22], // back-left
  [0.13, -0.22], // back-right
]

/**
 * A stylized low-poly cat built from faceted primitives, animated
 * procedurally. `motion` is a live 0..1 ref (0 = idle, 1 = walking) driven by
 * the Player. The cat faces +Z in local space.
 */
export function Cat({ motion }: { motion: RefObject<number> }) {
  const body = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const m = motion.current // 0..1
    const idle = 1 - m

    // Trotting gait: diagonal pairs move together (FL+BR, FR+BL).
    const stride = t * 11
    const amp = 0.6 * m
    const phase = [0, Math.PI, Math.PI, 0] // FL, FR, BL, BR
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legs.current[i]
      if (leg) leg.rotation.x = Math.sin(stride + phase[i]) * amp
    }

    // Body bob + gentle idle breathing.
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(stride)) * 0.05 * m
      const breathe = 1 + Math.sin(t * 2.5) * 0.03 * idle
      body.current.scale.y = breathe
    }

    // Head: bob while walking, curious little tilt when idle.
    if (head.current) {
      head.current.rotation.x = Math.sin(stride) * 0.06 * m
      head.current.rotation.z = Math.sin(t * 0.8) * 0.08 * idle
    }

    // Tail: lively sway while walking, slow flick when idle.
    if (tail.current) {
      const speed = m > 0.1 ? 9 : 2.5
      tail.current.rotation.z = Math.sin(t * speed) * (0.35 + 0.15 * m)
      tail.current.rotation.x = -0.7 + Math.sin(t * speed * 0.5) * 0.1
    }
  })

  return (
    <group>
      {/* Everything that bobs sits under `body` */}
      <group ref={body}>
        {/* Torso — small and stubby so the head dominates. Detail 0 keeps
            the facets big and flat, like folded paper. */}
        <mesh castShadow position={[0, 0.27, -0.06]} scale={[0.95, 0.85, 1.15]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
        </mesh>
        {/* Chest patch */}
        <mesh castShadow position={[0, 0.23, 0.14]} scale={[0.6, 0.55, 0.55]}>
          <icosahedronGeometry args={[0.23, 0]} />
          <meshStandardMaterial color={FUR_LIGHT} roughness={0.65} flatShading />
        </mesh>

        {/* Head group (front, +z) — oversized, wider than the body, sitting
            low so she reads as a kitten */}
        <group ref={head} position={[0, 0.62, 0.26]}>
          {/* Chunky faceted gem of a head — wide and flat-faced. The X tilt
              (atan(1/φ²) ≈ 0.365) aligns a face center with +z so a flat
              facet, not a corner, points forward. */}
          <mesh castShadow rotation={[0.365, 0, 0]} scale={[1.18, 0.92, 0.85]}>
            <icosahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
          </mesh>
          {/* Tiny pink nose on the flat face */}
          <mesh position={[0, -0.07, 0.315]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.032, 0.04, 4]} />
            <meshStandardMaterial color={NOSE} roughness={0.5} flatShading />
          </mesh>
          {/* Huge glossy eyes — near-black, slightly flattened onto the face */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.145, 0.03, 0.28]}>
              <mesh scale={[1, 1.15, 0.5]}>
                <icosahedronGeometry args={[0.075, 1]} />
                <meshStandardMaterial color={EYE} roughness={0.15} flatShading />
              </mesh>
              {/* Catch-light — glows faintly so she reads at dusk */}
              <mesh position={[-0.022, 0.028, 0.038]}>
                <icosahedronGeometry args={[0.02, 0]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#cfe8c0"
                  emissiveIntensity={0.7}
                  roughness={0.2}
                  flatShading
                />
              </mesh>
            </group>
          ))}
          {/* Blush cheeks */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.22, -0.08, 0.235]} scale={[1, 0.75, 0.4]}>
              <icosahedronGeometry args={[0.05, 0]} />
              <meshStandardMaterial color={BLUSH} roughness={0.7} flatShading />
            </mesh>
          ))}
          {/* Ears — big wide-set triangles with bold pink inners */}
          <mesh castShadow position={[-0.2, 0.34, -0.02]} rotation={[0, 0.4, -0.3]}>
            <coneGeometry args={[0.17, 0.27, 4]} />
            <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
          </mesh>
          <mesh castShadow position={[0.2, 0.34, -0.02]} rotation={[0, -0.4, 0.3]}>
            <coneGeometry args={[0.17, 0.27, 4]} />
            <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
          </mesh>
          <mesh position={[-0.195, 0.31, 0.01]} rotation={[0, 0.4, -0.3]}>
            <coneGeometry args={[0.1, 0.17, 4]} />
            <meshStandardMaterial color={EAR_INNER} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0.195, 0.31, 0.01]} rotation={[0, -0.4, 0.3]}>
            <coneGeometry args={[0.1, 0.17, 4]} />
            <meshStandardMaterial color={EAR_INNER} roughness={0.7} flatShading />
          </mesh>
        </group>
      </group>

      {/* Tail — slim, carried high, curling off to one side like the
          papercraft kittens. Pivots at the base, behind the body. */}
      <group ref={tail} position={[0, 0.34, -0.36]}>
        <mesh castShadow position={[0, 0.11, -0.03]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.24, 4]} />
          <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
        </mesh>
        <mesh castShadow position={[0.03, 0.26, 0.0]} rotation={[-0.35, 0, -0.35]}>
          <cylinderGeometry args={[0.048, 0.058, 0.16, 4]} />
          <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
        </mesh>
        {/* Rounded tip — curled off to one side, in a quiet mid-gray, so it
            never reads as a horn between the ears when seen from the front */}
        <mesh castShadow position={[0.08, 0.33, 0.02]} scale={[1, 1.1, 1]}>
          <icosahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#55555f" roughness={0.6} flatShading />
        </mesh>
      </group>

      {/* Legs — extra short and stubby, each pivoting at the hip. */}
      {LEGS.map(([x, z], i) => (
        <group
          key={i}
          ref={(el) => {
            legs.current[i] = el
          }}
          position={[x, 0.16, z]}
        >
          <mesh castShadow position={[0, -0.07, 0]} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.06, 0.052, 0.15, 4]} />
            <meshStandardMaterial color={FUR} roughness={0.55} flatShading />
          </mesh>
          {/* Paw tip */}
          <mesh castShadow position={[0, -0.135, 0.015]} scale={[1, 0.6, 1.15]}>
            <icosahedronGeometry args={[0.055, 0]} />
            <meshStandardMaterial color={FUR_LIGHT} roughness={0.65} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
