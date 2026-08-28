import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    kicker: 'ARABIC TUTORING',
    title: 'Real-time mistake diagnosis',
    description:
      'Bataa observes your progress, explains mistakes in natural Arabic as you make them, and adapts instructions to your skill level without requiring a live human tutor.',
  },
]

/* =========================================================================
   CUSTOM VECTOR ILLUSTRATIONS (Bataa Theme: Warm Amber, Chocolate, Caramel)
   ========================================================================= */

/**
 * 3D Isometric stacked code blocks / tokens for "INTERACTIVE"
 */
function InteractiveGraphic() {
  return (
    <svg
      className="pillar-svg"
      viewBox="0 0 160 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="codeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#ff7800" />
        </linearGradient>
        <linearGradient id="codeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8c69" />
          <stop offset="100%" stopColor="#e84a27" />
        </linearGradient>
        <linearGradient id="codeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe5b4" />
          <stop offset="100%" stopColor="#f3c583" />
        </linearGradient>
        <linearGradient id="codeGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffa726" />
          <stop offset="100%" stopColor="#fb8c00" />
        </linearGradient>
        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="80" cy="65" rx="55" ry="24" fill="#ff8500" opacity="0.15" filter="url(#glowEffect)" />

      {/* Shadow Base */}
      <ellipse cx="80" cy="88" rx="45" ry="12" fill="#140803" opacity="0.6" />

      {/* Block 1 (Bottom Back) - Coral Token */}
      <g transform="translate(18, 52)">
        <rect x="0" y="4" width="70" height="18" rx="9" fill="#9e2a14" />
        <rect x="0" y="0" width="70" height="18" rx="9" fill="url(#codeGrad2)" />
        <rect x="10" y="6" width="16" height="6" rx="3" fill="#fff" opacity="0.9" />
        <rect x="30" y="6" width="28" height="6" rx="3" fill="#fff" opacity="0.5" />
      </g>

      {/* Block 2 (Middle Right) - Gold Token */}
      <g transform="translate(72, 38)">
        <rect x="0" y="4" width="72" height="18" rx="9" fill="#a45300" />
        <rect x="0" y="0" width="72" height="18" rx="9" fill="url(#codeGrad1)" />
        <circle cx="12" cy="9" r="4" fill="#fff" opacity="0.9" />
        <rect x="22" y="6" width="38" height="6" rx="3" fill="#fff" opacity="0.5" />
      </g>

      {/* Block 3 (Center Top) - Warm Cream Token */}
      <g transform="translate(38, 22)">
        <rect x="0" y="4" width="80" height="20" rx="10" fill="#a8753a" />
        <rect x="0" y="0" width="80" height="20" rx="10" fill="url(#codeGrad3)" />
        <rect x="12" y="7" width="22" height="6" rx="3" fill="#4d2309" opacity="0.85" />
        <rect x="38" y="7" width="14" height="6" rx="3" fill="#4d2309" opacity="0.5" />
        <rect x="56" y="7" width="14" height="6" rx="3" fill="#e8651a" opacity="0.9" />
      </g>

      {/* Block 4 (Front Bottom) - Radiant Orange Token */}
      <g transform="translate(42, 56)">
        <rect x="0" y="5" width="78" height="20" rx="10" fill="#8f3700" />
        <rect x="0" y="0" width="78" height="20" rx="10" fill="url(#codeGrad4)" />
        <rect x="12" y="7" width="18" height="6" rx="3" fill="#fff" opacity="0.9" />
        <rect x="34" y="7" width="32" height="6" rx="3" fill="#fff" opacity="0.6" />
      </g>

      {/* Sparkles */}
      <circle cx="130" cy="24" r="2" fill="#ffd180" />
      <path d="M28 35L30 31L32 35L36 37L32 39L30 43L28 39L24 37Z" fill="#ffb74d" opacity="0.85" />
      <path d="M125 75L126.5 72L128 75L131 76.5L128 78L126.5 81L125 78L122 76.5Z" fill="#ffa726" opacity="0.9" />
    </svg>
  )
}

/**
 * Cute Bataa AI Mentor Robot Mascot for "PERSONALIZED"
/**
 * Bataa Animated Duck Mascot (cleaned transparent webm video + animated webp fallback)
 */
function BataaAnimatedMascot() {
  return (
    <div className="bataa-mascot-video-wrap">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="bataa-mascot-video"
        poster="/mascot_waddle.webp"
      >
        <source src="/mascot_waddle.webm" type="video/webm" />
        <img
          src="/mascot_waddle.webp"
          alt="Friendly Arabic-first mascot"
          className="bataa-mascot-video"
        />
      </video>
    </div>
  )
}


/**
 * Diploma Certificate Roll & Golden Graduate Medal for "CAREER-ORIENTED"
 */
function CertificateGraphic() {
  return (
    <svg
      className="pillar-svg"
      viewBox="0 0 160 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd875" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="diplomaPaper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff9ef" />
          <stop offset="100%" stopColor="#eedcc7" />
        </linearGradient>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8500" />
          <stop offset="100%" stopColor="#d05300" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="78" cy="86" rx="55" ry="10" fill="#130702" opacity="0.5" />

      {/* Rolled Diploma Scroll */}
      <g transform="rotate(-12 75 50)">
        {/* Diploma Back / Roll Shadow */}
        <rect x="22" y="47" width="98" height="24" rx="12" fill="#bf9c79" />
        {/* Diploma Main Cylinder */}
        <rect x="20" y="44" width="98" height="24" rx="12" fill="url(#diplomaPaper)" />

        {/* Scroll rolled end detail */}
        <ellipse cx="28" cy="56" rx="6" ry="11" fill="#e5d0ba" stroke="#cbb299" strokeWidth="1" />
        <circle cx="28" cy="56" r="3" fill="#a4815f" />

        {/* Orange Ribbon wrapped around scroll */}
        <rect x="68" y="43" width="12" height="26" rx="2" fill="url(#ribbonGrad)" />
      </g>

      {/* Golden Graduate Medal / Seal */}
      <g transform="translate(90, 22)">
        {/* Ribbon Tails hanging down */}
        <path d="M26 44L18 72L26 67L34 72L26 44Z" fill="#d05300" />
        <path d="M24 44L28 70L34 65L40 70L32 44Z" fill="#ff8500" />

        {/* Scalloped Gold Medallion Outer */}
        <circle cx="28" cy="28" r="26" fill="#a86800" />
        <circle cx="28" cy="27" r="26" fill="url(#goldMedal)" />
        <circle cx="28" cy="27" r="22" fill="#b45309" stroke="#fef3c7" strokeWidth="1.5" />

        {/* Text inside badge */}
        <text x="28" y="22" textAnchor="middle" fill="#fef3c7" fontSize="8" fontWeight="800" letterSpacing="0.5">
          BATAA
        </text>
        <rect x="13" y="24" width="30" height="11" rx="2" fill="#fef3c7" />
        <text x="28" y="32.5" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="900" letterSpacing="0.5">
          GRADUATE
        </text>

        {/* 5 Stars */}
        <g fill="#fef3c7">
          <circle cx="16" cy="40" r="1.5" />
          <circle cx="22" cy="41.5" r="1.5" />
          <circle cx="28" cy="42" r="1.8" />
          <circle cx="34" cy="41.5" r="1.5" />
          <circle cx="40" cy="40" r="1.5" />
        </g>
      </g>
    </svg>
  )
}

/* =========================================================================
   HOW IT WORKS (CLEAN EMPTY BOX + MIMO.ORG ACCURATE LAYOUT IN BATAA THEME)
   ========================================================================= */

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<TabType>('learn')
  const [seconds, setSeconds] = useState(20)

  // Auto-cycle through the 3 tabs every 20 seconds, exactly like mimo.org
  useEffect(() => {
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
  }, [activeTab])

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
            {/* Left: Clean empty widget box with nothing inside it */}
            <div className="mimo-video-box" aria-label="Media placeholder" />

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

          {/* Tier 2: Three Core Value Pillars with Custom Bataa Vector Artwork */}
          <div className="mimo-pillars-grid">
            {/* Pillar 1: HANDS-ON */}
            <div className="mimo-pillar-card">
              <div className="mimo-pillar-header">
                <p className="mimo-pillar-kicker">HANDS-ON</p>
                <div className="mimo-pillar-art">
                  <InteractiveGraphic />
                </div>
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
                <div className="mimo-pillar-art">
                  <BataaAnimatedMascot />
                </div>
              </div>
              <div className="mimo-pillar-content">
                <h3 className="mimo-pillar-title">Friendly Arabic-first mascot</h3>
                <p className="mimo-pillar-desc">
                  An AI companion that highlights tools with glowing yellow boxes, explains mistakes in natural Arabic, and stays until you succeed.
                </p>
              </div>
            </div>

            {/* Pillar 3: SELF-GUIDED */}
            <div className="mimo-pillar-card">
              <div className="mimo-pillar-header">
                <p className="mimo-pillar-kicker">SELF-GUIDED</p>
                <div className="mimo-pillar-art">
                  <CertificateGraphic />
                </div>
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
