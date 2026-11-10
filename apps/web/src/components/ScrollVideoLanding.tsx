import React, { useEffect, useRef, useState, useCallback } from "react";

interface ScrollVideoLandingProps {
  onProceedToLogin: (role?: "merchant" | "customer") => void;
}

export const ScrollVideoLanding: React.FC<ScrollVideoLandingProps> = ({
  onProceedToLogin,
}) => {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Targets for smoothed cinematic video scrubbing
  const targetHeroTimeRef = useRef(0);
  const targetStoryTimeRef = useRef(0);
  const currentHeroTimeRef = useRef(0);
  const currentStoryTimeRef = useRef(0);

  const rafScrollRef = useRef<number>(0);
  const rafSmoothRef = useRef<number>(0);

  // Helper to seek video safely without audio hitching
  const seekVideo = (video: HTMLVideoElement | null, targetTime: number) => {
    if (!video || !video.duration || isNaN(targetTime)) return;
    const clamped = Math.max(0, Math.min(video.duration - 0.05, targetTime));
    if (Math.abs(video.currentTime - clamped) > 0.02) {
      if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
        try {
          (video as any).fastSeek(clamped);
        } catch {
          video.currentTime = clamped;
        }
      } else {
        video.currentTime = clamped;
      }
    }
  };

  // Smooth frame loop: dampens video scrub speed for cinematic pacing across the full video
  useEffect(() => {
    let active = true;

    const smoothVideoLoop = () => {
      if (!active) return;

      // 1. Interpolate Hero Video (0s - 6s)
      const heroVideo = heroVideoRef.current;
      if (heroVideo && heroVideo.duration) {
        const diff = targetHeroTimeRef.current - currentHeroTimeRef.current;
        if (Math.abs(diff) > 0.008) {
          currentHeroTimeRef.current += diff * 0.22;
          seekVideo(heroVideo, currentHeroTimeRef.current);
        }
      }

      // 2. Interpolate Story Video (0s - 19.6s: entire video plays smoothly)
      const storyVideo = storyVideoRef.current;
      if (storyVideo && storyVideo.duration) {
        const diff = targetStoryTimeRef.current - currentStoryTimeRef.current;
        if (Math.abs(diff) > 0.008) {
          currentStoryTimeRef.current += diff * 0.15;
          seekVideo(storyVideo, currentStoryTimeRef.current);
        }
      }

      rafSmoothRef.current = requestAnimationFrame(smoothVideoLoop);
    };

    rafSmoothRef.current = requestAnimationFrame(smoothVideoLoop);

    return () => {
      active = false;
      cancelAnimationFrame(rafSmoothRef.current);
    };
  }, []);

  // Universal scroll event handler (computes progress using client rects)
  const handleScroll = useCallback(() => {
    if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);

    rafScrollRef.current = requestAnimationFrame(() => {
      const track = scrollTrackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);

      // Hero Video target (Allocated first 15% of total scroll distance)
      const heroVideo = heroVideoRef.current;
      if (heroVideo && heroVideo.duration) {
        const heroNorm = Math.min(1, progress / 0.15);
        targetHeroTimeRef.current = heroNorm * heroVideo.duration;
      }

      // Story Video target (Plays full 19.6s story video across 86% of scroll distance)
      const storyVideo = storyVideoRef.current;
      if (storyVideo && storyVideo.duration) {
        const storyNorm = Math.max(0, Math.min(1, (progress - 0.14) / 0.86));
        targetStoryTimeRef.current = storyNorm * storyVideo.duration;
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
    };
  }, [handleScroll]);

  // Video Crossfade:
  // Hero is 100% visible from 0.00 to 0.13
  // Smooth crossfade into Story Video between 0.13 and 0.18
  // Story is 100% visible from 0.18 to 1.00
  let heroOpacity = 1;
  let storyOpacity = 0;
  if (scrollProgress <= 0.13) {
    heroOpacity = 1;
    storyOpacity = 0;
  } else if (scrollProgress >= 0.18) {
    heroOpacity = 0;
    storyOpacity = 1;
  } else {
    const t = (scrollProgress - 0.13) / 0.05;
    heroOpacity = 1 - t;
    storyOpacity = t;
  }

  // Final Closing Scene Backdrop (Dukaan Pink Theme):
  // Fades in smoothly between 0.80 and 0.86, remaining solid to 1.00
  let closingOpacity = 0;
  if (scrollProgress >= 0.86) {
    closingOpacity = 1;
  } else if (scrollProgress >= 0.80) {
    closingOpacity = (scrollProgress - 0.80) / 0.06;
  }

  // Smooth continuous card transitions with relaxed scroll intervals
  const getCardStyle = (
    fadeInStart: number,
    solidStart: number,
    solidEnd: number,
    fadeOutEnd: number,
    isFinal = false
  ): React.CSSProperties => {
    let opacity = 0;
    let translateY = 16;

    if (scrollProgress < fadeInStart) {
      opacity = 0;
      translateY = 16;
    } else if (scrollProgress <= solidStart) {
      const t = (scrollProgress - fadeInStart) / Math.max(0.001, solidStart - fadeInStart);
      opacity = t;
      translateY = 16 * (1 - t);
    } else if (scrollProgress <= solidEnd) {
      opacity = 1;
      translateY = 0;
    } else if (isFinal) {
      opacity = 1;
      translateY = 0;
    } else if (scrollProgress <= fadeOutEnd) {
      const t = (scrollProgress - solidEnd) / Math.max(0.001, fadeOutEnd - solidEnd);
      opacity = 1 - t;
      translateY = -16 * t;
    } else {
      opacity = 0;
      translateY = -16;
    }

    return {
      opacity,
      transform: `translateY(${translateY}px)`,
      pointerEvents: opacity > 0.35 ? "auto" : "none",
      visibility: opacity > 0.01 ? "visible" : "hidden",
    };
  };

  return (
    <div className="landing-page-root">
      {/* ── Fixed Top Header (Skip to Login Button) ── */}
      <header className="sv-top-nav">
        <button
          type="button"
          className="sv-btn-skip-top"
          onClick={() => onProceedToLogin()}
          title="Skip directly to login portal"
        >
          Skip to Login →
        </button>
      </header>

      {/* ── GLOBAL SCROLL SPACER (1000vh for comfortable, full-journey pacing) ── */}
      <div
        ref={scrollTrackRef}
        className="landing-scroll-track"
      >
        {/* ── FIXED PRESENTATION FRAME (Anchored to Viewport) ── */}
        <div className="landing-fixed-stage">
          {/* 1. Hero Assemble Video (3D purple logo -> marketplace) */}
          <video
            ref={heroVideoRef}
            className="stage-bg-video hero-video"
            style={{
              opacity: heroOpacity,
              zIndex: 1,
            }}
            muted
            playsInline
            preload="auto"
            poster="/karobaar_assemble_poster.jpg"
          >
            <source src="/karobaar_assemble_hero.mp4" type="video/mp4" />
          </video>

          {/* 2. Marketplace Story Video (Full continuous visual journey to end) */}
          <video
            ref={storyVideoRef}
            className="stage-bg-video story-video"
            style={{
              opacity: storyOpacity,
              zIndex: 2,
            }}
            muted
            playsInline
            preload="auto"
            poster="/karobaar_story_poster.jpg"
          >
            <source src="/karobaar_story_scroll.mp4" type="video/mp4" />
          </video>

          {/* 3. Soft Luminous Vignette (Enhances text contrast while preserving artwork brilliance) */}
          <div className="stage-vignette" />

          {/* 4. Final Scene Closing Backdrop (Pink Dukaan Theme) */}
          <div
            className="stage-closing-backdrop"
            style={{
              opacity: closingOpacity,
            }}
          />

          {/* 5. Initial Scroll Cue */}
          {scrollProgress < 0.10 && (
            <div
              className="sv-scroll-cue"
              style={{
                opacity: Math.max(0, 1 - scrollProgress * 10),
              }}
            >
              <div className="sv-cue-arrow" />
              <span>Scroll to explore ↓</span>
            </div>
          )}

          {/* ── 6. SEAMLESS GLASSMORPHISM STORYTELLING CARDS (Section Nos & Titles Removed) ── */}
          <div className="stage-cards-container">
            {/* 02. The Problem – Real Life */}
            <div
              className="sv-story-card sv-card-left"
              style={getCardStyle(0.12, 0.15, 0.25, 0.28)}
            >
              <h2 className="sv-story-title">
                Dukaan Apni Hai,{"\n"}Par Kaam Kitna Saara Hai!
              </h2>
              <p className="sv-story-subtitle">
                Stock sambhalo, orders dekho, customers se baat karo... Business chalana itna mushkil kyun?
              </p>
              <div className="problem-pills-row">
                <span className="problem-pill">📦 Bikhra hua inventory & stock</span>
                <span className="problem-pill">📝 Daily hisaab-kitaab ki tension</span>
                <span className="problem-pill">⏳ Counter par lambi bheed</span>
              </div>
            </div>

            {/* 03. The Solution – Meet Karobaar */}
            <div
              className="sv-story-card sv-card-right"
              style={getCardStyle(0.26, 0.29, 0.39, 0.42)}
            >
              <h2 className="sv-story-title">
                Ab Sab Hoga Ek Jagah.
              </h2>
              <p className="sv-story-subtitle">
                Milkar banate hain business ko smart. Dukaan ho ya shopping, Karobaar hai sabke saath.
              </p>
              <div className="sv-story-highlight">
                <span className="sparkle-dot">✦</span>
                <span>Digital Dukaan · Instant Orders · Smart Stock</span>
              </div>
            </div>

            {/* 04. Voice AI – The Hero Moment */}
            <div
              className="sv-story-card sv-card-center voice-card-wide"
              style={getCardStyle(0.40, 0.43, 0.53, 0.56)}
            >
              <h2 className="sv-story-title">
                Bol Kar Batao. Karobaar Kar Dega.
              </h2>
              <p className="sv-story-subtitle">
                Typing chhodo. Bas boliye!
              </p>

              <div className="sv-voice-showcase">
                <div className="sv-voice-wave-bar">
                  <span className="wave-bar bar-1" />
                  <span className="wave-bar bar-2" />
                  <span className="wave-bar bar-3" />
                  <span className="wave-bar bar-4" />
                  <span className="wave-bar bar-3" />
                  <span className="wave-bar bar-2" />
                  <span className="wave-bar bar-1" />
                </div>

                <div className="sv-voice-chips">
                  <div className="sv-voice-bubble">
                    <span className="quote-icon">🎙️</span> "Aaj ki bikri kitni hui?"
                  </div>
                  <div className="sv-voice-bubble">
                    <span className="quote-icon">🎙️</span> "Meri dukaan par naye products add karo."
                  </div>
                  <div className="sv-voice-bubble">
                    <span className="quote-icon">🎙️</span> "Mere aas paas grocery store dikhao."
                  </div>
                </div>
              </div>

              <div className="sv-story-highlight">
                <span className="sparkle-dot">✦</span>
                <span>Just say it! Native Indian voice intelligence</span>
              </div>
            </div>

            {/* 05. Two Worlds. One Karobaar. */}
            <div
              className="sv-story-card sv-card-center split-section-card"
              style={getCardStyle(0.54, 0.57, 0.69, 0.72)}
            >
              <h2 className="sv-story-title">
                Two Worlds. One Karobaar.
              </h2>
              <p className="sv-story-subtitle">
                Chaahe aap dukaan chalate ho ya pados se shopping karte ho — Karobaar sabke liye bana hai.
              </p>

              <div className="sv-split-worlds-grid">
                {/* Merchant Card */}
                <div
                  className="sv-world-box merchant-box"
                  onClick={() => onProceedToLogin("merchant")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="world-icon">🏪</div>
                  <h3 className="world-title">Dukaan Apni.</h3>
                  <p className="world-desc">
                    Apna store manage karo. Customers badhao. Business grow karo.
                  </p>
                  <button
                    type="button"
                    className="sv-btn-world btn-merchant-world"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProceedToLogin("merchant");
                    }}
                  >
                    I'm a Merchant →
                  </button>
                </div>

                {/* Customer Card */}
                <div
                  className="sv-world-box customer-box"
                  onClick={() => onProceedToLogin("customer")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="world-icon">🛍️</div>
                  <h3 className="world-title">Shopping Apni.</h3>
                  <p className="world-desc">
                    Local shops discover karo. Pasand ki cheezein order karo.
                  </p>
                  <button
                    type="button"
                    className="sv-btn-world btn-customer-world"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProceedToLogin("customer");
                    }}
                  >
                    I'm a Customer →
                  </button>
                </div>
              </div>
            </div>

            {/* 06. The Bigger Picture */}
            <div
              className="sv-story-card sv-card-left"
              style={getCardStyle(0.70, 0.73, 0.80, 0.83)}
            >
              <h2 className="sv-story-title">
                Har Local Dukaan Ko{"\n"}Mile Digital Pehchaan.
              </h2>
              <p className="sv-story-subtitle">
                Chhoti dukaan ho ya bada sapna, har business ko aage badhne ka mauka mile.
              </p>
              <div className="sv-story-highlight">
                <span className="sparkle-dot">✦</span>
                <span>Apne sheher se. Apne logon ke liye.</span>
              </div>
            </div>

            {/* 07. Final Closing Section – Balanced Split View (Shop on Left, Glass CTA Card on Right) */}
            <div
              className="final-scene-stage"
              style={getCardStyle(0.82, 0.86, 1.00, 1.00, true)}
            >
              {/* Left Side: Shop Artwork */}
              <div className="closing-shop-design-left">
                <img
                  src="/karobaar_shop_arch.png"
                  alt="Karobaar Digital Dukaan - Har Dukaan Ab Digital"
                  className="closing-shop-design-img"
                />
              </div>

              {/* Right Side: Frosted Glass CTA Card Overlaid on Background */}
              <div className="sv-story-card final-cta-card">
                <h2 className="sv-story-title">
                  Toh Shuru Karein Apna Karobaar?
                </h2>
                <p className="sv-story-subtitle">
                  Aapka business. Aapke customers. Aapki growth. Chaliye, milkar aage badhte hain.
                </p>

                <div className="sv-final-cta-container">
                  <button
                    type="button"
                    className="sv-btn-join-karobaar"
                    onClick={() => onProceedToLogin()}
                  >
                    <span>Join Karobaar →</span>
                  </button>
                  <p className="sv-closing-tagline">
                    Apna Business. Apna Bazaar. Apna Karobaar.
                  </p>
                  <div className="landing-card-footer">
                    <p>KAROBAAR · Har Dukaan, Ab Digital · Voice-First Hyperlocal Commerce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
