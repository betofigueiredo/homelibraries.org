import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * A sunset gradient dome — warm peach at the horizon melting through dusty
 * rose into a deep indigo zenith. Rendered on the inside of a big sphere so
 * the horizon glow wraps the whole island; fog is tuned to the same palette
 * so distant water dissolves into it.
 */

// Authored bright: AgX tone mapping at the end of the post chain compresses
// these back down to a soft sunset.
const HORIZON = new THREE.Color('#ffd9a0').multiplyScalar(1.9)
const MID = new THREE.Color('#c9829b').multiplyScalar(1.7)
const ZENITH = new THREE.Color('#3c3a6e').multiplyScalar(1.35)

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vWorld;
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uZenith;
  void main() {
    float h = normalize(vWorld).y;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.32, h));
    col = mix(col, uZenith, smoothstep(0.22, 0.75, h));
    // Below the horizon (only visible past the water plane) keep the glow.
    col = mix(uHorizon, col, smoothstep(-0.12, 0.0, h));
    gl_FragColor = vec4(col, 1.0);
  }
`

export function Sky() {
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: HORIZON },
      uMid: { value: MID },
      uZenith: { value: ZENITH },
    }),
    [],
  )
  return (
    <mesh>
      <sphereGeometry args={[160, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
