import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stylized water surrounding the island: an indigo sheet that gently swells,
 * glitters with drifting sunset sparkles, and laps the shore with soft foam
 * rings. Fog chunks are included so the far water melts into the horizon.
 */

// Authored bright — AgX at the end of the post chain compresses them back.
const DEEP = new THREE.Color('#39468c').multiplyScalar(1.4)
const SHALLOW = new THREE.Color('#6577b8').multiplyScalar(1.4)
const SPARKLE = new THREE.Color('#ffe3b8').multiplyScalar(2.4)
const FOAM = new THREE.Color('#cfd6ef').multiplyScalar(1.5)
// Far water melts into this — the low sun glowing off the sea at the horizon.
const GLOW = new THREE.Color('#ffb98f').multiplyScalar(1.6)

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTime;
  varying vec2 vWorldXZ;

  void main() {
    vec3 transformed = position;
    vec4 world = modelMatrix * vec4(transformed, 1.0);
    // Gentle crossing swells, displacing world-up (local z: plane is rotated flat).
    float swell = sin(world.x * 0.28 + uTime * 0.9) * 0.09
                + sin(world.z * 0.41 - uTime * 0.6) * 0.07;
    transformed.z += swell;
    vWorldXZ = world.xz;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSparkle;
  uniform vec3 uFoam;
  uniform vec3 uGlow;
  varying vec2 vWorldXZ;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float d = length(vWorldXZ);

    // Lighter, warmer water near the shore.
    vec3 col = mix(uShallow, uDeep, smoothstep(23.0, 44.0, d));

    // Broad slow bands so the surface never reads as flat.
    float band = sin(vWorldXZ.x * 0.16 + vWorldXZ.y * 0.11 + uTime * 0.35);
    col += band * 0.02;

    // Drifting glitter — sparse cells that flicker like low-sun glints.
    // Faded out with distance, where the cells alias into white noise.
    vec2 gp = vWorldXZ * 2.1 + vec2(uTime * 0.35, uTime * 0.22);
    float cell = hash(floor(gp));
    float glint = step(0.978, cell) * (0.5 + 0.5 * sin(uTime * 2.6 + cell * 91.0));
    col = mix(col, uSparkle, glint * 0.85 * smoothstep(105.0, 45.0, d));

    // The sunset glow spreading over the far water.
    col = mix(col, uGlow, smoothstep(55.0, 135.0, d));

    // Foam rings lapping the island shore.
    float shore = smoothstep(26.5, 23.2, d);
    float ripple = 0.5 + 0.5 * sin(d * 2.2 - uTime * 1.4);
    col = mix(col, uFoam, shore * ripple * 0.55);

    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`

export function Water() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: { value: 0 },
          uDeep: { value: DEEP },
          uShallow: { value: SHALLOW },
          uSparkle: { value: SPARKLE },
          uFoam: { value: FOAM },
          uGlow: { value: GLOW },
        },
      ]),
    [],
  )

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    // A ring: the island hides the hole, the outer radius stays inside the
    // Sky dome (160), and the radial segments give the swells vertices to move.
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
      <ringGeometry args={[16, 150, 96, 24]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        fog
      />
    </mesh>
  )
}
