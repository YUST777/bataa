import React, { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'

// The mobile app, shown with real screens from the built Android app (captured from mobile/).
const SCREENS = [
  { src: '/app-screens/home.webp', title: 'Home', desc: 'Today’s lesson and your streak' },
  { src: '/app-screens/lesson.webp', title: 'Lesson', desc: 'A quiz, checked instantly' },
  { src: '/app-screens/pond.webp', title: 'Duck pond', desc: 'XP and badges hatch new ducks' },
  { src: '/app-screens/ai-tutor.webp', title: 'AI duck tutor', desc: 'Ask it anything' },
]

export function AiPowered() {
  // Scroll-linked, like Framer: the section pins full-screen (styles.css) and --p goes 0 -> 1
  // from when it starts coming into view to the end of the pinned scroll; the phones rise with it.
  const ref = useRef<HTMLElement>(null)
  // phones (<= 760px): the screens are a swipe row; dots follow the one in view
  const rowRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const onRowScroll = () => {
    const row = rowRef.current
    if (!row) return
    const step = row.scrollWidth / SCREENS.length
    setActive(Math.min(SCREENS.length - 1, Math.round(row.scrollLeft / step)))
  }
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // reduced motion: a much shorter rise (styles.css --rise), not none, so the section still reads as one moment
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) el.classList.add('is-calm')
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const lead = innerHeight * 0.35 // start rising a little before the pin
      const p = Math.min(1, Math.max(0, (lead - r.top) / (r.height - innerHeight + lead)))
      el.style.setProperty('--p', p.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={ref} className="bataa-mob" aria-labelledby="mobile-app-heading">
      <div className="bataa-mob-pin">
      <div className="bataa-mob-head">
        <span className="bataa-ai-kicker">MOBILE APP</span>
        <h2 id="mobile-app-heading">Daily lessons, an AI tutor and a duck pond</h2>
        <p>Practice on your phone between desktop sessions.</p>
        <a href="/Bataa.apk" download="Bataa.apk" className="bataa-mob-dl">
          <Download size={17} aria-hidden="true" /> Download for Android
        </a>
      </div>

      <div className="bataa-mob-row" ref={rowRef} onScroll={onRowScroll}>
        {SCREENS.map((s, i) => (
          <figure key={s.title} className="bataa-mob-item" style={{ '--i': i } as React.CSSProperties}>
            <figcaption>
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </figcaption>
            <div className="bataa-mob-crop">
              <div className="bataa-mob-phone">
                <img src={s.src} alt={`Bataa app: ${s.title}`} loading="lazy" width={390} height={844} />
                <i aria-hidden="true" />
              </div>
            </div>
          </figure>
        ))}
      </div>
      <div className="bataa-mob-dots" aria-hidden="true">
        {SCREENS.map((s, i) => <span key={s.title} className={i === active ? 'on' : ''} />)}
      </div>
      </div>
    </section>
  )
}
