import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Lenis from 'lenis'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { Button } from './components/ui/button'
import { HowItWorks } from './components/HowItWorks'
import { WhatYoullLearn } from './components/WhatYoullLearn'
import { AiPowered } from './components/AiPowered'
import { FaqSection } from './components/FaqSection'
import { Footer } from './components/Footer'
import { AboutPage } from './components/AboutPage'
import { HowItWorksPage } from './components/HowItWorksPage'
import { CoursesPage } from './components/CoursesPage'
import { FaqPage } from './components/FaqPage'
import { TermsPage } from './components/TermsPage'
import { Navbar } from './components/Navbar'
import { WorkingOnItPage } from './components/WorkingOnItPage'
import { FloatingVideoWidget } from './components/FloatingVideoWidget'
import './styles.css'

function FloatingArt() {
  return (
    <div className="art" aria-label="Bataa coding mascot illustration">
      <img
        className="hero-image"
        src="/hero.webp"
        alt="Bataa duck surrounded by coding tools"
        width={620}
        height={540}
        // @ts-expect-error fetchpriority is standard in modern HTML
        fetchpriority="high"
        decoding="sync"
      />
    </div>
  )
}

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleSignUp = () => {
    setIsSubmitting(true)
    const redirectTo = encodeURIComponent(`${window.location.origin}/`)
    window.location.href = `https://uspudlodlwjezrbxzbqn.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || !email.includes('@')) {
      setNotice('Please enter a valid email address.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'hero_signup' })
      })
      if (res.ok) {
        setNotice('🎉 Welcome! Your reservation is confirmed. Click below to start learning!')
      } else {
        setNotice('Use “Start learning for free” to open the guided learning experience.')
      }
    } catch {
      setNotice('Use “Start learning for free” to open the guided learning experience.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <Button className="google-button" variant="outline" type="button" onClick={handleGoogleSignUp}>
        <FcGoogle className="google-icon" aria-hidden="true" />
        <span>Sign up with Google</span>
      </Button>
      <div className="or-divider"><span /> <small>or</small> <span /></div>
      <label className="sr-only" htmlFor="email">Your email</label>
      <input
        id="email"
        className="text-input"
        type="email"
        placeholder="Your email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="sr-only" htmlFor="password">Your password</label>
      <div className="password-wrap">
        <input
          id="password"
          className="text-input"
          type={showPassword ? 'text' : 'password'}
          placeholder="Your password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="eye-button"
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <Eye size={18} strokeWidth={1.8} /> : <EyeOff size={18} strokeWidth={1.8} />}
        </button>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-button"
      >
        {isSubmitting ? 'Connecting...' : 'Start learning for free'}
      </button>
      <p className="terms">By signing up, you agree to Bataa’s <a href="/terms">Terms of Service.</a></p>
      {notice && <p className="signup-notice" role="status" aria-live="polite">{notice}</p>}
    </form>
  )
}

function Hero() {
  // Very light smooth scrolling on the landing page only (touch scrolling stays native).
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({ lerp: reduce ? 0.3 : 0.16, wheelMultiplier: 1, smoothWheel: true })
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop) })
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])

  return (
    <main id="about" className="hero-shell">
      <Navbar />

      <section className="hero-content" aria-labelledby="hero-title">
        <div className="copy-column">
          <h1 id="hero-title"><span>Learn by doing</span><br />with your AI mentor</h1>
          <p className="subhead">Bataa sits beside you as a friendly duck mentor, guides each step, and explains mistakes in clear English as you build real projects.</p>
          <SignupForm />
        </div>
        <FloatingArt />
      </section>

      <HowItWorks />
      <WhatYoullLearn />
      <AiPowered />
      <FaqSection />
      <Footer />
    </main>
  )
}

function AppDownloadPage() {
  useEffect(() => {
    const a = document.createElement('a')
    a.href = '/Bataa.apk'
    a.download = 'Bataa.apk'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [])

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', textAlign: 'center', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '420px', display: 'grid', gap: '16px', justifyItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--brown)' }}>Downloading Bataa…</h1>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--brown-soft)' }}>
          Your download of <strong>Bataa.apk</strong> should start automatically.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="/Bataa.apk"
            download="Bataa.apk"
            style={{ padding: '12px 22px', borderRadius: '999px', background: 'var(--orange)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
          >
            Download Bataa.apk
          </a>
          <a
            href="/"
            style={{ padding: '12px 20px', borderRadius: '999px', border: '1px solid var(--line)', background: '#fff', color: 'var(--brown)', fontWeight: 600, textDecoration: 'none' }}
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}

function RootLayout() {
  useEffect(() => {
    // 1. Handle incoming OAuth token in hash fragment (#access_token=...)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken) {
        localStorage.setItem('bataa_access_token', accessToken)
        if (refreshToken) localStorage.setItem('bataa_refresh_token', refreshToken)
        // Clean URL hash and STAY on current page
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    // 2. Clear stale/consumed OAuth state error query params if user refreshed or navigated back
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('error_code') === 'bad_oauth_state') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <>
      <Outlet />
      <FloatingVideoWidget />
    </>
  )
}

const rootRoute = createRootRoute({ component: RootLayout })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Hero })
const appRoute = createRoute({ getParentRoute: () => rootRoute, path: '/app', component: AppDownloadPage })
const landingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/landing', component: Hero })
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: AboutPage })
const howItWorksRoute = createRoute({ getParentRoute: () => rootRoute, path: '/how-it-works', component: HowItWorksPage })
const coursesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/courses', component: CoursesPage })
const faqRoute = createRoute({ getParentRoute: () => rootRoute, path: '/faq', component: FaqPage })
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: TermsPage })
const workingOnItRoute = createRoute({ getParentRoute: () => rootRoute, path: '/working-on-it', component: WorkingOnItPage })
const comingSoonRoute = createRoute({ getParentRoute: () => rootRoute, path: '/coming-soon', component: WorkingOnItPage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute,
  landingRoute,
  aboutRoute,
  howItWorksRoute,
  coursesRoute,
  faqRoute,
  termsRoute,
  workingOnItRoute,
  comingSoonRoute
])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
