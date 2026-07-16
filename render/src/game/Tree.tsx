import { useMemo } from 'react'
import { makeRng } from './rng'

const TRUNK = '#5a4632'
// A few cohesive canopy greens so a grove reads as one palette.
const LEAVES = ['#3d5c34', '#4a6b3c', '#547a44', '#42663a', '#5f8a4c']

/**
 * A stylized low-poly tree: a tapered trunk topped with a cluster of faceted
 * foliage blobs. Deterministic per `seed`, so a grove stays stable across
 * renders. Origin sits at the ground; `scale` grows the whole tree.
 */
export function Tree({
  position,
  scale = 1,
  seed = 1,
}: {
  position: [number, number, number]
  scale?: number
  seed?: number
}) {
  const { trunkH, blobs, leaf } = useMemo(() => {
    const rand = makeRng(seed)
    const trunkH = 1.5 + rand() * 0.8
    const leaf = LEAVES[(rand() * LEAVES.length) | 0]
    // 4–5 overlapping blobs forming a rounded, slightly irregular canopy.
    const count = 4 + ((rand() * 2) | 0)
    const blobs = Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 1.1,
      y: trunkH + 0.3 + rand() * 1.1,
      z: (rand() - 0.5) * 1.1,
      r: 0.7 + rand() * 0.5,
      shade: LEAVES[(rand() * LEAVES.length) | 0],
    }))
    return { trunkH, blobs, leaf }
  }, [seed])

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, trunkH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.28, trunkH, 7]} />
        <meshStandardMaterial color={TRUNK} roughness={0.9} flatShading />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, trunkH + 0.4, 0]} castShadow>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.95} flatShading />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow>
          <icosahedronGeometry args={[b.r, 0]} />
          <meshStandardMaterial color={b.shade} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}
