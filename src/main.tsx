import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronDown, Globe2, EyeOff, Eye } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { Button } from './components/ui/button'
import { HowItWorks } from './components/HowItWorks'
import { WhatYoullLearn } from './components/WhatYoullLearn'
import { AiPowered } from './components/AiPowered'
import { FaqSection } from './components/FaqSection'
import { Footer } from './components/Footer'
import { RegisterPage } from './components/RegisterPage'
import { Navbar } from './components/Navbar'
import './styles.css'

function FloatingArt() {
  return (
    <div className="art" aria-label="Bataa coding mascot illustration">
      <img className="hero-image" src="/hero.webp" alt="Bataa duck surrounded by coding tools" />
    </div>
  )
}

function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="signup-form" onSubmit={(event) => event.preventDefault()}>
      <Button className="google-button" variant="outline" type="submit">
        <FcGoogle className="google-icon" aria-hidden="true" />
        <span>Sign up with Google</span>
      </Button>
      <div className="or-divider"><span /> <small>or</small> <span /></div>
      <label className="sr-only" htmlFor="email">Your email</label>
      <input id="email" className="text-input" type="email" placeholder="Your email" autoComplete="email" />
      <label className="sr-only" htmlFor="password">Your password</label>
      <div className="password-wrap">
        <input
          id="password"
          className="text-input"
          type={showPassword ? 'text' : 'password'}
          placeholder="Your password"
          autoComplete="new-password"
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
      <a href="/web/register" className="submit-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
        Start learning for free
      </a>
      <p className="terms">By signing up, you agree to Bataa’s <a href="#terms">Terms of Service.</a></p>
    </form>
  )
}

function Hero() {
  return (
    <main className="hero-shell">
      <Navbar />

      <section className="hero-content" aria-labelledby="hero-title">
        <div className="copy-column">
          <h1 id="hero-title"><span>Learn by doing</span><br />with your AI mentor</h1>
          <p className="subhead">Bataa sits on your screen as a friendly mascot, opens real desktop apps like Blender, highlights where to click with glowing yellow boxes, and explains mistakes in natural Arabic as you build.</p>
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

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Hero })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/web/register', component: RegisterPage })
const routeTree = rootRoute.addChildren([indexRoute, registerRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
