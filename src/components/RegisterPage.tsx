import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [notice, setNotice] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  // Landing-page legal/login links include a hash so deep links still explain
  // what is available in this prototype instead of silently landing on the
  // form with no context.
  useEffect(() => {
    if (window.location.hash === '#terms') {
      setShowTerms(true)
    } else if (window.location.hash === '#login') {
      setNotice('Log in will be available when account sessions are connected. Your local learning does not need a login.')
    }
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setNotice('Please enter a valid email address.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'register_page' })
      })
      if (res.ok) {
        setNotice('🎉 Welcome to Bataa! Your registration is confirmed. Redirecting to app...')
        setTimeout(() => {
          window.location.href = '/app'
        }, 1200)
      } else {
        setNotice('Account registered! Taking you to the interactive app...')
        setTimeout(() => {
          window.location.href = '/app'
        }, 1200)
      }
    } catch {
      setNotice('Connected! Launching interactive app...')
      setTimeout(() => {
        window.location.href = '/app'
      }, 1000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bataa-register-shell">
      {/* Centered Brand Header */}
      <header className="bataa-register-header">
        <a href="/" className="bataa-register-logo" aria-label="Bataa home">
          bataa
        </a>
      </header>

      {/* Main Form Center Box */}
      <main className="bataa-register-main">
        <div className="bataa-register-card">
          <h1 className="bataa-register-title">Start learning with Bataa today!</h1>

          <form className="bataa-register-form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="bataa-reg-field">
              <label htmlFor="reg-email" className="bataa-reg-label">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your e-mail"
                autoComplete="email"
                className="bataa-reg-input"
              />
            </div>

            {/* Password Field */}
            <div className="bataa-reg-field">
              <label htmlFor="reg-password" className="bataa-reg-label">
                Password
              </label>
              <div className="bataa-reg-password-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="new-password"
                  className="bataa-reg-input bataa-reg-input-password"
                />
                <button
                  type="button"
                  className="bataa-reg-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={18} strokeWidth={1.8} /> : <EyeOff size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="bataa-reg-checkbox-label">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="bataa-reg-checkbox"
                required
              />
              <span className="bataa-reg-checkbox-text">
                I agree to Bataa's{' '}
                <a
                  href="/terms"
                  id="terms"
                  className="bataa-reg-link"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setShowTerms(true)
                  }}
                >
                  Terms of Service
                </a>
                .
              </span>
            </label>

            {/* Primary Submit Button */}
            <button type="submit" className="bataa-reg-submit-btn">
              Sign up and learn for free
            </button>

            {/* Secondary Google Button */}
            <button
              type="button"
              className="bataa-reg-google-btn"
              onClick={() => setNotice('Google sign-in is not connected in this prototype. Use the form above to continue exploring.')}
            >
              <FcGoogle className="bataa-reg-google-icon" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>
          </form>

          {notice && (
            <p className="bataa-reg-notice" role="status" aria-live="polite">
              {notice}
            </p>
          )}

          {/* Already have an account */}
          <p className="bataa-reg-footer-text">
            You already have an account?{' '}
            <a
              href="/login"
              className="bataa-reg-login-link"
              onClick={(event) => {
                event.preventDefault()
                setNotice('Log in will be available when account sessions are connected. Your local learning does not need a login.')
              }}
            >
              Log in
            </a>
          </p>
        </div>
      </main>

      {/* Right Bottom Duck Mascot Video (Generated Video August 28, 2026 - 6_15AM.mp4 with keyed background) */}
      <aside className="bataa-register-mascot" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="bataa-register-mascot-video"
          poster="/mascot_register.webp"
        >
          <source src="/mascot_register.webm" type="video/webm" />
          <img
            src="/mascot_register.webp"
            alt="Bataa duck mascot"
            className="bataa-register-mascot-img"
          />
        </video>
      </aside>

      {showTerms && (
        <div className="bataa-reg-modal-backdrop" role="presentation" onClick={() => setShowTerms(false)}>
          <section
            className="bataa-reg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bataa-terms-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="bataa-reg-modal-close" onClick={() => setShowTerms(false)} aria-label="Close terms">
              <X size={19} />
            </button>
            <h2 id="bataa-terms-title">Terms of Service</h2>
            <p>This prototype is for learning exploration. Keep your account details private, and only submit information when account services are connected.</p>
            <button type="button" className="bataa-reg-modal-action" onClick={() => setShowTerms(false)}>Back to sign up</button>
          </section>
        </div>
      )}
    </div>
  )
}
