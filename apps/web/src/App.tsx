import { useEffect, useState } from "react";
import type { AppView, UserSession } from "./types";
import { ScrollVideoLanding } from "./components/ScrollVideoLanding";
import { IntroVideoScreen } from "./components/IntroVideoScreen";
import { LoginPortalModal } from "./components/LoginPortalModal";
import { MerchantOnboarding } from "./portals/MerchantOnboarding";
import { MerchantPortal } from "./portals/MerchantPortal";
import { CustomerPortal } from "./portals/CustomerPortal";
import { OneSignalPush } from "./components/OneSignalPush";
import { LanguageSelection } from "./components/LanguageSelection";
import type { SupportedLanguage } from "./i18n";

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

  useEffect(() => {
    const language = session?.language || "en";
    document.documentElement.lang = `${language}-IN`;
  }, [session?.language]);

  const [showReplayModal, setShowReplayModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(false);

  const [targetRole, setTargetRole] = useState<"merchant" | "customer">("merchant");

  const handleProceedToLogin = (role?: "merchant" | "customer") => {
    if (role) {
      setTargetRole(role);
    }
    setCurrentView("login");
  };

  const handleLoginSuccess = (userSession: UserSession, isNewRegistration: boolean = false) => {
    const sessionWithDefaultLanguage = { ...userSession, language: userSession.language || "en" as SupportedLanguage };
    setSession(sessionWithDefaultLanguage);
    sessionStorage.setItem("karobaar_session", JSON.stringify(sessionWithDefaultLanguage));
    if (isNewRegistration) {
      setPendingRegistration(true);
      setCurrentView("language");
      return;
    }
    // Onboarding triggers only after a merchant creates an account
    setCurrentView(sessionWithDefaultLanguage.role);
  };

  const handleLanguageSelected = (language: SupportedLanguage) => {
    if (!session) return;
    const localizedSession = { ...session, language };
    setSession(localizedSession);
    sessionStorage.setItem("karobaar_session", JSON.stringify(localizedSession));
    if (pendingRegistration && localizedSession.role === "merchant") {
      setCurrentView("onboarding");
    } else {
      setCurrentView(localizedSession.role);
    }
    setPendingRegistration(false);
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
      {/* Web push notifications (inert until VITE_ONESIGNAL_APP_ID is set) */}
      <OneSignalPush userId={session?.userId ?? null} role={session?.role ?? null} />

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

      {currentView === "language" && session && (
        <LanguageSelection session={session} onSelect={handleLanguageSelected} />
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
          onSwitchToCustomer={() => setCurrentView("customer")}
        />
      )}

      {/* 5. DEDICATED CUSTOMER PORTAL */}
      {currentView === "customer" && session && (
        <CustomerPortal
          session={session}
          onLogout={handleLogout}
          onReplayIntro={() => setShowReplayModal(true)}
          onSwitchToMerchant={() => setCurrentView("merchant")}
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
