import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/** What the duck is doing, driven by app events rather than free-running loops. */
export type Mood = 'idle' | 'wave' | 'talk' | 'think' | 'happy' | 'oops'

const FILL = '#FFFDF8'
const EDGE = '#E3D1B8'
const INK = '#2D180B'
const ORANGE = '#F58A1F'

/** Bataa the duck. Still by default: it blinks now and then, and moves once when its mood changes. */
export function Duck({ mood = 'idle', size = 96, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let open: number
    let next: number
    const schedule = () => {
      next = window.setTimeout(() => {
        setBlink(true)
        open = window.setTimeout(() => setBlink(false), 130)
        schedule()
      }, 2400 + Math.random() * 3600)
    }
    schedule()
    return () => {
      clearTimeout(next)
      clearTimeout(open)
    }
  }, [])

  const happy = mood === 'happy'
  const look = mood === 'think' ? { x: 1.6, y: -1.6 } : mood === 'oops' ? { x: 0, y: 1.6 } : { x: 0, y: 0 }
  const once = { duration: 0.75, ease: 'easeOut' } as const

  return (
    <motion.svg
      viewBox="0 0 120 122"
      width={size}
      height={size}
      role="img"
      aria-label="Bataa"
      className={`shrink-0 overflow-visible ${className}`}
      animate={{ y: happy ? [0, -12, 0, -5, 0] : 0 }}
      transition={once}
    >
      <defs>
        <radialGradient id="duck-down" cx="42%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor={FILL} />
          <stop offset="100%" stopColor="#F1E2CC" />
        </radialGradient>
        <linearGradient id="duck-bill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9D33" />
          <stop offset="100%" stopColor="#EC6A00" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="116" rx="27" ry="4" fill={INK} opacity="0.1" />
      {[49, 71].map((x) => (
        <g key={x} fill="#EC6A00">
          <rect x={x - 2.5} y="100" width="5" height="12" rx="2.5" />
          <path d={`M${x - 10} 114 q10 -8 20 0 q-4 3 -10 1 q-6 2 -10 -1z`} />
        </g>
      ))}
      <path d="M86 74 q14 -5 17 -15 q1 15 -9 24z" fill="url(#duck-down)" stroke={EDGE} strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="60" cy="81" rx="30" ry="25" fill="url(#duck-down)" stroke={EDGE} strokeWidth="1.5" />

      {/* Wings pivot at the shoulder (top of each ellipse). */}
      <motion.ellipse
        cx="36" cy="82" rx="8" ry="14" fill="#F6EADA" stroke={EDGE} strokeWidth="1.5"
        style={{ originX: 0.5, originY: 0 }}
        animate={{ rotate: happy ? [12, 95, 50, 95, 12] : 12 }}
        transition={once}
      />
      <motion.ellipse
        cx="84" cy="82" rx="8" ry="14" fill="#F6EADA" stroke={EDGE} strokeWidth="1.5"
        style={{ originX: 0.5, originY: 0 }}
        animate={{ rotate: happy ? [-12, -95, -50, -95, -12] : mood === 'wave' ? [-12, -110, -70, -110, -70, -12] : -12 }}
        transition={mood === 'wave' ? { duration: 1.2, ease: 'easeInOut', delay: 0.3 } : once}
      />

      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={{ rotate: mood === 'oops' ? 8 : mood === 'think' ? -7 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <path d="M57 21 c-1 -8 7 -11 10 -6 c-4 0 -5 3 -4 6z" fill={FILL} stroke={EDGE} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="60" cy="45" r="25" fill="url(#duck-down)" stroke={EDGE} strokeWidth="1.5" />
        <circle cx="40" cy="51" r="5" fill={ORANGE} opacity="0.2" />
        <circle cx="80" cy="51" r="5" fill={ORANGE} opacity="0.2" />

        {happy ? (
          <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round">
            <path d="M44 43 q5 -6 10 0" />
            <path d="M66 43 q5 -6 10 0" />
          </g>
        ) : (
          <motion.g animate={look} transition={{ duration: 0.25 }}>
            {[49, 71].map((cx) => (
              <motion.g key={cx} animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.07 }}>
                <ellipse cx={cx} cy="42" rx="4" ry="5.2" fill={INK} />
                <circle cx={cx - 1.3} cy="40" r="1.5" fill="#fff" />
              </motion.g>
            ))}
          </motion.g>
        )}

        <motion.g
          style={{ originX: 0.5, originY: 0 }}
          animate={{ scaleY: mood === 'talk' ? [1, 1.35, 1, 1.3, 1, 1.2, 1] : 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
        >
          <ellipse cx="60" cy="55" rx="14" ry="6.5" fill="url(#duck-bill)" />
          <path d={mood === 'oops' ? 'M51 57 q9 -3 18 0' : 'M51 55 q9 4.5 18 0'} fill="none" stroke="#A84300" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </motion.svg>
  )
}
