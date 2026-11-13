import { useEffect, useRef } from 'react'
import { Fit, Layout, RuntimeLoader, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import riveWasm from '@rive-app/canvas/rive.wasm?url'
import type { Mood } from './Duck'

// Serve the Rive runtime from the app bundle, not a CDN, so the duck works offline in the APK.
RuntimeLoader.setWasmUrl(riveWasm)
// Start the engine as soon as this module loads (it is prefetched while the app is idle), not when the first duck appears.
RuntimeLoader.awaitInstance().catch(() => {})

const SM = 'Duck'
const layout = new Layout({ fit: Fit.Contain })
const clamp = (n: number) => Math.max(-100, Math.min(100, n))

/**
 * Bataa the duck, a Rive rig built from the parts sheet in design/mascot/rig (see build_rig.py there).
 *
 * The state machine runs layers at once: Body, Face, Mouth, LookX and LookY. So the duck breathes and
 * blinks on its own, its eyes follow the pointer, and a mood adds a reaction on top.
 * Inputs: isCorrect / isWrong / wave / dance / hello / nod (triggers),
 * isThinking / isSpeaking / isCurious / isPointing (bools),
 * mouthShape (0 rest, 1-5 visemes, for lip sync once there is audio), lookX / lookY (-100..100).
 */
export function DuckRig({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const { rive, RiveComponent } = useRive({ src: '/mascot/duck.riv', stateMachines: SM, autoplay: true, layout })
  const isCorrect = useStateMachineInput(rive, SM, 'isCorrect')
  const isWrong = useStateMachineInput(rive, SM, 'isWrong')
  const wave = useStateMachineInput(rive, SM, 'wave')
  const dance = useStateMachineInput(rive, SM, 'dance')
  const hello = useStateMachineInput(rive, SM, 'hello')
  const nod = useStateMachineInput(rive, SM, 'nod')
  const isCurious = useStateMachineInput(rive, SM, 'isCurious')
  const isPointing = useStateMachineInput(rive, SM, 'isPointing')
  const isThinking = useStateMachineInput(rive, SM, 'isThinking')
  const isSpeaking = useStateMachineInput(rive, SM, 'isSpeaking')
  const lookX = useStateMachineInput(rive, SM, 'lookX')
  const lookY = useStateMachineInput(rive, SM, 'lookY')

  useEffect(() => {
    if (!isThinking || !isSpeaking || !isCurious || !isPointing) return
    isThinking.value = mood === 'think'
    isSpeaking.value = mood === 'talk'
    isCurious.value = mood === 'curious'
    isPointing.value = mood === 'point'
    if (mood === 'happy') isCorrect?.fire()
    if (mood === 'oops') isWrong?.fire()
    if (mood === 'wave') wave?.fire()
    if (mood === 'dance') dance?.fire()
    if (mood === 'hello') hello?.fire()
    if (mood === 'nod') nod?.fire()
    // No audio yet, so "talk" is a short burst of stand-in speech, not an endless loop.
    const stop = mood === 'talk' ? window.setTimeout(() => (isSpeaking.value = false), 1700) : undefined
    return () => clearTimeout(stop)
  }, [mood, isCorrect, isWrong, wave, dance, hello, nod, isThinking, isSpeaking, isCurious, isPointing])

  // Gaze: the eyes follow the pointer or the last touch. While thinking they look up and away instead;
  // while listening to a question or pointing they look down at the options under the duck.
  useEffect(() => {
    if (!lookX || !lookY) return
    const fixed = mood === 'think' ? [40, -90] : mood === 'curious' || mood === 'point' ? [25, 85] : null
    if (fixed) {
      ;[lookX.value, lookY.value] = fixed
      return
    }
    const follow = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      // The face sits in the upper-left of the box. Full deflection about 220px away.
      lookX.value = clamp(((e.clientX - (r.left + r.width * 0.4)) / 220) * 100)
      lookY.value = clamp(((e.clientY - (r.top + r.height * 0.35)) / 220) * 100)
    }
    lookX.value = 0
    lookY.value = 0
    window.addEventListener('pointermove', follow)
    window.addEventListener('pointerdown', follow)
    return () => {
      window.removeEventListener('pointermove', follow)
      window.removeEventListener('pointerdown', follow)
    }
  }, [mood, lookX, lookY])

  // `size` is roughly the duck's own width. The 480x500 artboard has room around the duck for the
  // raised wing and the hop. Until the rig loads, the egg-shaped placeholder (index.css) stands in.
  const width = size * 1.4
  return (
    <div
      ref={box}
      role="img"
      aria-label="Bataa"
      className={`pointer-events-none shrink-0 ${rive ? '' : 'duck-loading'} ${className}`}
      style={{ width, height: (width * 500) / 480 }}
    >
      <RiveComponent />
    </div>
  )
}
