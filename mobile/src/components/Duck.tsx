import { useEffect, useRef } from 'react'

/** What the duck is doing, driven by app events. */
export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'happy' | 'oops'

/**
 * Bataa the duck, animated frame by frame.
 *
 * Each animation is a strip of 8 hand-drawn-style frames (public/mascot/<name>.webp), cut from the
 * sheets in mobile/design/mascot/sheets by cut_frames.py. A clip below is the order those frames
 * play in and how long each one holds, in ms. Holds are uneven on purpose: a long hold on the
 * crouch or the top of a jump is what gives the motion weight.
 */
type Clip = { sheet: string; frames: [frame: number, ms: number][]; loopFrom?: number }

const BLINK: Clip['frames'] = [[4, 60], [5, 90], [4, 60]]
const BREATH: Clip['frames'] = [[1, 260], [2, 420], [3, 260]]
const CLIPS: Record<Mood, Clip> = {
  // Breathe, blink, breathe, glance, head tilt, double blink.
  idle: { sheet: 'idle', loopFrom: 0, frames: [[0, 420], ...BREATH, [0, 520], ...BLINK, [0, 640], ...BREATH, [6, 820], [0, 420], [7, 720], [0, 320], ...BLINK, [0, 110], ...BLINK] },
  wave: { sheet: 'wave', frames: [[0, 80], [1, 100], [2, 80], [3, 120], [4, 110], [5, 120], [4, 110], [3, 110], [4, 110], [5, 140], [6, 90], [7, 140]] },
  talk: { sheet: 'talk', frames: [[0, 70], [1, 70], [2, 120], [3, 100], [4, 110], [5, 90], [6, 110], [2, 100], [4, 100], [3, 100], [5, 90], [7, 140]] },
  // The first three frames get into the pose once; the rest loop while the duck keeps thinking.
  think: { sheet: 'think', loopFrom: 3, frames: [[0, 80], [1, 90], [2, 90], [3, 520], [4, 150], [3, 150], [4, 150], [5, 640], [6, 520], [7, 560]] },
  happy: { sheet: 'happy', frames: [[0, 60], [1, 130], [2, 70], [3, 190], [4, 90], [5, 120], [6, 280], [7, 220]] },
  oops: { sheet: 'sad', frames: [[0, 60], [1, 170], [2, 120], [3, 440], [4, 230], [5, 230], [4, 230], [3, 320], [6, 250], [7, 200]] },
}

const FRAMES = 8
const src = (sheet: string) => `/mascot/${sheet}.webp`
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fetch every strip up front so a mood change never shows an empty frame.
if (typeof window !== 'undefined') new Set(Object.values(CLIPS).map((c) => c.sheet)).forEach((sheet) => (new Image().src = src(sheet)))

export function Duck({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const el = useRef<HTMLDivElement>(null)

  // The player writes straight to the element's style: 10 frames a second should not re-render React.
  useEffect(() => {
    const node = el.current
    if (!node) return
    let timer = 0
    const show = (sheet: string, frame: number) => {
      node.style.backgroundImage = `url(${src(sheet)})`
      node.style.backgroundPosition = `${(frame / (FRAMES - 1)) * 100}% 0`
    }
    const play = (clip: Clip, index: number): void => {
      if (index >= clip.frames.length) {
        // A looping clip goes round again; a one-shot hands over to the idle loop.
        return clip.loopFrom === undefined ? play(CLIPS.idle, 0) : play(clip, clip.loopFrom)
      }
      const [frame, ms] = clip.frames[index]
      show(clip.sheet, frame)
      timer = window.setTimeout(() => play(clip, index + 1), ms)
    }
    if (reducedMotion) show(CLIPS[mood].sheet, mood === 'think' ? 3 : 0)
    else play(CLIPS[mood], 0)
    return () => clearTimeout(timer)
  }, [mood])

  // A frame is 320x400 with the duck's feet centred near the bottom. `size` is roughly the duck's width.
  const width = size * 1.3
  return (
    <div
      ref={el}
      role="img"
      aria-label="Bataa"
      className={`pointer-events-none shrink-0 bg-no-repeat ${className}`}
      style={{ width, height: width * 1.25, backgroundSize: `${FRAMES * 100}% 100%`, backgroundImage: `url(${src('idle')})` }}
    />
  )
}
