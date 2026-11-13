import React from 'react'
import { ArrowRight, Sparkles, Download, Play } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { HowItWorks } from './HowItWorks'
import { AiPowered } from './AiPowered'

export function HowItWorksPage() {
  return (
    <div className="bataa-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: '1 0 auto', paddingBottom: '60px' }}>
        {/* Page Hero Header */}
        <section style={{
          padding: 'clamp(50px, 7vw, 80px) 24px clamp(30px, 5vw, 40px)',
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
            <Sparkles size={14} /> The Learning Experience
          </span>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 20px'
          }}>
            How Bataa guides you <br />
            <span style={{ color: 'var(--orange, #ff8500)' }}>every single step</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--brown-soft, #7d5c42)',
            margin: '0 auto 32px',
            maxWidth: '700px'
          }}>
            Forget boring lecture videos that leave you stuck. Bataa sits beside you on your screen, places glowing yellow boxes around the exact tools to click, and troubleshoots mistakes in real time.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
            <a
              href="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '14px',
                background: 'var(--orange, #ff8500)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(255, 133, 0, 0.25)'
              }}
            >
              <Play size={16} /> Try Interactive App
            </a>
            <a
              href="/Bataa.apk"
              download="Bataa.apk"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '14px',
                background: '#ffffff',
                color: 'var(--brown, #2d180b)',
                border: '1px solid var(--line, #edcfad)',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none'
              }}
            >
              <Download size={16} /> Download Android APK
            </a>
          </div>
        </section>

        {/* Embedded Interactive Components */}
        <HowItWorks />
        <AiPowered />

        {/* Bottom CTA Banner */}
        <section style={{ maxWidth: '1080px', margin: '40px auto 20px', padding: '0 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff7ee 0%, #ffeedb 100%)',
            border: '2px solid var(--line, #edcfad)',
            borderRadius: '28px',
            padding: 'clamp(32px, 5vw, 48px)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '30px'
          }}>
            <div style={{ maxWidth: '540px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                Ready to build real projects?
              </h2>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                Jump directly into Bataa's interactive practice. No credit card required.
              </p>
            </div>
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
              Get Started Now <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
