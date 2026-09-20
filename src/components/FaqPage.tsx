import React from 'react'
import { HelpCircle, ArrowRight, MessageCircle } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { FaqSection } from './FaqSection'

export function FaqPage() {
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
            <HelpCircle size={14} /> Help Center
          </span>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 20px'
          }}>
            Frequently Asked Questions
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--brown-soft, #7d5c42)',
            margin: '0 auto 32px',
            maxWidth: '700px'
          }}>
            Have questions about how Bataa guides you, our interactive exercises, or our desktop companion? Find quick answers right here.
          </p>
        </section>

        {/* Embedded FAQ Accordion Component */}
        <FaqSection />

        {/* Contact / Help Card */}
        <section style={{ maxWidth: '840px', margin: '40px auto 20px', padding: '0 24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--line, #edcfad)',
            borderRadius: '24px',
            padding: 'clamp(28px, 4vw, 40px)',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(45, 24, 11, 0.04)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255, 133, 0, 0.12)',
              color: 'var(--orange, #ff8500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <MessageCircle size={24} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 8px' }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--brown-soft, #7d5c42)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Reach out to us on any of our official channels or try out our interactive web app directly.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                  textDecoration: 'none'
                }}
              >
                Launch Web App <ArrowRight size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/bataaap"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid var(--line, #edcfad)',
                  color: 'var(--brown, #2d180b)',
                  fontWeight: 700,
                  fontSize: '15px',
                  textDecoration: 'none'
                }}
              >
                Contact via LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
