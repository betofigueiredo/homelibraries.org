import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import * as THREE from 'three'
import { Controls } from './controls'
import { Cat } from './Cat'
import { SECTION_SPOTS } from './terrain'
import { useGame } from './useGame'
import data from '../data.json'

const SPEED = 5
const TURN_SPEED = 1.9 // rad/s — how fast the side keys orbit the camera
// Low-ish and pushed back for a near-horizontal, cinematic follow angle that
// keeps the horizon in frame.
const CAMERA_DIST = 9.2
const CAMERA_HEIGHT = 4.8
// Collider rests with its centre at (halfHeight + radius); offset the visual
// down by that so the cat's feet meet the floor.
const CAT_RADIUS = 0.28
const CAT_HALF = 0.1
const FEET_OFFSET = -(CAT_HALF + CAT_RADIUS)
// Court sensing: enter inside the flagstone circle (r = 5.4), leave a bit
// beyond it — the hysteresis stops the book panel flickering on the rim.
const COURT_ENTER_R = 5.2
const COURT_EXIT_R = 6.4

/** Rotate `current` angle toward `target` by `t`, taking the shortest path. */
function lerpAngle(current: number, target: number, t: number) {
  let diff = (target - current) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * t
}

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const facing = useRef<THREE.Group>(null)
  const motion = useRef(0) // 0 = idle, 1 = walking
  const yaw = useRef(0) // camera azimuth around the cat (0 = behind, at +Z)
  const [, getKeys] = useKeyboardControls<Controls>()

  // Reusable temporaries — avoid per-frame allocations.
  const direction = useRef(new THREE.Vector3())
  const cameraTarget = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const rb = body.current
    if (!rb) return

    const { forward, back, left, right } = getKeys()
    // TEMP debug probe (DOM is shared across extension JS worlds)
    const p = rb.translation()
    document.body.dataset.dbg = `yaw=${yaw.current.toFixed(3)} keys=${+forward}${+back}${+left}${+right} pos=${p.x.toFixed(2)},${p.z.toFixed(2)} t=${state.clock.elapsedTime.toFixed(2)}`

    // paodao-style controls: the side keys only orbit the camera around the
    // cat — she stays put. Forward/back walk along the camera's view
    // direction, and the cat turns to face the way she's going.
    yaw.current += ((left ? 1 : 0) - (right ? 1 : 0)) * TURN_SPEED * delta

    const walk = (forward ? 1 : 0) - (back ? 1 : 0)
    const moving = walk !== 0
    const dir = direction.current.set(
      -Math.sin(yaw.current) * walk,
      0,
      -Math.cos(yaw.current) * walk,
    )
    if (moving) dir.multiplyScalar(SPEED)

    // Drive horizontal velocity; let gravity own the vertical axis.
    const vel = rb.linvel()
    rb.setLinvel({ x: dir.x, y: vel.y, z: dir.z }, true)

    // Smoothly ramp the walk/idle animation blend.
    const target = moving ? 1 : 0
    motion.current += (target - motion.current) * Math.min(1, delta * 12)

    // Turn the cat to face its travel direction (visual only).
    if (moving && facing.current) {
      const heading = Math.atan2(dir.x, dir.z)
      facing.current.rotation.y = lerpAngle(
        facing.current.rotation.y,
        heading,
        Math.min(1, delta * 10),
      )
    }

    // Which reading court is the cat inside? Written to the store only on
    // change, so the DOM book panel mounts/unmounts without per-frame churn.
    const game = useGame.getState()
    let inSection: string | null = null
    for (let i = 0; i < SECTION_SPOTS.length; i++) {
      const spot = SECTION_SPOTS[i]
      const section = data.sections[i]
      if (!section) continue
      const r = game.activeSectionId === section.id ? COURT_EXIT_R : COURT_ENTER_R
      if (Math.hypot(p.x - spot.x, p.z - spot.z) < r) {
        inSection = section.id
        break
      }
    }
    if (inSection !== game.activeSectionId) game.setActiveSection(inSection)

    // Third-person follow camera, orbiting the cat at the current yaw.
    const pos = rb.translation()
    cameraTarget.current.set(
      pos.x + Math.sin(yaw.current) * CAMERA_DIST,
      pos.y + CAMERA_HEIGHT,
      pos.z + Math.cos(yaw.current) * CAMERA_DIST,
    )
    state.camera.position.lerp(cameraTarget.current, 0.1)
    lookTarget.current.set(pos.x, pos.y + 0.7, pos.z)
    state.camera.lookAt(lookTarget.current)
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      // Spawn on the garden path just outside the library door.
      position={[0, 2, 7]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      canSleep={false}
    >
      <CapsuleCollider args={[CAT_HALF, CAT_RADIUS]} />
      <group ref={facing} position={[0, FEET_OFFSET, 0]}>
        <Cat motion={motion} />
      </group>
    </RigidBody>
  )
}
