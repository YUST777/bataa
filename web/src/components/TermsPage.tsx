import React from 'react'
import { FileText, Shield, ArrowRight } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function TermsPage() {
  return (
    <div className="bataa-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: '1 0 auto', paddingBottom: '80px' }}>
        <section style={{
          padding: 'clamp(50px, 7vw, 80px) 24px clamp(30px, 4vw, 40px)',
          textAlign: 'center',
          maxWidth: '800px',
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
            marginBottom: '16px'
          }}>
            <Shield size={14} /> Legal & Policies
          </span>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px'
          }}>
            Terms of Service
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--brown-soft, #7d5c42)',
            margin: 0
          }}>
            Last updated: September 2026 • Bataa Inc.
          </p>
        </section>

        {/* Content Document Card */}
        <section style={{ maxWidth: '840px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--line, #edcfad)',
            borderRadius: '24px',
            padding: 'clamp(28px, 5vw, 56px)',
            boxShadow: '0 12px 32px rgba(45, 24, 11, 0.04)',
            color: 'var(--brown, #2d180b)',
            fontSize: '15px',
            lineHeight: 1.7
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                By accessing or using the Bataa website, mobile web applications, and desktop mentor utilities (collectively, the “Services”), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                2. Educational Platform & AI Mentorship
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                Bataa provides interactive coding and creative tutorials, featuring on-screen visual highlights, real-time feedback, and automated guidance. Our learning modules are intended for educational and instructional purposes. While we strive for accuracy, educational content and AI-generated explanations are provided on an “as-is” basis.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                3. User Accounts & Privacy
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                You are responsible for safeguarding your login credentials and maintaining the confidentiality of your account. In current preview and prototype phases, local client progress is stored on your device. We do not sell or monetize personal student data.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                4. Learner Intellectual Property
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                You retain full ownership of all code, 3D models, graphics, and projects you construct while using Bataa. Bataa and its licensors retain all rights, title, and interest in and to the platform, brand marks, mascot designs, curriculum materials, and proprietary vector assets.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                5. Subscription & Payment Terms
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                Bataa offers free starter modules as well as premium subscription tiers (Pro and Max). Subscriptions renew automatically until cancelled by the user. Cancellations take effect at the conclusion of the current billing period.
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                6. Limitation of Liability
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                To the maximum extent permitted by applicable law, Bataa Inc. and its officers, directors, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Services.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brown, #2d180b)', margin: '0 0 12px' }}>
                7. Contact Us
              </h2>
              <p style={{ color: 'var(--brown-soft, #7d5c42)', margin: '0 0 16px' }}>
                If you have questions about these Terms of Service or our privacy standards, please reach out via our official community profiles or LinkedIn:
              </p>
              <a
                href="https://www.linkedin.com/company/bataaap"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--orange, #ff8500)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Bataa on LinkedIn <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
