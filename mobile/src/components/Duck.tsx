import { useEffect, useRef } from 'react'
import { RuntimeLoader, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import riveWasm from '@rive-app/canvas/rive.wasm?url'

// Serve the Rive runtime from the app bundle, not a CDN, so the duck works offline in the APK.
RuntimeLoader.setWasmUrl(riveWasm)

/** What the duck is doing, driven by app events. */
export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'happy' | 'oops'

const SM = 'Duck'
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (n: number) => Math.max(-100, Math.min(100, n))

/**
 * Bataa the duck, rigged in Rive from mobile/design/mascot/duck.svg (see build_duck_scene.py there).
 *
 * The state machine runs six layers at once: Body, Blink, Face, Mouth, LookX and LookY. So the duck
 * breathes and blinks on its own, its eyes follow the pointer, and a mood adds a reaction on top.
 * Inputs: isCorrect / isWrong / wave (triggers), isThinking / isSpeaking (bools),
 * mouthShape (0 rest, 1-5 visemes, for lip sync once there is audio), lookX / lookY (-100..100).
 */
export function Duck({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const { rive, RiveComponent } = useRive({ src: '/mascot/duck.riv', stateMachines: SM, autoplay: !reducedMotion })
  const isCorrect = useStateMachineInput(rive, SM, 'isCorrect')
  const isWrong = useStateMachineInput(rive, SM, 'isWrong')
  const wave = useStateMachineInput(rive, SM, 'wave')
  const isThinking = useStateMachineInput(rive, SM, 'isThinking')
  const isSpeaking = useStateMachineInput(rive, SM, 'isSpeaking')
  const lookX = useStateMachineInput(rive, SM, 'lookX')
  const lookY = useStateMachineInput(rive, SM, 'lookY')

  useEffect(() => {
    if (reducedMotion || !isThinking || !isSpeaking) return
    isThinking.value = mood === 'think'
    isSpeaking.value = mood === 'talk'
    if (mood === 'happy') isCorrect?.fire()
    if (mood === 'oops') isWrong?.fire()
    if (mood === 'wave') wave?.fire()
    // No audio yet, so "talk" is a short burst of stand-in speech, not an endless loop.
    const stop = mood === 'talk' ? window.setTimeout(() => (isSpeaking.value = false), 1700) : undefined
    return () => clearTimeout(stop)
  }, [mood, isCorrect, isWrong, wave, isThinking, isSpeaking])

  // Gaze: the eyes follow the pointer or the last touch. While thinking they look up and away instead.
  useEffect(() => {
    if (reducedMotion || !lookX || !lookY) return
    if (mood === 'think') {
      lookX.value = 45
      lookY.value = -85
      return
    }
    const follow = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      // The duck's face sits in the upper part of its box. Full deflection at about 220px away.
      lookX.value = clamp(((e.clientX - (r.left + r.width / 2)) / 220) * 100)
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

  // `size` is roughly the duck's own width. The 400x450 artboard is wider and taller than the duck:
  // side room for the wing, top room for the hop.
  const width = size * 1.3
  return (
    <div ref={box} role="img" aria-label="Bataa" className={`pointer-events-none shrink-0 ${className}`} style={{ width, height: width * 1.125 }}>
      <RiveComponent />
    </div>
  )
}
