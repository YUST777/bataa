import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

type TabType = 'learn' | 'practice' | 'build'

interface TabData {
  id: TabType
  kicker: string
  title: string
  description: string
}

const TABS: TabData[] = [
  {
    id: 'learn',
    kicker: 'GUIDED HIGHLIGHTS',
    title: 'On-screen glowing yellow boxes',
    description:
      'Bataa sits on your screen as a friendly duck mascot, highlights the next action with glowing yellow boxes—like circling "Create Object"—and waits for you to complete it.',
  },
  {
    id: 'practice',
    kicker: 'DESKTOP PRACTICE',
    title: 'Hands-on in real desktop apps',
    description:
      'Bataa checks whether your software (like Blender or VS Code) is installed and your machine is ready, launches the app, and guides you directly inside real tools.',
  },
  {
    id: 'build',
    kicker: 'ENGLISH TUTORING',
    title: 'Real-time mistake diagnosis',
    description:
      'Bataa observes your progress, explains mistakes in clear English as you make them, and adapts instructions to your skill level without requiring a live human tutor.',
  },
]

/* =========================================================================
   PITCH DECK SLIDE VIEWER FOR TAB 1 (BATAA PITCH DECK UNIT 01)
   ========================================================================= */

function PitchDeckViewer() {
  const [slide, setSlide] = useState(1)
  const totalSlides = 16

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSlide((prev) => (prev % totalSlides) + 1)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSlide((prev) => (prev === 1 ? totalSlides : prev - 1))
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1c0d05', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={`/pitch-deck/slide-${String(slide).padStart(2, '0')}.jpg`}
        alt={`Bataa pitch deck slide ${slide}`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Top Banner with PPTX Download */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <span style={{
          background: 'rgba(41, 20, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 207, 151, 0.25)',
          color: '#edcfad',
          fontSize: '12px',
          fontWeight: 700,
          padding: '5px 12px',
          borderRadius: '8px',
          pointerEvents: 'auto'
        }}>
          bataa pitch deck_unit01
        </span>

        <a
          href="/bataa_pitch_deck_unit01.pptx"
          download="bataa pitch deck_unit01.pptx"
          style={{
            background: 'var(--orange, #ff8500)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'auto'
          }}
        >
          <Download size={13} /> Download PPTX
        </a>
      </div>

      {/* Navigation Controls Overlay at Bottom */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(41, 20, 8, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 207, 151, 0.25)',
        borderRadius: '999px',
        padding: '4px 14px',
        color: '#ffffff'
      }}>
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{
            background: 'none',
            border: 'none',
            color: '#edcfad',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '80px', textAlign: 'center', color: '#edcfad' }}>
          Slide {slide} / {totalSlides}
        </span>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          style={{
            background: 'none',
            border: 'none',
            color: '#edcfad',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

/* =========================================================================
   HOW IT WORKS (INTERACTIVE SHOWCASE IN BATAA THEME)
   ========================================================================= */

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<TabType>('learn')
  const [seconds, setSeconds] = useState(20)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-cycle through the 3 tabs every 20 seconds unless user is interacting/hovering
  useEffect(() => {
    if (isHovered) return

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setActiveTab((curr) => {
            const nextIdx = (TABS.findIndex((t) => t.id === curr) + 1) % TABS.length
            return TABS[nextIdx].id
          })
          return 20
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeTab, isHovered])

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId)
    setSeconds(20)
  }

  // Mimo.org circular timer SVG calculation (radius 14, circumference ~87.96)
  const circumference = 2 * Math.PI * 14
  const strokeDashoffset = circumference - (seconds / 20) * circumference

  return (
    <section className="mimo-how-it-works-section" aria-labelledby="platform-heading">
      <div className="mimo-hiw-container">
        {/* Header Block */}
        <div className="mimo-hiw-header">
          <span id="platform-heading" className="mimo-kicker">
            HOW BATAA WORKS
          </span>
          <h2 className="mimo-title">
            The AI tutor that sits on your screen and guides you inside real apps
          </h2>
        </div>

        {/* Showcase Area */}
        <div className="mimo-showcase-wrapper">
          <div className="mimo-showcase-grid">
            {/* Left: Interactive Media Box (1st: YouTube Video, 2nd: Pitch Deck, 3rd: Desktop Showcase) */}
            <div
              className="mimo-video-box"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* 1st: Video */}
              {activeTab === 'learn' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/4Lz5fNhs49g?rel=0"
                    title="Bataa Desktop Practice Video"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}

              {/* 2nd: PowerPoint Pitch Deck */}
              {activeTab === 'practice' && <PitchDeckViewer />}

              {/* 3rd: Screenshot (fully filling the widget) */}
              {activeTab === 'build' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/showcase.jpg"
                    alt="Bataa Desktop Practice Showcase"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right: 3 Interactive Tab Buttons */}
            <div className="mimo-tabs-column" role="tablist" aria-label="Learning progression steps">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`mimo-tab-btn ${isActive ? 'mimo-tab-active' : 'mimo-tab-inactive'}`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <div className="mimo-tab-top">
                      <p className="mimo-tab-kicker">{tab.kicker}</p>
                      <div className="mimo-tab-top-right">
                        {isActive && (
                          <div
                            className="mimo-timer-wrap"
                            role="timer"
                            aria-live="polite"
                            aria-label={`${seconds} seconds remaining`}
                          >
                            <svg className="mimo-timer-svg" viewBox="0 0 32 32" aria-hidden="true">
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mimo-timer-track"
                              />
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="mimo-timer-fill"
                              />
                            </svg>
                            <span className="mimo-timer-number">{seconds}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mimo-tab-bottom">
                      <h3 className="mimo-tab-title">{tab.title}</h3>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            key="desc"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="mimo-tab-desc-wrap"
                          >
                            <p className="mimo-tab-desc">{tab.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tier 2: Three Core Value Pillars */}
          <div className="mimo-pillars-grid">
            {/* Pillar 1: HANDS-ON */}
            <div className="mimo-pillar-card">
              <div className="mimo-pillar-header">
                <p className="mimo-pillar-kicker">HANDS-ON</p>
              </div>
              <div className="mimo-pillar-content">
                <h3 className="mimo-pillar-title">Never pause a video again</h3>
                <p className="mimo-pillar-desc">
                  Courses leave you alone when it is time to build. Bataa sits on your desktop, pointing out where to click live so you learn by doing.
                </p>
              </div>
            </div>

            {/* Pillar 2: PERSONALIZED */}
            <div className="mimo-pillar-card">
              <div className="mimo-pillar-header">
                <p className="mimo-pillar-kicker">PERSONALIZED</p>
              </div>
              <div className="mimo-pillar-content">
                <h3 className="mimo-pillar-title">Friendly English-speaking mascot</h3>
                <p className="mimo-pillar-desc">
                  An AI companion that highlights the next action, explains mistakes in clear English, and stays until you succeed.
                </p>
              </div>
            </div>

            {/* Pillar 3: SELF-GUIDED */}
            <div className="mimo-pillar-card">
              <div className="mimo-pillar-header">
                <p className="mimo-pillar-kicker">SELF-GUIDED</p>
              </div>
              <div className="mimo-pillar-content">
                <h3 className="mimo-pillar-title">Master real desktop software</h3>
                <p className="mimo-pillar-desc">
                  Learn Blender, code editors, and professional software directly on your own computer with 24/7 self-guided mentorship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
