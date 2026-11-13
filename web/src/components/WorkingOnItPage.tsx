import React from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function WorkingOnItPage() {
  return (
    <div className="bataa-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid var(--line, #edcfad)',
          borderRadius: '28px',
          padding: '48px 32px',
          boxShadow: '0 20px 40px rgba(45, 24, 11, 0.06)'
        }}>
          <img
            src="/duck_blink.webp"
            alt="Bataa duck mascot"
            width={120}
            height={120}
            style={{ margin: '0 auto 20px', display: 'block' }}
          />

          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(255, 133, 0, 0.12)',
            color: 'var(--orange, #ff8500)',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            In Active Development
          </span>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.2,
            margin: '0 0 14px'
          }}>
            We're working on this!
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--brown-soft, #7d5c42)',
            margin: '0 0 32px'
          }}>
            This page is currently being crafted with love. In the meantime, you can dive straight into the interactive learning app or connect with us on social media!
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                background: 'var(--orange, #ff8500)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none'
              }}
            >
              Start learning in the App <ArrowRight size={18} />
            </a>

            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 22px',
                borderRadius: '12px',
                border: '1px solid var(--line, #edcfad)',
                background: 'var(--paper, #fffdf8)',
                color: 'var(--brown, #2d180b)',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={18} /> Back to Home
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
