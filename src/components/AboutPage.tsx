import React from 'react'
import { ArrowRight, Sparkles, CheckCircle2, Laptop, Smartphone, Heart } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AboutPage() {
  return (
    <div className="bataa-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: '1 0 auto', paddingBottom: '80px' }}>
        {/* Hero Section */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 24px clamp(40px, 6vw, 60px)',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(255, 133, 0, 0.12)',
            color: 'var(--orange, #ff8500)',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            <Sparkles size={14} /> Our Mission
          </span>

          <h1 style={{
            fontSize: 'clamp(34px, 5vw, 54px)',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 20px'
          }}>
            Bridging the gap between <br /><span style={{ color: 'var(--orange, #ff8500)' }}>learning</span> and <span style={{ color: 'var(--orange, #ff8500)' }}>doing</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.6,
            color: 'var(--brown-soft, #7d5c42)',
            margin: '0 auto 36px',
            maxWidth: '720px'
          }}>
            Traditional courses make you watch passive video lectures. Bataa sits beside you as a friendly duck mentor, highlights where to click on your actual screen, and guides you as you build real projects.
          </p>

          <a
            href="/app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              borderRadius: '14px',
              background: 'var(--orange, #ff8500)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 10px 24px rgba(255, 133, 0, 0.28)'
            }}
          >
            Start Learning for Free <ArrowRight size={18} />
          </a>
        </section>

        {/* Mascot Feature Card */}
        <section style={{ maxWidth: '1080px', margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--line, #edcfad)',
            borderRadius: '28px',
            padding: 'clamp(32px, 5vw, 56px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            boxShadow: '0 20px 40px rgba(45, 24, 11, 0.05)'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                color: 'var(--orange, #ff8500)',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px'
              }}>
                The Companion
              </span>
              <h2 style={{
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: 800,
                color: 'var(--brown, #2d180b)',
                lineHeight: 1.25,
                margin: '0 0 16px'
              }}>
                Meet your cheerful AI duck mentor
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'var(--brown-soft, #7d5c42)',
                marginBottom: '20px'
              }}>
                Learning software like VS Code, Blender, or terminal tools can be intimidating. Bataa stays on your screen as a non-judgmental companion that breaks complex workflows down into single doable clicks.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brown, #2d180b)', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#ff8500" /> Glowing on-screen action highlights
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brown, #2d180b)', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#ff8500" /> Instant mistake diagnosis in clear English
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brown, #2d180b)', fontSize: '15px', fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="#ff8500" /> 100% private and sandboxed local execution
                </li>
              </ul>
            </div>

            <div style={{ textAlign: 'center' }}>
              <img
                src="/hero.webp"
                alt="Bataa duck mascot learning tools"
                width={420}
                height={360}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
              />
            </div>
          </div>
        </section>

        {/* 2 Surfaces Grid */}
        <section style={{ maxWidth: '1080px', margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              color: 'var(--orange, #ff8500)',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Two Moments of Learning
            </span>
            <h2 style={{
              fontSize: 'clamp(26px, 3.5vw, 36px)',
              fontWeight: 800,
              color: 'var(--brown, #2d180b)',
              margin: '8px 0 0'
            }}>
              Designed for your daily routine
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Surface 1 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--line, #edcfad)',
              borderRadius: '24px',
              padding: '36px 30px',
              boxShadow: '0 12px 28px rgba(45, 24, 11, 0.04)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 133, 0, 0.12)',
                color: 'var(--orange, #ff8500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 10px' }}>
                Mobile Micro-Practice
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--brown-soft, #7d5c42)', margin: '0 0 18px' }}>
                Turn spare minutes on the bus or couch into coding progress. Complete daily bite-sized web dev challenges, build streaks, and master core concepts with interactive tactile feedback.
              </p>
              <a href="/app" style={{ color: 'var(--orange, #ff8500)', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Try Mobile Lessons →
              </a>
            </div>

            {/* Surface 2 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--line, #edcfad)',
              borderRadius: '24px',
              padding: '36px 30px',
              boxShadow: '0 12px 28px rgba(45, 24, 11, 0.04)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 133, 0, 0.12)',
                color: 'var(--orange, #ff8500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Laptop size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 10px' }}>
                Desktop Mentor Guidance
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--brown-soft, #7d5c42)', margin: '0 0 18px' }}>
                When you're ready to build real projects, Bataa guides your work inside industry-standard tools like VS Code and Blender. No copy-pasting code: you do the clicking and coding while Bataa mentors.
              </p>
              <a href="/courses" style={{ color: 'var(--orange, #ff8500)', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Explore Curriculum →
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
