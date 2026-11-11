import { motion } from 'framer-motion'

/** What the duck is doing, driven by app events. Each mood is one pose from the mascot sheet. */
export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'happy' | 'oops' | 'point' | 'cheer'

const MOODS: Mood[] = ['idle', 'wave', 'talk', 'think', 'happy', 'oops', 'point', 'cheer']
const src = (mood: Mood) => `/mascot/${mood}.webp`

// Fetch every pose up front so a mood change never shows an empty frame.
if (typeof window !== 'undefined') MOODS.forEach((mood) => (new Image().src = src(mood)))

/**
 * Bataa the duck. Art: mobile/design/mascot/pose-sheet-v1.png, cut into public/mascot.
 * shortcut: still poses that pop in on change; replace with a rigged Rive file for blinking and blended motion.
 */
export function Duck({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const lively = mood === 'happy' || mood === 'cheer'
  return (
    <motion.img
      key={mood}
      src={src(mood)}
      alt="Bataa"
      draggable={false}
      width={size}
      height={(size * 4) / 3}
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: (size * 4) / 3, originY: 1 }}
      initial={{ scale: 0.86, y: 0 }}
      animate={{ scale: 1, y: lively ? [0, -14, 0, -6, 0] : 0 }}
      transition={{ scale: { type: 'spring', duration: 0.45, bounce: 0.45 }, y: { duration: 0.7, ease: 'easeOut' } }}
    />
  )
}
