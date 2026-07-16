import { Text } from '@react-three/drei'

/**
 * Text laid flat on the ground, reading upright from the follow camera
 * (which sits at +Z looking toward -Z). Rotating -90° about X drops the
 * text face-up onto the floor with the top of the letters pointing away.
 */
export function FloorLabel({
  position,
  name = 'GORDA',
  subtitle = 'the resident cat',
}: {
  position: [number, number, number]
  name?: string
  subtitle?: string
}) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <Text
        fontSize={1.15}
        letterSpacing={0.14}
        anchorX="center"
        anchorY="middle"
        color="#f0b878"
        outlineWidth={0.02}
        outlineColor="#3a2410"
      >
        {name}
      </Text>
      <Text
        position={[0, -0.95, 0]}
        fontSize={0.36}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        color="#e9dcc6"
      >
        {subtitle}
      </Text>
    </group>
  )
}
