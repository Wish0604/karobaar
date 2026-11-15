import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import * as THREE from "three";
import CLOUDS2 from "vanta/dist/vanta.clouds2.min";
import type { UserSession } from "../types";

interface LoginPortalModalProps {
  onLoginSuccess: (session: UserSession, isNewRegistration?: boolean) => void;
  onBackToIntro: () => void;
  initialRole?: "merchant" | "customer";
}

// Relative when served behind the sandbox preview gateway (set VITE_API_ORIGIN=""),
// or the backend origin in local dev (default http://localhost:4000).
const API_BASE_URL = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:4000";

// Authentic Google G logo
const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  onLoginSuccess,
  onBackToIntro,
  initialRole = "merchant",
}) => {
  const loginBackdropRef = useRef<HTMLDivElement | null>(null);
  const vantaEffectRef = useRef<{ destroy: () => void } | null>(null);
  const [isVantaReady, setIsVantaReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "create">("login");
  const [activeRole, setActiveRole] = useState<"merchant" | "customer">(initialRole);

  // Authentication method: Phone (SMS OTP) vs Email
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Google Account Chooser Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleRole, setCustomGoogleRole] = useState<"merchant" | "customer">("merchant");

  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    let rafId = 0;

    const initVanta = () => {
      const root = loginBackdropRef.current;
      if (!root) {
        return;
      }

      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }

      try {
        (window as unknown as { THREE?: unknown }).THREE = THREE;

        vantaEffectRef.current = CLOUDS2({
          el: root,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          speed: 1.2,
          skyColor: 0x2f80b8,
          cloudColor: 0x7cc7eb,
          cloudShadowColor: 0x3a6f90,
          sunlightColor: 0xffe49a,
        });
        setIsVantaReady(true);
      } catch (error) {
        setIsVantaReady(false);
        console.error("Failed to initialize Vanta background", error);
      }
    };

    rafId = window.requestAnimationFrame(initVanta);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
      setIsVantaReady(false);
    };
  }, []);

  // Login form state
  const [loginPhone, setLoginPhone] = useState("9876543210");
  const [loginEmail, setLoginEmail] = useState("rajesh.karobaar@gmail.com");

  // Merchant form state
  const [merchantPhone, setMerchantPhone] = useState("9876543210");
  const [merchantEmail, setMerchantEmail] = useState("rajesh.kirana@gmail.com");
  const [storeName, setStoreName] = useState("Rajesh Kirana & Store");
  const [businessCategory, setBusinessCategory] = useState("Grocery & Kirana");
  const [merchantCity, setMerchantCity] = useState("Indiranagar, Bengaluru");

  // Customer form state
  const [customerPhone, setCustomerPhone] = useState("9123456780");
  const [customerEmail, setCustomerEmail] = useState("priya.sharma@gmail.com");
  const [customerName, setCustomerName] = useState("Priya Sharma");
  const [customerLocation, setCustomerLocation] = useState("100ft Road, Indiranagar");

  // OTP flow simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("123456");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const getIdentifier = () => {
    if (authMethod === "phone") {
      if (activeTab === "login") {
        return loginPhone;
      }
      return activeRole === "merchant" ? merchantPhone : customerPhone;
    }
    if (activeTab === "login") {
      return loginEmail;
    }
    return activeRole === "merchant" ? merchantEmail : customerEmail;
  };

  // Automatically resolve role and profile for registered identifier
  const resolveUserForLogin = (identifier: string): { role: "merchant" | "customer"; profile?: any } => {
    try {
      const stored = localStorage.getItem("karobaar_registered_users");
      if (stored) {
        const users = JSON.parse(stored);
        if (users[identifier]) {
          return { role: users[identifier].role, profile: users[identifier] };
        }
      }
    } catch {}

    const lower = identifier.toLowerCase();
    // Customer demo identifiers
    if (
      identifier === "9123456780" ||
      identifier.startsWith("9123") ||
      lower.includes("priya") ||
      lower.includes("customer")
    ) {
      return { role: "customer" };
    }

    // Default to initialRole or merchant
    return { role: initialRole || "merchant" };
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const identifier = getIdentifier().trim();
      if (!identifier) {
        throw new Error(
          authMethod === "phone"
            ? "Please enter your 10-digit mobile number"
            : "Please enter your email address"
        );
      }

      const body =
        authMethod === "phone"
          ? { phone: identifier }
          : { email: identifier };

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error?.message ?? "Unable to send verification code right now.");
      }

      setOtpSessionId(data?.data?.otpSessionId ?? "demo-session");
      setOtpCode("123456");
      setOtpSent(true);
    } catch (error) {
      setOtpSent(false);
      setOtpSessionId("");
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to send verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const identifier = getIdentifier().trim();
      const resolved =
        activeTab === "login"
          ? resolveUserForLogin(identifier)
          : { role: activeRole, profile: undefined };

      const effectiveRole = resolved.role;
      const userProfile = resolved.profile;

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpSessionId: otpSessionId || "demo-session",
          otp: otpCode,
          role: effectiveRole,
          ...(authMethod === "phone" ? { phone: identifier } : { email: identifier }),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok && data?.error?.message) {
        throw new Error(data.error.message);
      }

      const apiUser = data?.data?.user ?? {};
      const finalSession: UserSession = {
        role: effectiveRole,
        userId: apiUser.id ?? (effectiveRole === "merchant" ? "m_rajesh_01" : "c_priya_01"),
        name:
          userProfile?.name ??
          (effectiveRole === "merchant"
            ? storeName || "Rajesh Kumar"
            : customerName || "Priya Sharma"),
        phone:
          authMethod === "phone"
            ? `+91 ${identifier}`
            : effectiveRole === "merchant"
            ? "+91 9876543210"
            : "+91 9123456780",
        email:
          authMethod === "email"
            ? identifier
            : effectiveRole === "merchant"
            ? "rajesh.karobaar@gmail.com"
            : "priya.sharma@gmail.com",
        ...(effectiveRole === "merchant"
          ? {
              storeName: userProfile?.storeName || storeName || "Rajesh Kirana & Store",
              category: userProfile?.category || businessCategory,
              location: userProfile?.location || merchantCity,
            }
          : {
              location: userProfile?.location || customerLocation || "Indiranagar, Bengaluru",
            }),
        token:
          data?.data?.accessToken ??
          (effectiveRole === "merchant" ? "merchant_token_jwt" : "customer_token_jwt"),
      };

      // Remember registration so subsequent logins automatically know role & profile
      if (activeTab === "create") {
        try {
          const existing = JSON.parse(localStorage.getItem("karobaar_registered_users") || "{}");
          existing[identifier] = {
            role: effectiveRole,
            name: finalSession.name,
            storeName: finalSession.storeName,
            category: finalSession.category,
            location: finalSession.location,
            phone: finalSession.phone,
            email: finalSession.email,
          };
          localStorage.setItem("karobaar_registered_users", JSON.stringify(existing));
        } catch {}
      }

      const isAccountCreation = activeTab === "create";
      onLoginSuccess(finalSession, isAccountCreation);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not verify the OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In / Sign-Up handler
  const handleGoogleSelect = async (account: {
    name: string;
    email: string;
    role: "merchant" | "customer";
    avatar: string;
  }) => {
    setIsSubmitting(true);
    setShowGoogleModal(false);
    setFormError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          role: account.role,
          avatar: account.avatar,
        }),
      });
      const data = await response.json().catch(() => ({}));

      const isAccountCreation = activeTab === "create";
      const finalSession: UserSession = {
        role: account.role,
        userId: data?.data?.user?.id ?? `u_g_${Date.now()}`,
        name: account.name,
        email: account.email,
        phone: account.role === "merchant" ? "+91 9876543210" : "+91 9123456780",
        avatar: account.avatar,
        ...(account.role === "merchant"
          ? {
              storeName: storeName || `${account.name}'s Kirana Store`,
              category: businessCategory,
              location: merchantCity,
            }
          : {
              location: customerLocation || "Indiranagar, Bengaluru",
            }),
        token: data?.data?.accessToken ?? "demo_google_jwt_token",
      };

      // Save to local registered users
      try {
        const existing = JSON.parse(localStorage.getItem("karobaar_registered_users") || "{}");
        existing[account.email] = {
          role: account.role,
          name: finalSession.name,
          storeName: finalSession.storeName,
          category: finalSession.category,
          location: finalSession.location,
          email: finalSession.email,
          phone: finalSession.phone,
        };
        localStorage.setItem("karobaar_registered_users", JSON.stringify(existing));
      } catch {}

      onLoginSuccess(finalSession, isAccountCreation);
    } catch {
      setFormError("Could not complete Google authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant 1-click Demo Logins for smooth evaluation
  const handleInstantMerchantDemo = () => {
    onLoginSuccess({
      role: "merchant",
      userId: "m_rajesh_01",
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
      email: "rajesh.karobaar@gmail.com",
      storeName: "Rajesh Kirana & General Store",
      category: "Grocery & FMCG",
      location: "Indiranagar, Bengaluru",
      token: "demo_merchant_token",
    });
  };

  const handleInstantCustomerDemo = () => {
    onLoginSuccess({
      role: "customer",
      userId: "c_priya_01",
      name: "Priya Sharma",
      phone: "+91 9123456780",
      email: "priya.sharma@gmail.com",
      location: "Indiranagar, Bengaluru",
      token: "demo_customer_token",
    });
  };

  return (
    <div
      ref={loginBackdropRef}
      className={`login-page-backdrop ${isVantaReady ? "vanta-active" : "vanta-fallback-active"}`}
    >
      <div className="login-split-layout">
        {/* ── LEFT SIDE: Branding ── */}
        <div className="login-brand-side">
          <div className="login-brand-content">
            {/* Hindi Heading */}
            <h1 className="login-hindi-heading">कारोबार</h1>
            <p className="login-hindi-tagline">
              अपनी दुकान, अब ऑनलाइन
            </p>
            <p className="login-hindi-subtitle">
              Local व्यापार को digital ताकत.
            </p>

            {/* Shop Illustration */}
            <div className="login-shop-illustration">
              <img
                src="/karobaar_login_shop.jpg"
                alt="Local shop illustration"
                className="login-shop-img"
              />
            </div>
          </div>

          {/* Back Button */}
          <button
            type="button"
            className="btn-back-intro"
            onClick={onBackToIntro}
          >
            ◀ Replay Intro
          </button>
        </div>

        {/* ── RIGHT SIDE: Login Card (Glassmorphism) ── */}
        <div className="login-card-container">
          {/* Tab Switcher: Login / Create Account */}
          <div className="login-tab-bar">
            <button
              type="button"
              className={`login-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setOtpSent(false);
                setFormError("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === "create" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("create");
                setOtpSent(false);
                setFormError("");
              }}
            >
              Create Account
            </button>
          </div>

          {/* Card Header */}
          <div className="login-header-section">
            <h1 className="login-heading">
              {activeTab === "login" ? (
                <>Welcome to <span className="heading-hindi">कारोबार</span></>
              ) : (
                <>Create <span className="heading-hindi">कारोबार</span> Account</>
              )}
            </h1>
            <p className="login-subheading">
              {activeTab === "login"
                ? authMethod === "phone"
                  ? "Login with your mobile number to continue."
                  : "Login with your email address to continue."
                : "Select your account type to register your business or start shopping."}
            </p>
          </div>

          {/* Role Selector — ONLY for registration (Create Account), removed from Login */}
          {activeTab === "create" && (
            <div className="role-switch-grid">
              <button
                type="button"
                className={`role-tab-btn ${activeRole === "merchant" ? "selected" : ""}`}
                onClick={() => {
                  setActiveRole("merchant");
                  setOtpSent(false);
                }}
              >
                <div className="role-tab-inner">
                  <span className="role-icon-box"><Icon name="store" size={24} strokeWidth={1.6} /></span>
                  <div className="role-info">
                    <span className="role-title">Merchant</span>
                    <span className="role-desc">(व्यापारी)</span>
                  </div>
                </div>
                {activeRole === "merchant" && (
                  <span className="role-check-mark"><Icon name="check" size={12} strokeWidth={2.6} /></span>
                )}
              </button>

              <button
                type="button"
                className={`role-tab-btn ${activeRole === "customer" ? "selected" : ""}`}
                onClick={() => {
                  setActiveRole("customer");
                  setOtpSent(false);
                }}
              >
                <div className="role-tab-inner">
                  <span className="role-icon-box"><Icon name="cart" size={24} strokeWidth={1.6} /></span>
                  <div className="role-info">
                    <span className="role-title">Customer</span>
                    <span className="role-desc">(ग्राहक)</span>
                  </div>
                </div>
                {activeRole === "customer" && (
                  <span className="role-check-mark"><Icon name="check" size={12} strokeWidth={2.6} /></span>
                )}
              </button>
            </div>
          )}

          {/* Phone / Email Input + OTP Section */}
          <div className="login-form-section">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="login-form-fields">
                {/* Extra fields for create-account mode */}
                {activeTab === "create" && activeRole === "merchant" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="store-name">Store / Dukaan Name</label>
                      <input
                        id="store-name"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Rajesh Kirana & General Store"
                        required
                      />
                    </div>
                    <div className="form-row-two">
                      <div className="form-group">
                        <label htmlFor="biz-cat">Category</label>
                        <select
                          id="biz-cat"
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                        >
                          <option value="Grocery & Kirana">Grocery & Kirana</option>
                          <option value="Sweets & Snacks">Sweets & Snacks</option>
                          <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                          <option value="Dairy & Bakery">Dairy & Bakery</option>
                          <option value="General Retail">General Retail</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="merchant-city">Location / Area</label>
                        <input
                          id="merchant-city"
                          type="text"
                          value={merchantCity}
                          onChange={(e) => setMerchantCity(e.target.value)}
                          placeholder="e.g. Indiranagar, Bengaluru"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "create" && activeRole === "customer" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="cust-name">Your Full Name</label>
                      <input
                        id="cust-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cust-loc">Delivery Address</label>
                      <input
                        id="cust-loc"
                        type="text"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        placeholder="e.g. 100ft Road, Indiranagar"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Primary Input (Phone or Email) */}
                {authMethod === "phone" ? (
                  <div className="form-group">
                    <label htmlFor="phone-input">
                      {activeTab === "login" ? "Mobile Number" : "Mobile Number for Verification"}
                    </label>
                    <div className="phone-input-wrapper">
                      <span className="country-code">+91</span>
                      <input
                        id="phone-input"
                        type="tel"
                        maxLength={10}
                        value={activeTab === "login" ? loginPhone : (activeRole === "merchant" ? merchantPhone : customerPhone)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTab === "login") {
                            setLoginPhone(val);
                          } else if (activeRole === "merchant") {
                            setMerchantPhone(val);
                          } else {
                            setCustomerPhone(val);
                          }
                        }}
                        placeholder="Enter 10-digit mobile number"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="email-input">
                      {activeTab === "login" ? "Email Address" : "Email Address for Verification"}
                    </label>
                    <div className="email-input-wrapper">
                      <span className="email-input-icon">
                        <Icon name="mail" size={17} strokeWidth={1.8} />
                      </span>
                      <input
                        id="email-input"
                        type="email"
                        value={activeTab === "login" ? loginEmail : (activeRole === "merchant" ? merchantEmail : customerEmail)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTab === "login") {
                            setLoginEmail(val);
                          } else if (activeRole === "merchant") {
                            setMerchantEmail(val);
                          } else {
                            setCustomerEmail(val);
                          }
                        }}
                        placeholder="e.g. you@example.com"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-otp-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Sending OTP..."
                    : activeTab === "create"
                    ? authMethod === "phone"
                      ? "Register with OTP →"
                      : "Register with Email OTP →"
                    : authMethod === "phone"
                    ? "Continue with OTP →"
                    : "Continue with Email OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLogin} className="login-form-fields">
                <div className="otp-sent-banner">
                  <span>
                    Code sent to{" "}
                    <strong>
                      {authMethod === "phone" ? `+91 ${getIdentifier()}` : getIdentifier()}
                    </strong>
                  </span>
                  <button
                    type="button"
                    className="btn-change-num"
                    onClick={() => setOtpSent(false)}
                  >
                    Change
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="otp-input">Enter 6-Digit OTP</label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="otp-code-input"
                    placeholder="123456"
                    autoFocus
                    required
                  />
                  <small className="otp-helper">Demo OTP is prefilled: <strong>123456</strong></small>
                </div>

                <button
                  type="submit"
                  className={`btn-otp-submit ${activeTab === "create" && activeRole === "customer" ? "btn-customer" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Authenticating..."
                    : activeTab === "create"
                    ? `Complete ${activeRole === "merchant" ? "Merchant" : "Customer"} Registration →`
                    : "Login to Karobaar →"}
                </button>
              </form>
            )}

            {formError && (
              <div className="login-form-error">
                <span><Icon name="alert" size={13} strokeWidth={1.8} /> {formError}</span>
              </div>
            )}

            {/* OR Divider */}
            <div className="login-or-divider">
              <span>OR</span>
            </div>

            {/* Social & Alternative Auth (Google & Email Options) */}
            <div className="login-alt-auth-group">
              {/* Google Sign-In / Sign-Up Button */}
              <button
                type="button"
                className="btn-google-login"
                onClick={() => setShowGoogleModal(true)}
              >
                <GoogleIcon size={19} />
                <span>
                  {activeTab === "create"
                    ? `Sign up with Google as ${activeRole === "merchant" ? "Merchant" : "Customer"}`
                    : "Continue with Google"}
                </span>
              </button>

              {/* Email / Mobile Switcher Button */}
              {authMethod === "phone" ? (
                <button
                  type="button"
                  className="btn-alt-auth"
                  onClick={() => {
                    setAuthMethod("email");
                    setOtpSent(false);
                    setFormError("");
                  }}
                >
                  <Icon name="mail" size={17} strokeWidth={1.8} />
                  <span>
                    {activeTab === "create" ? "Register with Email instead" : "Continue with Email instead"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-alt-auth"
                  onClick={() => {
                    setAuthMethod("phone");
                    setOtpSent(false);
                    setFormError("");
                  }}
                >
                  <Icon name="smartphone" size={17} strokeWidth={1.8} />
                  <span>
                    {activeTab === "create" ? "Register with Mobile Number" : "Continue with Mobile Number"}
                  </span>
                </button>
              )}
            </div>

            {/* Quick 1-click Demo Evaluation (on Login) */}
            {activeTab === "login" && (
              <div className="login-quick-demo-links">
                <span className="quick-demo-label">Instant Demo Evaluation:</span>
                <div className="quick-demo-btns">
                  <button
                    type="button"
                    className="btn-quick-chip"
                    onClick={handleInstantMerchantDemo}
                    title="Directly enter Merchant Portal"
                  >
                    <Icon name="store" size={14} strokeWidth={1.8} /> Demo Merchant
                  </button>
                  <button
                    type="button"
                    className="btn-quick-chip"
                    onClick={handleInstantCustomerDemo}
                    title="Directly enter Customer Portal"
                  >
                    <Icon name="cart" size={14} strokeWidth={1.8} /> Demo Customer
                  </button>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="login-trust-badges">
              <span><Icon name="shieldCheck" size={13} strokeWidth={1.8} /> Secure</span>
              <span className="trust-dot">•</span>
              <span>Simple</span>
              <span className="trust-dot">•</span>
              <span>Government Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Google Account Chooser Modal ── */}
      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="google-modal-close"
              onClick={() => setShowGoogleModal(false)}
            >
              <Icon name="x" size={18} strokeWidth={2} />
            </button>

            <div className="google-modal-header">
              <GoogleIcon size={32} />
              <h2 className="google-modal-title">
                {activeTab === "create" ? "Sign up with Google" : "Sign in with Google"}
              </h2>
              <p className="google-modal-subtitle">
                Choose an account to continue to <strong>KAROBAAR कारोबार</strong>
              </p>
            </div>

            <div className="google-account-list">
              {/* Account 1: Merchant Account */}
              <button
                type="button"
                className="google-account-item"
                onClick={() =>
                  handleGoogleSelect({
                    name: "Rajesh Kumar",
                    email: "rajesh.karobaar@gmail.com",
                    role: activeTab === "create" ? activeRole : "merchant",
                    avatar: "R",
                  })
                }
              >
                <div className="google-account-avatar">R</div>
                <div className="google-account-info">
                  <span className="google-account-name">Rajesh Kumar</span>
                  <span className="google-account-email">rajesh.karobaar@gmail.com</span>
                </div>
                <span className="google-account-badge">Merchant Store</span>
              </button>

              {/* Account 2: Customer Account */}
              <button
                type="button"
                className="google-account-item"
                onClick={() =>
                  handleGoogleSelect({
                    name: "Priya Sharma",
                    email: "priya.sharma@gmail.com",
                    role: activeTab === "create" ? activeRole : "customer",
                    avatar: "P",
                  })
                }
              >
                <div className="google-account-avatar customer-avatar">P</div>
                <div className="google-account-info">
                  <span className="google-account-name">Priya Sharma</span>
                  <span className="google-account-email">priya.sharma@gmail.com</span>
                </div>
                <span className="google-account-badge customer-badge">Customer</span>
              </button>

              {/* Option 3: Use another Google account */}
              <button
                type="button"
                className="google-account-item"
                onClick={() => setShowCustomGoogle(!showCustomGoogle)}
              >
                <div className="google-account-avatar custom-avatar">
                  <Icon name="user" size={18} strokeWidth={2} />
                </div>
                <div className="google-account-info">
                  <span className="google-account-name">Use another Google account</span>
                  <span className="google-account-email">Enter custom Google credentials</span>
                </div>
              </button>
            </div>

            {/* Custom Google Account Inline Form */}
            {showCustomGoogle && (
              <div className="google-custom-box">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Amit Patel)"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="Google Email (e.g. amit@gmail.com)"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                />
                {activeTab === "login" && (
                  <div className="google-custom-role-row">
                    <button
                      type="button"
                      className={customGoogleRole === "merchant" ? "active" : ""}
                      onClick={() => setCustomGoogleRole("merchant")}
                    >
                      Merchant Store
                    </button>
                    <button
                      type="button"
                      className={customGoogleRole === "customer" ? "active" : ""}
                      onClick={() => setCustomGoogleRole("customer")}
                    >
                      Customer
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="btn-google-custom-submit"
                  onClick={() => {
                    if (!customGoogleEmail.trim()) return;
                    handleGoogleSelect({
                      name: customGoogleName.trim() || "Google User",
                      email: customGoogleEmail.trim(),
                      role: activeTab === "create" ? activeRole : customGoogleRole,
                      avatar: (customGoogleName.trim() || "G")[0].toUpperCase(),
                    });
                  }}
                >
                  Continue with this Account →
                </button>
              </div>
            )}

            <div className="google-modal-footer">
              To continue, Google will share your name, email address, language preference, and profile picture with KAROBAAR.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
