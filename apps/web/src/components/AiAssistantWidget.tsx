import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { AIMascot, type MascotState } from "./AIMascot";
import "./AiAssistantWidget.css";

export interface AiChatMessage {
  sender: "user" | "ai";
  text: string;
}

export interface AiPendingAction {
  title: string;
  desc: string;
  apply: () => void;
}

export type AiSpeechState = "idle" | "listening" | "processing" | "speaking";

interface AiAssistantWidgetProps {
  open: boolean;
  expanded: boolean;
  chatHistory: AiChatMessage[];
  inputText: string;
  isListening: boolean;
  speechState: AiSpeechState;
  isSpeaking: boolean;
  voiceMuted: boolean;
  pendingAction: AiPendingAction | null;
  onOpenChange: (open: boolean) => void;
  onExpandedChange: (expanded: boolean) => void;
  onInputChange: (value: string) => void;
  onSend: (text?: string) => void;
  onToggleMic: () => void;
  onToggleMute: () => void;
  onStopSpeaking: () => void;
  onConfirmAction: () => void;
  onDismissAction: () => void;
}

const COMPACT_PROMPTS = ["Aaj ki sales?", "Low stock items?", "Create a discount offer"];
const FULL_PROMPTS = [
  "Show today's sales and earnings overview",
  "Which products are running low on stock?",
  "Create a 10% discount offer for repeat customers",
  "Show pending orders waiting for approval",
  "Add new product: Fortune Basmati Rice 5kg at ₹480",
];

/**
 * Persistent floating AI assistant available on every portal screen.
 * Collapsed: floating robot button. Open: small popup chat window.
 * Expanded: the same chat as a right-side sidebar panel.
 */
export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  open,
  expanded,
  chatHistory,
  inputText,
  isListening,
  speechState,
  isSpeaking,
  voiceMuted,
  pendingAction,
  onOpenChange,
  onExpandedChange,
  onInputChange,
  onSend,
  onToggleMic,
  onToggleMute,
  onStopSpeaking,
  onConfirmAction,
  onDismissAction,
}) => {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const [fabHover, setFabHover] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [flash, setFlash] = useState<MascotState | null>(null);
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = localStorage.getItem("karobaar-ai-mascot-pos");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const flashTimer = useRef<number | undefined>(undefined);

  const doFlash = (s: MascotState) => {
    window.clearTimeout(flashTimer.current);
    setFlash(s);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1800);
  };

  /** Move mode: the mascot can be dragged anywhere on screen. */
  const beginDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragMode || !fabRef.current) return;
    e.preventDefault();
    const rect = fabRef.current.getBoundingClientRect();
    const off = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    setDragging(true);
    let latest = fabPos ?? { x: rect.left, y: rect.top };
    const onMove = (ev: PointerEvent) => {
      latest = {
        x: Math.min(Math.max(8, ev.clientX - off.dx), window.innerWidth - rect.width - 8),
        y: Math.min(Math.max(8, ev.clientY - off.dy), window.innerHeight - rect.height - 8),
      };
      setFabPos(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      try {
        localStorage.setItem("karobaar-ai-mascot-pos", JSON.stringify(latest));
      } catch {
        /* storage unavailable — position just won't persist */
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, open, expanded, speechState]);

  useEffect(() => {
    if (open && !expanded) {
      inputRef.current?.focus();
    }
  }, [open, expanded]);

  // Escape closes the context menu / exits move mode; outside click closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setCtxMenu(null);
      setDragMode(false);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".aiw-ctx")) setCtxMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, true);
    };
  }, []);

  if (!open) {
    const fabMascot: MascotState = flash ?? (fabHover || dragMode ? "listening" : "idle");
    const fabStyle = fabPos
      ? { left: fabPos.x, top: fabPos.y, bottom: "auto", right: "auto" }
      : undefined;
    return (
      <>
        <button
          ref={fabRef}
          type="button"
          className={`aiw-fab ${dragMode ? "move-mode" : ""} ${dragging ? "dragging" : ""}`}
          style={fabStyle}
          onClick={() => {
            if (dragMode) {
              setDragMode(false);
              return;
            }
            onOpenChange(true);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setCtxMenu({ x: e.clientX, y: e.clientY });
          }}
          onPointerDown={beginDrag}
          onMouseEnter={() => setFabHover(true)}
          onMouseLeave={() => setFabHover(false)}
          title={dragMode ? "Drag me anywhere — click to finish" : "Ask KAROBAAR AI · right-click for options"}
          aria-label="KAROBAAR AI assistant"
          aria-haspopup="menu"
        >
          <AIMascot state={fabMascot} level={0.35} size={46} />
          {dragMode && <span className="aiw-drag-hint">Drag me anywhere · Esc to finish</span>}
        </button>

        {ctxMenu && (
          <div
            className="aiw-ctx"
            role="menu"
            style={{
              left: Math.min(ctxMenu.x, window.innerWidth - 240),
              top: Math.min(ctxMenu.y, window.innerHeight - 160),
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setCtxMenu(null);
                setDragMode(false);
                onOpenChange(true);
                onExpandedChange(true);
              }}
            >
              <Icon name="maximize" size={14} strokeWidth={2} />
              Expand to Copilot Sidebar
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setCtxMenu(null);
                setDragMode(false);
                onOpenChange(true);
              }}
            >
              <Icon name="keyboard" size={14} strokeWidth={2} />
              Type Instead of Voice
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setCtxMenu(null);
                setDragMode(true);
              }}
            >
              <Icon name="move" size={14} strokeWidth={2} />
              Move KAROBAAR AI
            </button>
          </div>
        )}
      </>
    );
  }

  const prompts = expanded ? FULL_PROMPTS : COMPACT_PROMPTS;
  const listening = isListening || speechState === "listening";
  const mascotState: MascotState =
    flash ??
    (listening ? "listening" : speechState === "processing" || pendingAction ? "thinking" : isSpeaking ? "speaking" : "idle");

  const chatBody = (
    <>
      <div className="aiw-chat-scroll" ref={chatScrollRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`aiw-bubble ${msg.sender === "user" ? "aiw-bubble-user" : "aiw-bubble-ai"}`}>
            {msg.sender === "ai" && <span className="aiw-bubble-avatar"><AIMascot headOnly state="idle" size={22} /></span>}
            <span className="aiw-bubble-text">{msg.text}</span>
          </div>
        ))}

        {speechState === "processing" && (
          <div className="aiw-bubble aiw-bubble-ai">
            <span className="aiw-bubble-avatar"><AIMascot headOnly state="thinking" size={22} /></span>
            <span className="aiw-bubble-text aiw-typing">
              Soch raha huu<span className="aiw-typing-dots">...</span>
            </span>
          </div>
        )}

        {pendingAction && (
          <div className="aiw-action-card">
            <strong className="aiw-action-title"><Icon name="zap" size={13} strokeWidth={2} /> {pendingAction.title}</strong>
            <small className="aiw-action-desc">{pendingAction.desc}</small>
            <div className="aiw-action-buttons">
              <button type="button" className="aiw-action-confirm" onClick={() => {
                onConfirmAction();
                doFlash("success");
              }}>
                Confirm & Apply ✓
              </button>
              <button type="button" className="aiw-action-dismiss" onClick={() => {
                onDismissAction();
                doFlash("error");
              }}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {listening ? (
        <div className="aiw-wave-wrap">
          <div className="aiw-wave">
            <span /><span /><span /><span /><span />
          </div>
          <span className="aiw-wave-label">Listening… speak in Hindi or English</span>
        </div>
      ) : isSpeaking ? (
        <button type="button" className="aiw-speaking-strip" onClick={onStopSpeaking}>
          <span className="aiw-speaking-icon"><Icon name="speaker" size={17} /></span>
          <span className="aiw-speaking-text">AI is speaking… tap to stop</span>
          <span className="aiw-speaking-bars"><span /><span /><span /></span>
        </button>
      ) : (
        <div className="aiw-chips">
          {prompts.map((prompt) => (
            <button key={prompt} type="button" className="aiw-chip" onClick={() => onSend(prompt)}>
              <Icon name="sparkle" size={11} strokeWidth={2} /> {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        className="aiw-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="aiw-input"
          placeholder={listening ? "Listening…" : "Ask anything… e.g. aaj ki sales"}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={listening}
        />
        <button
          type="button"
          className={`aiw-mic-btn ${listening ? "listening" : ""}`}
          onClick={onToggleMic}
          title="Voice input (Hindi / English)"
          aria-label="Voice input"
        >
          <Icon name="mic" size={18} />
        </button>
        <button type="submit" className="aiw-send-btn" title="Send" aria-label="Send message">
          <Icon name="send" size={15} />
        </button>
      </form>
    </>
  );

  const header = (
    <div className="aiw-header">
      <span className="aiw-header-avatar"><AIMascot headOnly state={mascotState} size={30} /></span>
      <div className="aiw-header-info">
        <strong className="aiw-header-title">KAROBAAR AI</strong>
        <span className="aiw-header-sub">Your Smart Local Business Copilot</span>
      </div>
      <button
        type="button"
        className={`aiw-header-btn ${voiceMuted ? "aiw-header-btn-muted" : ""}`}
        onClick={onToggleMute}
        title={voiceMuted ? "Unmute AI voice" : "Mute AI voice"}
        aria-label={voiceMuted ? "Unmute AI voice" : "Mute AI voice"}
      >
        {voiceMuted ? <Icon name="speakerOff" size={15} /> : <Icon name="speaker" size={15} />}
      </button>
      <button
        type="button"
        className="aiw-header-btn"
        onClick={() => onExpandedChange(!expanded)}
        title={expanded ? "Collapse to popup" : "Expand to sidebar"}
        aria-label={expanded ? "Collapse assistant" : "Expand assistant"}
      >
        {expanded ? <Icon name="minimize" size={15} /> : <Icon name="maximize" size={15} />}
      </button>
      <button
        type="button"
        className="aiw-header-btn"
        onClick={() => {
          onOpenChange(false);
          onExpandedChange(false);
        }}
        title="Close assistant"
        aria-label="Close assistant"
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );

  if (expanded) {
    return (
      <>
        <div className="aiw-drawer-backdrop" onClick={() => onExpandedChange(false)} />
        <aside className="aiw-drawer">
          {header}
          {chatBody}
        </aside>
      </>
    );
  }

  return <div className="aiw-popup">{header}{chatBody}</div>;
};
