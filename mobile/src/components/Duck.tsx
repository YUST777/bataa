import { useEffect } from 'react'
import { RuntimeLoader, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import riveWasm from '@rive-app/canvas/rive.wasm?url'

// Serve the Rive runtime from the app bundle, not a CDN, so the duck works offline in the APK.
RuntimeLoader.setWasmUrl(riveWasm)

/** What the duck is doing, driven by app events. */
export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'happy' | 'oops'

const STATE_MACHINE = 'Duck'
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Bataa the duck, rigged in Rive from mobile/design/mascot/duck.svg (see build_duck_scene.py there).
 * The state machine idles on its own: it breathes, blinks and sways. A mood change fires one reaction.
 */
export function Duck({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const { rive, RiveComponent } = useRive({ src: '/mascot/duck.riv', stateMachines: STATE_MACHINE, autoplay: !reducedMotion })
  const wave = useStateMachineInput(rive, STATE_MACHINE, 'wave')
  const talk = useStateMachineInput(rive, STATE_MACHINE, 'talk')
  const happy = useStateMachineInput(rive, STATE_MACHINE, 'happy')
  const oops = useStateMachineInput(rive, STATE_MACHINE, 'oops')
  const thinking = useStateMachineInput(rive, STATE_MACHINE, 'thinking')

  useEffect(() => {
    if (reducedMotion) return
    if (thinking) thinking.value = mood === 'think'
    ;({ wave, talk, happy, oops })[mood as 'wave']?.fire()
    // Inputs appear once the file has loaded, so this also plays the first mood.
  }, [mood, wave, talk, happy, oops, thinking])

  // `size` is roughly the duck's own width. The 400x450 artboard is wider and taller than the duck:
  // side room for the wing, top room for the hop.
  const width = size * 1.3
  return (
    <div role="img" aria-label="Bataa" className={`pointer-events-none shrink-0 ${className}`} style={{ width, height: width * 1.125 }}>
      <RiveComponent />
    </div>
  )
}
