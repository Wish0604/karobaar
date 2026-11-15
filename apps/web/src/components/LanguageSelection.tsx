import React, { useState } from "react";
import { LANGUAGE_OPTIONS, type SupportedLanguage } from "../i18n";
import type { UserSession } from "../types";

interface LanguageSelectionProps {
  session: UserSession;
  onSelect: (language: SupportedLanguage) => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ session, onSelect }) => {
  const [selected, setSelected] = useState<SupportedLanguage>(session.language || "en");

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f7f2", padding: 24 }}>
      <section style={{ width: "min(680px, 100%)", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "clamp(24px, 5vw, 48px)", boxShadow: "0 20px 60px rgba(15, 23, 42, 0.1)" }}>
        <div style={{ color: "#16805c", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>KAROBAAR</div>
        <h1 style={{ margin: "12px 0 8px", color: "#17251f", fontSize: "clamp(1.7rem, 4vw, 2.5rem)" }}>Choose your language</h1>
        <p style={{ margin: "0 0 26px", color: "#64748b", lineHeight: 1.6 }}>This sets the language for your dashboard, assistant, voice, and account experience.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10 }}>
          {LANGUAGE_OPTIONS.map((option) => {
            const active = selected === option.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => setSelected(option.code)}
                aria-pressed={active}
                style={{ textAlign: "left", padding: "14px 15px", borderRadius: 12, border: active ? "2px solid #16805c" : "1px solid #dbe3dd", background: active ? "#edf9f2" : "#fff", color: "#17251f", cursor: "pointer" }}
              >
                <strong style={{ display: "block", fontSize: 16 }}>{option.nativeName}</strong>
                <span style={{ display: "block", marginTop: 4, color: "#64748b", fontSize: 13 }}>{option.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onSelect(selected)}
          style={{ width: "100%", marginTop: 26, border: 0, borderRadius: 12, padding: "14px 18px", background: "#16805c", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
        >
          Continue
        </button>
      </section>
    </main>
  );
};
