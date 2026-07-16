import type { KeyboardControlsEntry } from '@react-three/drei'

/** Named movement controls, referenced by <KeyboardControls> and the player. */
export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
} as const

export type Controls = (typeof Controls)[keyof typeof Controls]

/** WASD + arrow keys, bound to the named controls above. */
export const keyboardMap: KeyboardControlsEntry<Controls>[] = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
]
