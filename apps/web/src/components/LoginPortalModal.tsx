import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import CLOUDS2 from "vanta/dist/vanta.clouds2.min";
import type { UserSession } from "../types";

interface LoginPortalModalProps {
  onLoginSuccess: (session: UserSession, isNewRegistration?: boolean) => void;
  onBackToIntro: () => void;
  initialRole?: "merchant" | "customer";
}

const API_BASE_URL = "http://localhost:4000";

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

  // Merchant form state
  const [merchantPhone, setMerchantPhone] = useState("9876543210");
  const [storeName, setStoreName] = useState("Rajesh Kirana & Store");
  const [businessCategory, setBusinessCategory] = useState("Grocery & Kirana");
  const [merchantCity, setMerchantCity] = useState("Indiranagar, Bengaluru");

  // Customer form state
  const [customerPhone, setCustomerPhone] = useState("9123456780");
  const [customerName, setCustomerName] = useState("Priya Sharma");
  const [customerLocation, setCustomerLocation] = useState("100ft Road, Indiranagar");

  // OTP flow simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("123456");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const getPhoneNumber = () => activeRole === "merchant" ? merchantPhone : customerPhone;

  const buildDemoSession = (role: "merchant" | "customer"): UserSession => {
    if (role === "merchant") {
      return {
        role: "merchant",
        userId: "m_rajesh_01",
        name: "Rajesh Kumar",
        phone: `+91 ${merchantPhone}`,
        storeName: storeName || "Rajesh Kirana",
        category: businessCategory,
        location: merchantCity,
        token: "merchant_token_jwt",
      };
    }

    return {
      role: "customer",
      userId: "c_priya_01",
      name: customerName || "Priya Sharma",
      phone: `+91 ${customerPhone}`,
      location: customerLocation || "Indiranagar, Bengaluru",
      token: "customer_token_jwt",
    };
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const phone = getPhoneNumber();
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpSessionId: otpSessionId || "demo-session",
          otp: otpCode,
          role: activeRole,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error?.message ?? "OTP verification failed.");
      }

      const apiUser = data?.data?.user ?? {};
      const finalSession: UserSession = {
        role: activeRole,
        userId: apiUser.id ?? (activeRole === "merchant" ? "m_rajesh_01" : "c_priya_01"),
        name: activeRole === "merchant"
          ? (storeName || "Rajesh Kumar")
          : (customerName || "Priya Sharma"),
        phone: `+91 ${getPhoneNumber()}`,
        ...(activeRole === "merchant"
          ? {
              storeName: storeName || "Rajesh Kirana",
              category: businessCategory,
              location: merchantCity,
            }
          : {
              location: customerLocation || "Indiranagar, Bengaluru",
            }),
        token: data?.data?.accessToken ?? (activeRole === "merchant" ? "merchant_token_jwt" : "customer_token_jwt"),
      };

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

  // Instant 1-click Demo Logins for smooth evaluation
  const handleInstantMerchantDemo = () => {
    onLoginSuccess({
      role: "merchant",
      userId: "m_rajesh_01",
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
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
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              Create Account
            </button>
          </div>

          {/* Card Header */}
          <div className="login-header-section">
            <h1 className="login-heading">
              Welcome to <span className="heading-hindi">कारोबार</span>
            </h1>
            <p className="login-subheading">
              Login to shop, sell, and grow your business.
            </p>
          </div>

          {/* Role Selector */}
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
                <span className="role-icon-box">🏪</span>
                <div className="role-info">
                  <span className="role-title">Merchant</span>
                  <span className="role-desc">(व्यापारी)</span>
                </div>
              </div>
              {activeRole === "merchant" && (
                <span className="role-check-mark">✓</span>
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
                <span className="role-icon-box">🛒</span>
                <div className="role-info">
                  <span className="role-title">Customer</span>
                  <span className="role-desc">(ग्राहक)</span>
                </div>
              </div>
              {activeRole === "customer" && (
                <span className="role-check-mark">✓</span>
              )}
            </button>
          </div>

          {/* Phone Input + OTP Section */}
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

                {/* Phone Number Input */}
                <div className="form-group">
                  <div className="phone-input-wrapper">
                    <span className="country-code">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={activeRole === "merchant" ? merchantPhone : customerPhone}
                      onChange={(e) =>
                        activeRole === "merchant"
                          ? setMerchantPhone(e.target.value)
                          : setCustomerPhone(e.target.value)
                      }
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>

                {/* OTP Submit Button */}
                <button
                  type="submit"
                  className="btn-otp-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending OTP..." : "Continue with OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLogin} className="login-form-fields">
                <div className="otp-sent-banner">
                  <span>Code sent to +91 {getPhoneNumber()}</span>
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
                  className={`btn-otp-submit ${activeRole === "customer" ? "btn-customer" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Authenticating..."
                    : `Enter ${activeRole === "merchant" ? "Merchant" : "Customer"} Portal →`}
                </button>
              </form>
            )}

            {formError && (
              <div className="login-form-error">
                <span>⚠️ {formError}</span>
              </div>
            )}

            {/* OR Divider */}
            <div className="login-or-divider">
              <span>OR</span>
            </div>

            {/* Voice Login CTA */}
            <button
              type="button"
              className="btn-voice-login"
              onClick={activeRole === "merchant" ? handleInstantMerchantDemo : handleInstantCustomerDemo}
            >
              <span className="voice-mic-icon">🎙️</span>
              <div className="voice-login-text">
                <strong>Continue with Voice</strong>
                <small>(आवाज़ से लॉगिन करें)</small>
              </div>
            </button>

            {/* Trust Badges */}
            <div className="login-trust-badges">
              <span>✅ Secure</span>
              <span className="trust-dot">•</span>
              <span>Simple</span>
              <span className="trust-dot">•</span>
              <span>Government Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
