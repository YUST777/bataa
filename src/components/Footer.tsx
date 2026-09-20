import React, { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'

export function Footer() {
  const [workingOnItem, setWorkingOnItem] = useState<string | null>(null)

  const handleWorkingOn = (label: string) => {
    setWorkingOnItem(label)
  }

  return (
    <footer className="bataa-footer">
      <div className="bataa-footer-container">
        {/* Minimized 4-Column Navigation */}
        <div className="bataa-footer-grid">
          {/* Brand & Mission Column */}
          <div className="bataa-footer-brand-col">
            <a href="/" className="bataa-footer-logo-link" aria-label="Bataa home">
              <span className="bataa-footer-logo-text">bataa</span>
            </a>
            <p className="bataa-footer-tagline">
              Learn by doing with your AI mentor. Guided web development practice, step by step.
            </p>
            <a href="/app" className="bataa-footer-cta-pill">
              Start learning free <ArrowRight size={15} />
            </a>
          </div>

          {/* Column 1: Explore */}
          <div className="bataa-footer-col">
            <h3 className="bataa-footer-col-title">Explore</h3>
            <ul className="bataa-footer-links">
              <li><a href="/about" className="bataa-footer-link">About Bataa</a></li>
              <li><a href="/how-it-works" className="bataa-footer-link">How it works</a></li>
              <li><a href="/courses" className="bataa-footer-link">Courses & Curriculum</a></li>
              <li><a href="/faq" className="bataa-footer-link">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div className="bataa-footer-col">
            <h3 className="bataa-footer-col-title">Platform</h3>
            <ul className="bataa-footer-links">
              <li><a href="/app" className="bataa-footer-link">Interactive Web App</a></li>
              <li><a href="/Bataa.apk" download="Bataa.apk" className="bataa-footer-link">Download Android APK</a></li>
              <li><a href="/register" className="bataa-footer-link">Create Account</a></li>
              <li><a href="/terms" className="bataa-footer-link">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 3: Connect & Get App */}
          <div className="bataa-footer-col">
            <h3 className="bataa-footer-col-title">Get the App</h3>
            <div className="bataa-footer-badges">
              <button
                type="button"
                className="bataa-app-badge-link"
                aria-label="Download Bataa on App Store (Coming Soon)"
                onClick={() => handleWorkingOn('iOS App Store Release')}
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  className="bataa-app-badge"
                />
              </button>
              <a
                href="/Bataa.apk"
                download="Bataa.apk"
                className="bataa-app-badge-link"
                aria-label="Download Bataa Android APK"
              >
                <img
                  src="/google-play-badge.svg"
                  alt="Get it on Google Play"
                  className="bataa-app-badge"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Exact Social Links */}
        <div className="bataa-footer-bottom">
          <p className="bataa-footer-copyright">© 2026 Bataa Inc. All rights reserved.</p>

          <div className="bataa-footer-socials">
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@bataa_app"
              target="_blank"
              rel="noreferrer"
              className="bataa-social-link"
              aria-label="TikTok"
              title="TikTok: @bataa_app"
            >
              <svg className="bataa-social-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.971-1.166-1.956-1.282-2.645h.004c-.097-.573-.057-.943-.05-.943h-3.865v14.943c0 .2 0 .399-.008.595 0 .024-.003.046-.004.073 0 .01 0 .022-.003.033v.009a3.28 3.28 0 0 1-1.65 2.604 3.226 3.226 0 0 1-1.6.422c-1.8 0-3.26-1.468-3.26-3.281 0-1.814 1.46-3.282 3.26-3.282.341 0 .68.054 1.004.16l.005-3.936A7.178 7.178 0 0 0 4.76 10.71a7.583 7.583 0 0 0-1.655 2.04c-.163.281-.779 1.412-.853 3.246-.047 1.04.266 2.12.415 2.565v.01c.093.262.457 1.158 1.049 1.913a7.856 7.856 0 0 0 1.674 1.58v-.01l.009.01c1.87 1.27 3.945 1.187 3.945 1.187.359-.015 1.562 0 2.928-.647 1.515-.718 2.377-1.787 2.377-1.787a7.43 7.43 0 0 0 1.296-2.153c.35-.92.466-2.022.466-2.462V8.273c.047.028.672.441.672.441s.9.577 2.303.952c1.006.267 2.363.324 2.363.324V6.153c-.475.052-1.44-.098-2.429-.59Z" fill="currentColor" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/bataa_app/"
              target="_blank"
              rel="noreferrer"
              className="bataa-social-link"
              aria-label="Instagram"
              title="Instagram: @bataa_app"
            >
              <svg className="bataa-social-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.593 1.5A6.1 6.1 0 0 0 1.5 7.595v8.812A6.1 6.1 0 0 0 7.593 22.5h8.865a6.1 6.1 0 0 0 6.093-6.093V7.595A6.1 6.1 0 0 0 16.458 1.5H7.593Zm0 1.805h8.865a4.26 4.26 0 0 1 4.29 4.29v8.812a4.26 4.26 0 0 1-4.29 4.288H7.593a4.258 4.258 0 0 1-4.288-4.288V7.595a4.26 4.26 0 0 1 4.288-4.29Zm10.082 1.806a1.262 1.262 0 1 0 0 2.524 1.262 1.262 0 0 0 0-2.524Zm-5.65 1.482A5.42 5.42 0 0 0 6.62 12a5.42 5.42 0 0 0 5.407 5.407c2.975 0 5.408-2.431 5.408-5.407s-2.433-5.407-5.408-5.407Zm0 1.805c2 0 3.604 1.602 3.604 3.602 0 2-1.603 3.602-3.603 3.602S8.424 14 8.424 12c0-2 1.601-3.602 3.602-3.602Z" fill="currentColor" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61594690138176"
              target="_blank"
              rel="noreferrer"
              className="bataa-social-link"
              aria-label="Facebook"
              title="Facebook: Bataa"
            >
              <svg className="bataa-social-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.659 1.5c-.64 0-1.159.518-1.159 1.159V21.34c0 .64.518 1.159 1.159 1.159h10.058v-8.13H9.979V11.2h2.738V8.861c0-2.713 1.657-4.19 4.077-4.19 1.159 0 2.154.087 2.444.126v2.834H17.56c-1.316 0-1.571.625-1.571 1.543v2.024h3.14l-.41 3.17h-2.73V22.5h5.352c.64 0 1.159-.518 1.159-1.159V2.66c0-.64-.519-1.159-1.159-1.159H2.66Z" fill="currentColor" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/bataaap"
              target="_blank"
              rel="noreferrer"
              className="bataa-social-link"
              aria-label="LinkedIn"
              title="LinkedIn: bataaap"
            >
              <svg className="bataa-social-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.043 1.5c-.851 0-1.543.672-1.543 1.503v17.994c0 .831.692 1.503 1.543 1.503h17.785c.852 0 1.543-.672 1.543-1.503V3.003c0-.831-.691-1.503-1.543-1.503H3.043Zm3.228 3.525c1.078 0 1.739.707 1.76 1.637 0 .91-.684 1.637-1.784 1.637H6.23c-1.058 0-1.742-.727-1.742-1.637 0-.93.704-1.637 1.783-1.637Zm9.295 4.35c2.074 0 3.625 1.355 3.625 4.268v5.437H16.04v-5.075c0-1.275-.455-2.145-1.596-2.145-.871 0-1.392.59-1.62 1.157-.083.203-.1.483-.1.766v5.297H9.569s.041-8.593 0-9.483h3.157v1.339c.419-.646 1.17-1.561 2.841-1.561Zm-2.841 1.561-.023.035h.023v-.035Zm-8.05-1.339h3.15v9.483h-3.15V9.597Z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Modal for Features in Progress */}
      {workingOnItem && (
        <div className="bataa-working-modal-backdrop" role="presentation" onClick={() => setWorkingOnItem(null)}>
          <div
            className="bataa-working-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="working-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="bataa-working-modal-close"
              onClick={() => setWorkingOnItem(null)}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <img
              src="/duck_blink.webp"
              alt="Bataa mascot duck"
              className="bataa-working-modal-duck"
              width={96}
              height={96}
            />

            <h3 id="working-modal-title" className="bataa-working-modal-title">
              We're working on {workingOnItem}!
            </h3>

            <p className="bataa-working-modal-desc">
              This feature is currently in active development. You can jump straight into our interactive web app to practice coding right now!
            </p>

            <div className="bataa-working-modal-actions">
              <a href="/app" className="bataa-working-modal-btn-primary">
                Open Web App <ArrowRight size={16} />
              </a>
              <button
                type="button"
                className="bataa-working-modal-btn-secondary"
                onClick={() => setWorkingOnItem(null)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
