import React from 'react'
import { ChevronDown } from 'lucide-react'

export function Navbar() {
  return (
    <header className="topbar">
      <a href="/" className="brand" aria-label="bataa home">
        bataa
      </a>

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
        <a href="/web/register">Log in</a>
        <a
          href="/web/register"
          className="top-cta"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Start learning for free
        </a>
      </div>
    </header>
  )
}
