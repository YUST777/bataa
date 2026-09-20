import React from 'react'
import { ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatYoullLearn } from './WhatYoullLearn'

export function CoursesPage() {
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
            <BookOpen size={14} /> Career Tracks & Curriculum
          </span>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 850,
            color: 'var(--brown, #2d180b)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 20px'
          }}>
            Master real-world skills <br />
            <span style={{ color: 'var(--orange, #ff8500)' }}>with practical project paths</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--brown-soft, #7d5c42)',
            margin: '0 auto 32px',
            maxWidth: '700px'
          }}>
            Whether you are stepping into 3D modeling, building websites, or writing Python scripts, Bataa gives you structured career tracks paired with live desktop coaching.
          </p>

          {/* Key Value Props Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            padding: '16px 24px',
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid var(--line, #edcfad)',
            maxWidth: '760px',
            margin: '0 auto'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--brown, #2d180b)' }}>
              <CheckCircle2 size={16} color="#ff8500" /> Real Desktop Apps (Blender, VS Code)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--brown, #2d180b)' }}>
              <CheckCircle2 size={16} color="#ff8500" /> Bite-sized 15-min daily lessons
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--brown, #2d180b)' }}>
              <CheckCircle2 size={16} color="#ff8500" /> Verified Skill Certificates
            </span>
          </div>
        </section>

        {/* Embedded Curriculum Component */}
        <WhatYoullLearn />

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
                Start your journey today
              </h2>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--brown-soft, #7d5c42)', margin: 0 }}>
                Explore starter lessons for free or open our interactive mobile experience.
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
              Start Free Path <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
