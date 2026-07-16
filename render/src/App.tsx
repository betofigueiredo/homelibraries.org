import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { keyboardMap } from './game/controls'
import { Experience } from './game/Experience'
import { Overlay } from './components/Overlay'
import { LoadingOverlay } from './components/LoadingOverlay'
import { CatInfo } from './components/CatInfo'

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        // Start high & far; the follow camera eases it into place — a small
        // "arrival" as the loading overlay fades.
        camera={{ position: [0, 13, 25], fov: 46 }}
        style={{ position: 'fixed', inset: 0 }}
      >
        <color attach="background" args={['#c9829b']} />
        {/* Warm mauve fog matching the Sky horizon — far water melts into it */}
        <fog attach="fog" args={['#e3a48f', 30, 100]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Overlay />
      <CatInfo />
      <LoadingOverlay />
    </KeyboardControls>
  )
}
