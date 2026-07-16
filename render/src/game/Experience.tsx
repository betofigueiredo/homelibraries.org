import { useEffect } from 'react'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Physics } from '@react-three/rapier'
import { Island } from './Island'
import { Sky } from './Sky'
import { Water } from './Water'
import { Player } from './Player'
import { useGame } from './useGame'

/** Mounts only once Rapier's WASM has loaded — signals the scene is ready. */
function ReadySignal() {
  const setReady = useGame((s) => s.setReady)
  useEffect(() => setReady(), [setReady])
  return null
}

/** Scene root: sky, water, island, lighting, physics and post-processing. */
export function Experience() {
  return (
    <>
      {/* Sunset gradient dome; faint early stars overhead */}
      <Sky />
      <Stars radius={90} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4} />

      {/* Procedural environment (no downloads) — warm sun-side sheen and a
          cool lavender counter-glow. Rendered once for performance. */}
      <Environment frames={1} resolution={128} background={false}>
        <Lightformer
          intensity={0.9}
          color="#ffc38a"
          position={[-10, 5, 6]}
          scale={[10, 6, 1]}
        />
        <Lightformer
          intensity={0.5}
          color="#9a8cc8"
          position={[8, 8, -8]}
          scale={[14, 8, 1]}
        />
      </Environment>

      {/* Golden-hour lighting: low warm sun as key, lavender sky fill */}
      <hemisphereLight args={['#8a7ab0', '#4a3c2c', 0.85]} />
      <ambientLight intensity={0.45} color="#e0c8d8" />
      <directionalLight
        position={[-14, 13, 9]}
        intensity={4.2}
        color="#ffb37a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={80}
      />

      <Water />

      {/* Physics world (island, house, dock, and the player) */}
      <Physics>
        <ReadySignal />
        <Island />
        <Player />
      </Physics>

      {/* Post-processing, paodao-style: ambient occlusion to seat objects,
          bloom on the lamps, a soft cinematic depth of field kept in focus at
          the cat's constant follow distance, AgX filmic tone mapping, and
          SMAA so we can skip MSAA on the composer. */}
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={0.9} intensity={1.3} distanceFalloff={1} halfRes />
        <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.55} />
        <DepthOfField worldFocusDistance={10} worldFocusRange={24} bokehScale={3} />
        <Vignette offset={0.3} darkness={0.42} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <SMAA />
      </EffectComposer>
    </>
  )
}
