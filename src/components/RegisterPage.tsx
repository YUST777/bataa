import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock registration submission
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
                  {showPassword ? (
                    <Eye size={18} strokeWidth={1.8} />
                  ) : (
                    <EyeOff size={18} strokeWidth={1.8} />
                  )}
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
                <a href="#terms" className="bataa-reg-link">
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
            <button type="button" className="bataa-reg-google-btn">
              <FcGoogle className="bataa-reg-google-icon" aria-hidden="true" />
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Already have an account */}
          <p className="bataa-reg-footer-text">
            You already have an account?{' '}
            <a href="#login" className="bataa-reg-login-link">
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
    </div>
  )
}
