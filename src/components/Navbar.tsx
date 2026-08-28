import React, { useState, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="bataa-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <a href="/" className="brand" aria-label="bataa home">
          bataa
        </a>
      </div>

      {/* Desktop Navigation */}
      <nav className="main-nav" aria-label="Primary navigation">
        {/* Courses Nav Item & Mega-Menu */}
        <div className="bataa-nav-item-wrap">
          <button
            type="button"
            className="bataa-nav-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <span>Courses</span>
            <ChevronDown size={18} className="bataa-nav-chevron" />
          </button>

          <div className="bataa-nav-dropdown-portal bataa-courses-dropdown-portal" role="menu">
            <div className="bataa-courses-dropdown-layout">
              {/* Column 1: CAREER PATHS */}
              <div className="bataa-dropdown-col">
                <span className="bataa-dropdown-kicker">CAREER PATHS</span>
                <div className="bataa-dropdown-links-list">
                  <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                    3D Artist & Animator
                  </a>
                  <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                    Python & AI Developer
                  </a>
                  <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                    Front-End Developer
                  </a>
                  <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                    Full-Stack Developer
                  </a>
                </div>
              </div>

              {/* Column 2: COURSES (2 sub-columns) */}
              <div className="bataa-dropdown-col bataa-courses-col-wide">
                <span className="bataa-dropdown-kicker">COURSES & TOOLS</span>
                <div className="bataa-courses-subgrid">
                  <div className="bataa-dropdown-links-list">
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      Blender
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      VS Code
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      HTML & CSS
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      JavaScript
                    </a>
                  </div>
                  <div className="bataa-dropdown-links-list">
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      TypeScript
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      Python
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      React
                    </a>
                    <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                      SQL
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Nav Item & Dropdown */}
        <div className="bataa-nav-item-wrap">
          <button
            type="button"
            className="bataa-nav-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <span>Resources</span>
            <ChevronDown size={18} className="bataa-nav-chevron" />
          </button>

          <div className="bataa-nav-dropdown-portal bataa-resources-dropdown-portal" role="menu">
            <div className="bataa-dropdown-col">
              <span className="bataa-dropdown-kicker">RESOURCES</span>
              <div className="bataa-dropdown-links-list">
                <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                  Glossary
                </a>
                <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                  Tutorials
                </a>
                <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                  Learner stories
                </a>
                <a href="/web/register" className="bataa-dropdown-link" role="menuitem">
                  Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Right Account Nav */}
      <div className="account-nav">
        <a href="/web/register" className="nav-login-link">Log in</a>
        <a
          href="/web/register"
          className="top-cta"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Start learning for free
        </a>
      </div>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div
          className="bataa-mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`bataa-mobile-drawer ${mobileMenuOpen ? 'bataa-mobile-drawer-open' : ''}`}
        aria-label="Mobile navigation menu"
      >
        <div className="bataa-mobile-drawer-header">
          <a href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
            bataa
          </a>
          <button
            type="button"
            className="bataa-mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bataa-mobile-drawer-body">
          {/* Mobile Accordion 1: Courses */}
          <div className="bataa-mobile-nav-group">
            <button
              type="button"
              className="bataa-mobile-group-trigger"
              onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
              aria-expanded={mobileCoursesOpen}
            >
              <span>Courses & Tools</span>
              <ChevronDown
                size={18}
                className={`bataa-mobile-chevron ${mobileCoursesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileCoursesOpen && (
              <div className="bataa-mobile-group-content">
                <span className="bataa-mobile-kicker">CAREER PATHS</span>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  3D Artist & Animator
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Python & AI Developer
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Front-End Developer
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Full-Stack Developer
                </a>

                <span className="bataa-mobile-kicker" style={{ marginTop: '14px' }}>
                  TOOLS & LANGUAGES
                </span>
                <div className="bataa-mobile-tools-grid">
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    Blender
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    VS Code
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    HTML & CSS
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    JavaScript
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    TypeScript
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    Python
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    React
                  </a>
                  <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    SQL
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Accordion 2: Resources */}
          <div className="bataa-mobile-nav-group">
            <button
              type="button"
              className="bataa-mobile-group-trigger"
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
              aria-expanded={mobileResourcesOpen}
            >
              <span>Resources</span>
              <ChevronDown
                size={18}
                className={`bataa-mobile-chevron ${mobileResourcesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileResourcesOpen && (
              <div className="bataa-mobile-group-content">
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Glossary
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Tutorials
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Learner stories
                </a>
                <a href="/web/register" className="bataa-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bataa-mobile-drawer-footer">
          <a
            href="/web/register"
            className="bataa-mobile-btn-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Start learning for free
          </a>
          <a
            href="/web/register"
            className="bataa-mobile-btn-secondary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Log in
          </a>
        </div>
      </div>
    </header>
  )
}
