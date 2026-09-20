import React, { useState } from 'react'

interface FaqItem {
  id: string
  question: string
  answer: string
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-0',
    question: 'Is Bataa suitable for beginners?',
    answer:
      'Yes. Bataa is designed specifically for beginners. It checks if your computer is ready, opens the desktop app for you, and highlights each tool with glowing yellow boxes so you never feel lost.',
  },
  {
    id: 'faq-1',
    question: 'Can I use Bataa for free?',
    answer:
      'Yes. You can start learning with Bataa for free and practice starter projects in Blender and code editors. Upgrading unlocks full access to all career paths, advanced AI tutoring, and portfolio tracks.',
  },
  {
    id: 'faq-2',
    question: 'What subscription plans does Bataa offer?',
    answer:
      'Bataa offers Pro and Max plans as monthly or yearly subscriptions. Pro gives you full access to all software learning paths and core AI mentorship. Max includes unlimited real-time AI guidance and advanced project tracks.',
  },
  {
    id: 'faq-3',
    question: "What's included in a paid subscription?",
    answer:
      'A paid subscription includes unlimited access to web-development learning paths, real-time mentor guidance, instant English mistake diagnosis, and verified certificates.',
  },
  {
    id: 'faq-4',
    question: 'How does Bataa guide me step by step on my computer?',
    answer:
      'Bataa sits on your screen as a friendly duck mascot. When you start a lesson, it checks that the required software is installed, launches the app, highlights the next action (like placing a yellow box around "Create Object"), and waits for you to complete it.',
  },
  {
    id: 'faq-5',
    question: 'How much time do I need to learn with Bataa?',
    answer:
      'Just 15 to 20 minutes a day is enough to build real skills. Because you are practicing directly inside real software instead of passively watching long videos, you retain skills much faster.',
  },
]

export function FaqSection() {
  const [openIds, setOpenIds] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section className="bataa-mimo-faq-section" aria-labelledby="faq-heading">
      <div className="bataa-mimo-faq-container">
        <div className="bataa-mimo-faq-layout">
          {/* Left Column: Heading & Kicker (50% desktop width) */}
          <div className="bataa-mimo-faq-left">
            <span className="bataa-mimo-faq-kicker">FAQ</span>
            <h2 id="faq-heading" className="bataa-mimo-faq-title">
              Questions you might have
            </h2>
          </div>

          {/* Right Column: Accordion Items (50% desktop width) */}
          <div className="bataa-mimo-faq-right">
            {FAQ_DATA.map((item) => {
              const isOpen = openIds.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={`bataa-mimo-faq-card ${isOpen ? 'bataa-mimo-faq-card-open' : ''}`}
                >
                  <button
                    type="button"
                    className="bataa-mimo-faq-trigger"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className="bataa-mimo-faq-qtext">{item.question}</span>
                    <div className={`bataa-mimo-faq-chevron-wrap ${isOpen ? 'bataa-mimo-faq-chevron-open' : ''}`}>
                      <svg
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="bataa-mimo-faq-chevron"
                      >
                        <path
                          d="M11.9997 16.54C11.6797 16.54 11.3597 16.42 11.1147 16.175L3.96973 9.02997L5.02973 7.96997L11.9997 14.94L18.9697 7.96997L20.0297 9.02997L12.8847 16.175C12.6397 16.42 12.3197 16.54 11.9997 16.54Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`bataa-mimo-faq-collapse ${
                      isOpen ? 'bataa-mimo-faq-collapse-open' : ''
                    }`}
                  >
                    <div className="bataa-mimo-faq-collapse-inner">
                      <div
                        id={`faq-answer-${item.id}`}
                        role="region"
                        className="bataa-mimo-faq-atext"
                      >
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
