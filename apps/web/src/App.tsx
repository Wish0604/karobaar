import { useState } from "react";
import type { AppView, UserSession } from "./types";
import { ScrollVideoLanding } from "./components/ScrollVideoLanding";
import { IntroVideoScreen } from "./components/IntroVideoScreen";
import { LoginPortalModal } from "./components/LoginPortalModal";
import { MerchantOnboarding } from "./portals/MerchantOnboarding";
import { MerchantPortal } from "./portals/MerchantPortal";
import { CustomerPortal } from "./portals/CustomerPortal";

export function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const savedSession = sessionStorage.getItem("karobaar_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.role === "merchant" || parsed.role === "customer") {
          return parsed.role;
        }
      } catch {
        // Fallback
      }
    }
    return "intro";
  });

  const [session, setSession] = useState<UserSession | null>(() => {
    const savedSession = sessionStorage.getItem("karobaar_session");
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [showReplayModal, setShowReplayModal] = useState(false);

  const [targetRole, setTargetRole] = useState<"merchant" | "customer">("merchant");

  const handleProceedToLogin = (role?: "merchant" | "customer") => {
    if (role) {
      setTargetRole(role);
    }
    setCurrentView("login");
  };

  const handleLoginSuccess = (userSession: UserSession, isNewRegistration: boolean = false) => {
    setSession(userSession);
    sessionStorage.setItem("karobaar_session", JSON.stringify(userSession));
    // Onboarding triggers only after a merchant creates an account
    if (userSession.role === "merchant" && isNewRegistration) {
      setCurrentView("onboarding");
    } else {
      setCurrentView(userSession.role);
    }
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem("karobaar_session");
    setCurrentView("login");
  };

  const handleBackToIntro = () => {
    setCurrentView("intro");
    // Scroll to top so the landing page starts from the beginning
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      {/* 1. SCROLL-ANIMATED INTRO VIDEO LANDING PAGE */}
      {currentView === "intro" && (
        <ScrollVideoLanding
          onProceedToLogin={handleProceedToLogin}
        />
      )}

      {/* 2. LOGIN / PORTAL SELECTOR SCREEN */}
      {currentView === "login" && (
        <LoginPortalModal
          onLoginSuccess={handleLoginSuccess}
          onBackToIntro={handleBackToIntro}
          initialRole={targetRole}
        />
      )}

      {/* 3. MERCHANT ONBOARDING (after registration, before dashboard) */}
      {currentView === "onboarding" && session && (
        <MerchantOnboarding
          session={session}
          onComplete={() => {
            sessionStorage.setItem("karobaar_onboarding_done", "true");
            setCurrentView("merchant");
          }}
        />
      )}

      {/* 4. DEDICATED MERCHANT PORTAL */}
      {currentView === "merchant" && session && (
        <MerchantPortal
          session={session}
          onLogout={handleLogout}
          onReplayIntro={() => setShowReplayModal(true)}
          onOpenOnboarding={() => setCurrentView("onboarding")}
        />
      )}

      {/* 5. DEDICATED CUSTOMER PORTAL */}
      {currentView === "customer" && session && (
        <CustomerPortal
          session={session}
          onLogout={handleLogout}
          onReplayIntro={() => setShowReplayModal(true)}
        />
      )}

      {/* Replay modal (plays the video normally, used from inside portals) */}
      {showReplayModal && (
        <IntroVideoScreen
          isReplayMode={true}
          onProceedToLogin={() => setShowReplayModal(false)}
          onCloseReplay={() => setShowReplayModal(false)}
        />
      )}
    </>
  );
}
