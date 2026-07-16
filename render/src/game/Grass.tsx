import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeRng } from './rng'
import { terrainHeight, SECTION_SPOTS } from './terrain'

/**
 * Wind-blown grass, paodao-style: tens of thousands of instanced blades whose
 * tips sway on a shared breeze, plus a sprinkle of tiny meadow flowers. The
 * wind lives in a vertex-shader patch on MeshStandardMaterial, so the blades
 * keep standard lighting, shadows and fog for free.
 */

const BLADE_SPACING = 0.095 // jittered-grid pitch — carpet density, no holes
const FLOWER_COUNT = 340
const GRASS_R = 20.2 // stay just inside the grass disc

/* ------------------------- Where grass may grow --------------------------- */

/** Is (x, z) inside a rotated field rectangle (with margin baked in)? */
function inField(
  x: number,
  z: number,
  cx: number,
  cz: number,
  rot: number,
  halfW: number,
  halfD: number,
) {
  const dx = x - cx
  const dz = z - cz
  const lx = Math.cos(rot) * dx - Math.sin(rot) * dz
  const lz = Math.sin(rot) * dx + Math.cos(rot) * dz
  return Math.abs(lx) < halfW && Math.abs(lz) < halfD
}

/** Keep blades off the reading courts, path, nameplate and tilled fields. */
function onOpenGrass(x: number, z: number) {
  if (Math.hypot(x, z) > GRASS_R) return false
  for (const s of SECTION_SPOTS) {
    if (Math.hypot(x - s.x, z - s.z) < 5.7) return false // court + margin
  }
  if (Math.abs(x) < 1.5 && z > 3.8 && z < 10.6) return false // garden path
  if (Math.abs(x) < 3.9 && z > 4.2 && z < 6.8) return false // GORDA nameplate
  if (inField(x, z, -11.5, 5.5, 0.45, 4.15, 3.15)) return false
  if (inField(x, z, 10.8, -6, -0.5, 3.65, 2.9)) return false
  return true
}

/** Sample `count` uniform positions on the island's open grass. */
function scatter(count: number, seed: number) {
  const rand = makeRng(seed)
  const out: [number, number][] = []
  while (out.length < count) {
    const r = Math.sqrt(rand()) * GRASS_R
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (onOpenGrass(x, z)) out.push([x, z])
  }
  return out
}

/** One blade per jittered grid cell — even, carpet-like coverage with no
 *  clumps or bare patches the way pure random scatter produces. */
function carpet(spacing: number, seed: number) {
  const rand = makeRng(seed)
  const out: [number, number][] = []
  for (let gx = -GRASS_R; gx <= GRASS_R; gx += spacing) {
    for (let gz = -GRASS_R; gz <= GRASS_R; gz += spacing) {
      const x = gx + (rand() - 0.5) * spacing
      const z = gz + (rand() - 0.5) * spacing
      if (onOpenGrass(x, z)) out.push([x, z])
    }
  }
  return out
}

/* ------------------------------ The blades -------------------------------- */

/** A single tapered blade, origin at the base, normals up so it shades like
 *  the ground beneath it instead of flashing dark backsides. */
function bladeGeometry() {
  const H = 0.26
  const g = new THREE.PlaneGeometry(0.05, H, 1, 3)
  g.translate(0, H / 2, 0)
  const pos = g.attributes.position
  const nrm = g.attributes.normal
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) * (1 - (pos.getY(i) / H) * 0.85))
    nrm.setXYZ(i, 0, 1, 0)
  }
  return g
}

const windVertexPatch = /* glsl */ `
  vec2 bladeXZ = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
  float hgt = uv.y * uv.y; // bend grows toward the tip
  float gust = 0.6 + 0.4 * sin(uTime * 0.6 + bladeXZ.x * 0.06 + bladeXZ.y * 0.05);
  float sway = sin(uTime * 1.9 + bladeXZ.x * 0.35 + bladeXZ.y * 0.27) * 0.6
             + sin(uTime * 3.2 + bladeXZ.x * 0.53 + bladeXZ.y * 0.41) * 0.25;
  vBlade = uv.y;
  vTint = fract(sin(dot(bladeXZ, vec2(127.1, 311.7))) * 43758.5453);
  vec4 ipos = instanceMatrix * vec4(transformed, 1.0);
  ipos.x += uWindDir.x * sway * gust * hgt * 0.18;
  ipos.z += uWindDir.y * sway * gust * hgt * 0.18;
  vec4 mvPosition = modelViewMatrix * ipos;
  gl_Position = projectionMatrix * mvPosition;
`

const gradientFragmentPatch = /* glsl */ `
  #include <color_fragment>
  vec3 tip = diffuseColor.rgb * 1.5 + vec3(0.05, 0.04, 0.0);
  diffuseColor.rgb = mix(diffuseColor.rgb * 0.5, tip, vBlade);
  diffuseColor.rgb *= 0.85 + vTint * 0.3;
`

function buildBlades(time: { value: number }) {
  const geometry = bladeGeometry()
  const material = new THREE.MeshStandardMaterial({
    color: '#66884a',
    roughness: 1,
    side: THREE.DoubleSide,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time
    shader.uniforms.uWindDir = { value: new THREE.Vector2(0.82, 0.44) }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uTime;\nuniform vec2 uWindDir;\nvarying float vBlade;\nvarying float vTint;',
      )
      .replace('#include <project_vertex>', windVertexPatch)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vBlade;\nvarying float vTint;',
      )
      .replace('#include <color_fragment>', gradientFragmentPatch)
  }

  const spots = carpet(BLADE_SPACING, 88)
  const mesh = new THREE.InstancedMesh(geometry, material, spots.length)
  const rand = makeRng(55)
  const dummy = new THREE.Object3D()
  spots.forEach(([x, z], i) => {
    dummy.position.set(x, terrainHeight(x, z), z)
    dummy.rotation.y = rand() * Math.PI
    dummy.scale.set(0.8 + rand() * 0.5, 0.75 + rand() * 0.55, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })
  mesh.receiveShadow = true
  // One mesh spans the island; its geometry bounds would cull it wrongly.
  mesh.frustumCulled = false
  return mesh
}

/* ------------------------------ The flowers ------------------------------- */

function buildFlowers() {
  const geometry = new THREE.IcosahedronGeometry(0.045, 0)
  const material = new THREE.MeshStandardMaterial({ roughness: 0.9 })
  const mesh = new THREE.InstancedMesh(geometry, material, FLOWER_COUNT)
  const rand = makeRng(77)
  const dummy = new THREE.Object3D()
  const white = new THREE.Color('#eeeadb')
  const gold = new THREE.Color('#e8c76a')
  scatter(FLOWER_COUNT, 99).forEach(([x, z], i) => {
    dummy.position.set(x, terrainHeight(x, z) + 0.05, z)
    dummy.scale.setScalar(0.7 + rand() * 0.6)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
    mesh.setColorAt(i, rand() < 0.85 ? white : gold)
  })
  mesh.frustumCulled = false
  return mesh
}

/* --------------------------------------------------------------------------- */

export function Grass() {
  const time = useMemo(() => ({ value: 0 }), [])
  const blades = useMemo(() => buildBlades(time), [time])
  const flowers = useMemo(() => buildFlowers(), [])

  useFrame((state) => {
    time.value = state.clock.elapsedTime
  })

  return (
    <>
      <primitive object={blades} />
      <primitive object={flowers} />
    </>
  )
}
