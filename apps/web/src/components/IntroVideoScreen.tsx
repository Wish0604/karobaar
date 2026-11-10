import React, { useEffect, useRef, useState } from "react";

interface IntroVideoScreenProps {
  onProceedToLogin: () => void;
  isReplayMode?: boolean;
  onCloseReplay?: () => void;
}

export const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({
  onProceedToLogin,
  isReplayMode = false,
  onCloseReplay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(19.6);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    // Attempt auto-play when mounted
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy might pause until user interaction
        setIsPlaying(false);
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="intro-screen-backdrop" role="dialog" aria-modal="true" aria-label="Karobaar Platform Intro">
      <div className="ambient-glow ambient-glow-top" />
      <div className="ambient-glow ambient-glow-bottom" />

      <div className="intro-container">
        {/* Intro Top Bar */}
        <header className="intro-header">
          <div className="brand-badge">
            <span className="brand-dot pulse" />
            <span className="brand-title">KAROBAAR</span>
            <span className="brand-tagline">Har Dukaan, Ab Digital</span>
          </div>

          <div className="intro-actions">
            {isReplayMode && onCloseReplay ? (
              <button
                type="button"
                className="action-btn text-btn"
                onClick={onCloseReplay}
              >
                ✕ Close Replay
              </button>
            ) : (
              <button
                type="button"
                className="action-btn proceed-btn"
                onClick={onProceedToLogin}
              >
                Proceed to Login &rarr;
              </button>
            )}
          </div>
        </header>

        {/* Cinematic Video Canvas */}
        <div className="intro-video-wrapper">
          <div className="intro-video-card">
            <video
              ref={videoRef}
              className="intro-video-element"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              poster="/karobaar_poster.jpg"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/karobaar_hero_titlecard.webm" type="video/webm" />
              <source src="/karobaar_hero_titlecard.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Control Bar Overlay */}
            <div className="video-overlay-bar">
              <div className="video-controls-left">
                <button
                  type="button"
                  className="ctrl-icon-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  className="ctrl-icon-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                <span className="time-display">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </span>
              </div>

              <div className="badge-live-stream">
                <span className="live-dot" />
                <span>Karobaar Story Animation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Scrubber / Progress Bar */}
        <div className="progress-track" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Intro Footer Navigation */}
        <footer className="intro-footer">
          <div className="intro-footer-copy">
            <p className="intro-tag">India's Voice-First Hyperlocal AI Platform</p>
            <p className="intro-sub">Connecting local neighborhood merchants with nearby customers in real-time.</p>
          </div>

          <div className="intro-footer-cta">
            <button
              type="button"
              className={`btn-main-login ${isEnded ? "pulse-button" : ""}`}
              onClick={onProceedToLogin}
            >
              <span>{isEnded ? "Login to Your Portal →" : "Continue to Login Portal →"}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
