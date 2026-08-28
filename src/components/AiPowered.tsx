import React from 'react'

export function AiPowered() {
  return (
    <section className="bataa-ai-section" aria-labelledby="ai-powered-heading">
      <div className="bataa-ai-container">
        {/* Top Header Row */}
        <div className="bataa-ai-header">
          <div className="bataa-ai-title-wrap">
            <span id="ai-powered-heading" className="bataa-ai-kicker">
              AI-POWERED
            </span>
            <h2 className="bataa-ai-title">
              Master real desktop software with AI where you learn by doing
            </h2>
          </div>

          {/* Right 84% Metric */}
          <div className="bataa-ai-stat-box">
            <span className="bataa-ai-stat-number">84%</span>
            <div className="bataa-ai-stat-label">
              of online learners get stuck when following recorded tutorials alone
            </div>
          </div>
        </div>

        {/* 3 AI Cards Grid */}
        <div className="bataa-ai-cards-grid">
          {/* Card 1: Live screen guidance */}
          <article className="bataa-ai-card">
            <div className="bataa-ai-card-text">
              <p className="bataa-ai-card-kicker">LEARN</p>
              <h3 className="bataa-ai-card-title">Live screen guidance</h3>
              <p className="bataa-ai-card-desc">
                Bataa checks your setup, opens real apps like Blender, places glowing yellow boxes over the exact tools to click next, and waits for you to finish
              </p>
            </div>
            <div className="bataa-ai-widget-placeholder" />
          </article>

          {/* Card 2: Instant mistake diagnosis */}
          <article className="bataa-ai-card">
            <div className="bataa-ai-card-text">
              <p className="bataa-ai-card-kicker">PRACTICE</p>
              <h3 className="bataa-ai-card-title">Instant mistake diagnosis</h3>
              <p className="bataa-ai-card-desc">
                Get friendly, real-time explanations in natural Arabic whenever you click the wrong setting, run into an error, or get stuck
              </p>
            </div>
            <div className="bataa-ai-widget-placeholder" />
          </article>

          {/* Card 3: Real software mastery */}
          <article className="bataa-ai-card bataa-ai-card-wide">
            <div className="bataa-ai-card-text">
              <p className="bataa-ai-card-kicker">BUILD</p>
              <h3 className="bataa-ai-card-title">Real software mastery</h3>
              <p className="bataa-ai-card-desc">
                No toy sandboxes or passive videos. Build complete, portfolio-ready 3D and coding projects directly inside actual desktop software without needing a human tutor
              </p>
            </div>
            <div className="bataa-ai-widget-placeholder bataa-ai-widget-placeholder-wide" />
          </article>
        </div>
      </div>
    </section>
  )
}
