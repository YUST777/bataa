import { useEffect, useRef, type CSSProperties } from 'react'

export interface Badge3DProps {
  /** Filename (without .webp) inside public/badges/. */
  id: string
  /** Metallic edge finish matching the badge's bezel. */
  rim?: 'gold' | 'silver'
  /** Stage size in CSS pixels. */
  size?: number
}

const DEPTH = 0.11 // medal thickness relative to its diameter
const LAYERS = 16
const REST_Y = (-15 * Math.PI) / 180
const REST_X = (7 * Math.PI) / 180

const RIM_PALETTES = {
  gold: ['#754A12', '#9A651D', '#C58F34'],
  silver: ['#586375', '#7B879B', '#B0BCCF'],
} as const

function rimColor(rim: 'gold' | 'silver', layerIndex: number): string {
  const [dark, mid, bright] = RIM_PALETTES[rim]
  const distFromCenter = Math.abs(layerIndex / LAYERS - 0.5) * 2 // 0 at center, 1 at faces
  if (distFromCenter < 0.25) return bright
  if (distFromCenter < 0.65) return mid
  return dark
}

/**
 * Renders one of Bataa's mobile badges as a thick CSS 3D medal (adapted from
 * mobile/src/components/BadgeModel.tsx's ImageMedal): front & back faces with
 * stacked masked metallic rim slices along translateZ, a compositor-animated
 * specular sweep on card hover/focus, and optional drag-to-spin.
 */
export function Badge3D({ id, rim = 'gold', size = 76 }: Badge3DProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<HTMLDivElement>(null)
  const blockClickRef = useRef(false)

  useEffect(() => {
    const stage = stageRef.current
    const rotor = rotorRef.current
    if (!stage || !rotor) return

    let dragging = false
    let moved = false
    let startX = 0
    let lastX = 0
    let lastT = 0
    let y = REST_Y
    let x = REST_X
    let vel = 0
    let raf = 0

    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const applyTransform = () => {
      rotor.style.transform = `rotateX(${x}rad) rotateY(${y}rad)`
    }

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      blockClickRef.current = false
      dragging = true
      moved = false
      startX = e.clientX
      lastX = e.clientX
      lastT = e.timeStamp
      vel = 0
      stopLoop()
    }

    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      if (!moved && Math.abs(e.clientX - startX) > 4) {
        moved = true
        blockClickRef.current = true
        stage.classList.add('is-dragging')
        rotor.classList.add('is-manual')
        stage.setPointerCapture(e.pointerId)
      }
      if (!moved) return
      y += dx * 0.022
      const dtSec = Math.max(0.008, (e.timeStamp - lastT) / 1000)
      vel = (dx * 0.022) / dtSec
      const rect = stage.getBoundingClientRect()
      x = -((e.clientY - rect.top) / rect.height - 0.5) * 0.55
      lastX = e.clientX
      lastT = e.timeStamp
      applyTransform()
    }

    const up = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      stage.classList.remove('is-dragging')
      if (stage.hasPointerCapture(e.pointerId)) {
        stage.releasePointerCapture(e.pointerId)
      }
      if (!moved) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        y = REST_Y
        x = REST_X
        rotor.style.transform = ''
        rotor.classList.remove('is-manual')
        return
      }

      // Snap target to the nearest full revolution of REST_Y so the medal settles smoothly.
      let targetY = REST_Y
      let prev = performance.now()
      let coasting = true

      const settle = (now: number) => {
        const dt = Math.min(0.05, (now - prev) / 1000)
        prev = now
        if (coasting) {
          y += vel * dt
          vel *= Math.pow(0.08, dt)
          x += (REST_X - x) * Math.min(1, dt * 6)
          if (Math.abs(vel) < 0.9) {
            coasting = false
            const turns = Math.round((y - REST_Y) / (2 * Math.PI))
            targetY = REST_Y + turns * 2 * Math.PI
          }
        } else {
          y += (targetY - y) * Math.min(1, dt * 7)
          x += (REST_X - x) * Math.min(1, dt * 7)
          if (Math.abs(targetY - y) < 0.005 && Math.abs(REST_X - x) < 0.005) {
            y = REST_Y
            x = REST_X
            rotor.style.transform = ''
            rotor.classList.remove('is-manual')
            raf = 0
            return
          }
        }
        applyTransform()
        raf = requestAnimationFrame(settle)
      }
      raf = requestAnimationFrame(settle)
    }

    const suppressClickAfterDrag = (e: MouseEvent) => {
      if (!blockClickRef.current) return
      e.preventDefault()
      e.stopPropagation()
      blockClickRef.current = false
    }

    stage.addEventListener('pointerdown', down)
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerup', up)
    stage.addEventListener('pointercancel', up)
    stage.addEventListener('click', suppressClickAfterDrag)

    return () => {
      stopLoop()
      stage.removeEventListener('pointerdown', down)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerup', up)
      stage.removeEventListener('pointercancel', up)
      stage.removeEventListener('click', suppressClickAfterDrag)
    }
  }, [])

  const src = `/badges/${id}.webp`
  const art = Math.round(size * 0.92)
  const depth = art * DEPTH
  const maskStyle: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }

  return (
    <div className="bataa-badge3d-wrap" style={{ width: size, height: size }}>
      <div className="bataa-badge3d-shadow" aria-hidden="true" />
      <div
        ref={stageRef}
        className="bataa-badge3d-stage"
        style={{ width: size, height: size, perspective: `${size * 4}px` }}
      >
        <div
          ref={rotorRef}
          className="bataa-badge3d-rotor"
          style={{ width: art, height: art }}
        >
          {Array.from({ length: LAYERS + 1 }, (_, i) => {
            const z = depth / 2 - (i / LAYERS) * depth
            if (i === 0 || i === LAYERS) {
              return (
                <img
                  key={i}
                  src={src}
                  alt=""
                  width={art}
                  height={art}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="bataa-badge3d-face"
                  style={{
                    transform: `translateZ(${z.toFixed(2)}px)${i === LAYERS ? ' rotateY(180deg)' : ''}`,
                  }}
                />
              )
            }
            return (
              <div
                key={i}
                aria-hidden="true"
                className="bataa-badge3d-rim"
                style={{
                  ...maskStyle,
                  transform: `translateZ(${z.toFixed(2)}px) scale(0.985)`,
                  backgroundColor: rimColor(rim, i),
                }}
              />
            )
          })}
          <div
            aria-hidden="true"
            className="bataa-badge3d-shine"
            style={{
              ...maskStyle,
              transform: `translateZ(${(depth / 2 + 0.6).toFixed(2)}px)`,
            }}
          >
            <div className="bataa-badge3d-shine-bar" />
          </div>
        </div>
      </div>
    </div>
  )
}
