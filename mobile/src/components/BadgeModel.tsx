import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'motion/react'
import { sound } from '@/lib/sound'

/**
 * Badges that ship a real 3D model at public/badges/<id>.glb. Add an id here when its file lands.
 * shortcut: an explicit list, because the dev server answers missing files with index.html (200);
 * switch to a manifest file if models get added often.
 */
const GLB = new Set<string>()

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const INTRO = 1.25 // seconds
// After the light sweep crosses the face (index.css: .medal-shine ends at 1.95s) the medal does one full turn.
const TURN_AT = 2.05
const TURN = 0.95
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2

/**
 * Finger spin for a medal. It enters with an intro: it grows in with a slight overshoot while
 * spinning two full turns that slow down to face the viewer. After that a drag turns it directly;
 * on release the flick keeps going and eases back into a slow idle turn. Touching it during the
 * intro takes over at once. `apply` receives the angles (radians) and scale every frame.
 */
function useSpin(target: RefObject<HTMLElement>, apply: (y: number, x: number, scale: number) => void, ready = true) {
  const applyRef = useRef(apply)
  applyRef.current = apply

  useEffect(() => {
    const el = target.current
    if (!el || !ready) return
    const IDLE = reducedMotion ? 0 : 0.6 // radians per second
    let y = 0
    let x = 0
    let speed = IDLE
    let tilt = 0
    let dragging = false
    let lastX = 0
    let lastT = 0
    let intro = 0 // seconds into the intro
    let clock = 0 // seconds since the medal appeared
    let turnFrom: number | null = null // angle the 360 turn started from; null before it starts
    let turned = false

    const down = (e: PointerEvent) => {
      e.stopPropagation() // the sheet around it drags down to close; spinning must not start that
      intro = INTRO
      turned = true // a touch takes over from any scripted motion
      dragging = true
      lastX = e.clientX
      lastT = e.timeStamp
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      y += dx * 0.012
      speed = (dx * 0.012) / (Math.max(1, e.timeStamp - lastT) / 1000)
      const r = el.getBoundingClientRect()
      tilt = -((e.clientY - r.top) / r.height - 0.5) * 0.6
      lastX = e.clientX
      lastT = e.timeStamp
    }
    const up = () => {
      dragging = false
      tilt = 0
    }
    el.style.touchAction = 'none' // the drag spins the medal instead of scrolling
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)

    let raf = 0
    let prev = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      clock += dt
      if (!turned && !dragging && clock >= TURN_AT) {
        turnFrom ??= y
        const t = Math.min(1, (clock - TURN_AT) / TURN)
        y = turnFrom + 2 * Math.PI * easeInOutCubic(t)
        applyRef.current(y, 0, 1)
        if (t === 1) {
          turned = true
          speed = 0 // the idle turn picks up gently again
        }
        raf = requestAnimationFrame(frame)
        return
      }
      if (intro < INTRO) {
        intro = Math.min(INTRO, intro + dt)
        const t = intro / INTRO
        // Reduced motion gets a gentle grow-in with no spin: big rotations are what trouble people.
        y = reducedMotion ? 0 : -4 * Math.PI * (1 - easeOutCubic(t))
        applyRef.current(y, 0, reducedMotion ? 0.7 + 0.3 * easeOutCubic(t) : 0.25 + 0.75 * easeOutBack(t))
        speed = 0 // the idle turn picks up gently after the intro lands
        raf = requestAnimationFrame(frame)
        return
      }
      if (!dragging) {
        speed += (IDLE - speed) * Math.min(1, dt * 1.2)
        y += speed * dt
      }
      x += (tilt - x) * Math.min(1, dt * 8)
      applyRef.current(y, x, 1)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [target, ready])
}

const DEPTH = 0.09 // medal thickness as a share of its width
const LAYERS = 24

/**
 * The flat badge art as a thick medal, in CSS 3D so it works on every device, GPU drawing or not.
 * The picture is stacked in thin layers along its depth, faces in full colour and the inner layers
 * darkened, so the medal's own outline becomes its rim.
 */
function ImageMedal({ id, earned, size }: { id: string; earned: boolean; size: number }) {
  const stage = useRef<HTMLDivElement>(null)
  const rotor = useRef<HTMLDivElement>(null)
  useSpin(stage, (y, x, scale) => {
    if (rotor.current) rotor.current.style.transform = `scale(${scale}) rotateX(${x}rad) rotateY(${y}rad)`
  })
  const art = size * 0.82
  const depth = art * DEPTH
  // A CSS filter on the rotor would flatten the 3D, so each layer carries its own.
  const grey = earned ? '' : ' grayscale(1) opacity(.6)'
  return (
    <div ref={stage} className="grid cursor-grab place-items-center active:cursor-grabbing" style={{ width: size, height: size, perspective: size * 4 }}>
      <div ref={rotor} className="relative" style={{ width: art, height: art, transformStyle: 'preserve-3d' }}>
        {Array.from({ length: LAYERS + 1 }, (_, i) => {
          const face = i === 0 || i === LAYERS
          return (
            <img
              key={i}
              src={`/badges/${id}.webp`}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none"
              style={{
                transform: `translateZ(${depth / 2 - (i / LAYERS) * depth}px)${i === LAYERS ? ' rotateY(180deg)' : ''}`,
                filter: (face ? '' : 'brightness(.55) sepia(.35)') + grey || undefined,
              }}
            />
          )
        })}
        {/* One sweep of light across the front face as the intro lands, cut to the badge's own shape. */}
        <div
          aria-hidden
          className="medal-shine pointer-events-none absolute inset-0"
          style={{ transform: `translateZ(${depth / 2 + 0.5}px)`, WebkitMaskImage: `url(/badges/${id}.webp)`, maskImage: `url(/badges/${id}.webp)`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
        />
      </div>
    </div>
  )
}

/** Light rays and sparkles that burst behind an earned medal as it arrives, then settle into a soft glow. */
function Burst({ size }: { size: number }) {
  const sparks = [
    [-0.38, -0.3, 0.55], [0.4, -0.22, 0.7], [-0.42, 0.25, 0.85], [0.36, 0.34, 0.6], [0.05, -0.46, 0.95], [-0.08, 0.47, 0.75],
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        className="medal-rays absolute rounded-full"
        // Exactly the medal's box: bigger rays ran past the top of the sheet and were cut off flat.
        style={{ width: size, height: size }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 0.55] }}
        transition={{ duration: 1.1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      />
      {sparks.map(([x, y, delay], i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute h-4 w-4 fill-sun"
          style={{ left: `calc(50% + ${x * size}px - 8px)`, top: `calc(50% + ${y * size}px - 8px)` }}
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: [0, 1.25, 0], opacity: [0, 1, 0], rotate: 45 }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        >
          <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
        </motion.svg>
      ))}
    </div>
  )
}

/** A real 3D model from public/badges/<id>.glb, drawn with three.js (loaded only here). */
function GlbMedal({ id, earned, size, onFail }: { id: string; earned: boolean; size: number; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const model = useRef<{ rotation: { x: number; y: number }; draw: () => void } | null>(null)
  const [ready, setReady] = useState(false)
  useSpin(
    host,
    (y, x) => {
      if (!model.current) return
      model.current.rotation.y = y
      model.current.rotation.x = x
      model.current.draw()
    },
    ready,
  )

  useEffect(() => {
    const el = host.current
    if (!el) return
    let stop = () => {}
    let cancelled = false
    ;(async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) // throws without WebGL
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(size, size)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
      camera.position.z = 4.6
      const light = new THREE.DirectionalLight(0xffffff, 2)
      light.position.set(2, 3, 4)
      scene.add(new THREE.AmbientLight(0xffffff, 1.6), light)
      const gltf = await new GLTFLoader().loadAsync(`/badges/${id}.glb`)
      if (cancelled) return renderer.dispose()
      // Fit any model into a 2-unit box, centred.
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const fit = 2 / Math.max(...box.getSize(new THREE.Vector3()).toArray())
      gltf.scene.scale.setScalar(fit)
      gltf.scene.position.copy(box.getCenter(new THREE.Vector3()).multiplyScalar(-fit))
      const medal = new THREE.Group()
      medal.add(gltf.scene)
      scene.add(medal)
      el.appendChild(renderer.domElement)
      model.current = { rotation: medal.rotation, draw: () => renderer.render(scene, camera) }
      setReady(true)
      stop = () => {
        model.current = null
        renderer.dispose()
        renderer.domElement.remove()
      }
    })().catch(() => !cancelled && onFail())
    return () => {
      cancelled = true
      stop()
    }
  }, [id, size, onFail])

  return (
    <div
      ref={host}
      role="img"
      aria-label={id}
      className={`grid cursor-grab place-items-center active:cursor-grabbing ${earned ? '' : 'grayscale opacity-60'}`}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * A badge as a 3D medal the learner can spin with a finger: the .glb model when the badge has one,
 * otherwise the badge art as a thick CSS 3D medal. `hint` is a caption under it.
 */
export function BadgeModel({ id, earned, hint, size = 220 }: { id: string; earned: boolean; hint?: string; size?: number }) {
  const [glbFailed, setGlbFailed] = useState(false)
  const fail = useCallback(() => setGlbFailed(true), []) // stable, so the model is not reloaded every render
  // A chime and a tap of haptics as an earned medal lands (sound.ts respects the Sounds setting).
  useEffect(() => {
    if (!earned) return
    const t = window.setTimeout(() => sound.playAscendingCorrect(), INTRO * 700)
    return () => clearTimeout(t)
  }, [id, earned])
  return (
    <>
      <div className="relative grid place-items-center">
        {earned && <Burst size={size} />}
        {GLB.has(id) && !glbFailed ? (
          <GlbMedal id={id} earned={earned} size={size} onFail={fail} />
        ) : (
          <ImageMedal id={id} earned={earned} size={size} />
        )}
      </div>
      {hint && <span className="text-[12px] font-medium text-ink3">{hint}</span>}
    </>
  )
}
