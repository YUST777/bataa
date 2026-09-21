import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'

export function FloatingVideoWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)

  useEffect(() => {
    // Only show on public marketing/landing pages, not inside the desktop app (/app)
    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/app')) return

    try {
      const urlParams = new URLSearchParams(window.location.search)
      const forceShow = urlParams.get('video') === '1' || urlParams.get('demo') === '1'
      const hasSeen = window.localStorage.getItem('bataa_video_popup_closed')

      if (!hasSeen || forceShow) {
        // Pop out smoothly on first visit
        const timer = window.setTimeout(() => {
          setIsDismissed(false)
          setIsVisible(true)
        }, 900)
        return () => window.clearTimeout(timer)
      }
    } catch {
      // LocalStorage access fallback
    }

    // Expose window helper for manual testing/reopening
    ;(window as unknown as { __bataaOpenVideoWidget?: () => void }).__bataaOpenVideoWidget = () => {
      setIsDismissed(false)
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    try {
      window.localStorage.setItem('bataa_video_popup_closed', '1')
    } catch {
      // ignore
    }
    window.setTimeout(() => setIsDismissed(true), 320)
  }

  if (isDismissed) return null

  return (
    <aside
      className={`bataa-video-widget ${isVisible ? 'open' : 'closing'}`}
      aria-label="Demo Video Preview"
      role="dialog"
      aria-modal="false"
    >
      <div className="bataa-video-widget-header">
        <span className="bataa-video-widget-title">See Bataa in Action</span>
        <button
          type="button"
          className="bataa-video-widget-close"
          onClick={handleClose}
          aria-label="Close demo video widget"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bataa-video-widget-media">
        <iframe
          src="https://www.youtube-nocookie.com/embed/4Lz5fNhs49g?autoplay=1&mute=1&rel=0&playsinline=1"
          title="Bataa AI Tutor Live Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="bataa-video-widget-footer">
        <a href="/app" className="bataa-video-widget-action" title="Open Bataa App">
          <span>bataa.app | Your AI Mentor for Learning by Doing.</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </aside>
  )
}
