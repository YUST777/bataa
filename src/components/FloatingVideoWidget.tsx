import { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Play, Maximize2 } from 'lucide-react'

export function FloatingVideoWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true
          setIsMuted(true)
          videoRef.current.play().catch(() => {})
        }
      })
    }
  }, [isVisible])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
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

      <div className="bataa-video-widget-media" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="bataa-video-widget-player"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/bataa-demo.webm" type="video/webm" />
          <source src="/bataa-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {!isPlaying && (
          <div className="bataa-video-widget-play-overlay">
            <div className="bataa-video-widget-play-icon">
              <Play size={22} fill="currentColor" />
            </div>
          </div>
        )}

        <div className="bataa-video-widget-overlay-controls" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="bataa-video-widget-btn"
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <a
            href="https://www.youtube.com/watch?v=4Lz5fNhs49g"
            target="_blank"
            rel="noopener noreferrer"
            className="bataa-video-widget-btn"
            title="Watch full video on YouTube"
            aria-label="Watch full video on YouTube"
          >
            <Maximize2 size={13} />
          </a>
        </div>
      </div>
    </aside>
  )
}
