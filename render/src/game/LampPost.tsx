/**
 * A cast-iron garden lamp post: a slender post topped with a glowing lantern
 * (bloom picks up the emissive glass) and a warm point light for a cosy pool.
 */
export function LampPost({
  position,
  height = 2.8,
}: {
  position: [number, number, number]
  height?: number
}) {
  const [x, y, z] = position
  const top = y + height
  return (
    <group>
      {/* Base */}
      <mesh position={[x, y + 0.1, z]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.2, 10]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Post */}
      <mesh position={[x, y + height / 2, z]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, height, 8]} />
        <meshStandardMaterial color="#26221e" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Lantern cap */}
      <mesh position={[x, top + 0.16, z]} castShadow>
        <coneGeometry args={[0.22, 0.24, 6]} />
        <meshStandardMaterial color="#1c1a18" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Glowing glass */}
      <mesh position={[x, top, z]}>
        <boxGeometry args={[0.24, 0.3, 0.24]} />
        <meshStandardMaterial
          color="#ffe6b0"
          emissive="#ffb85c"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[x, top, z]}
        intensity={9}
        distance={12}
        decay={2}
        color="#ffcf9e"
        castShadow={false}
      />
    </group>
  )
}
