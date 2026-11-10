import React, { useEffect, useMemo, useState } from "react";
import type { UserSession } from "../types";
import "./MerchantOnboarding.css";

type IconName =
  | "arrow-left"
  | "arrow-right"
  | "camera"
  | "check"
  | "chevron"
  | "close"
  | "document"
  | "edit"
  | "flash"
  | "gallery"
  | "lock"
  | "mic"
  | "more"
  | "refresh"
  | "shield"
  | "trash"
  | "upload"
  | "volume";

type Screen =
  | "otp"
  | "ai-intro"
  | "methods"
  | "digilocker"
  | "retrieving"
  | "documents"
  | "manual"
  | "camera"
  | "review"
  | "submit"
  | "status";

type Status = "pending" | "verified" | "action" | "rejected";

const navOrder: Screen[] = [
  "otp",
  "ai-intro",
  "methods",
  "digilocker",
  "documents",
  "manual",
  "camera",
  "review",
  "submit",
  "status",
];

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    "arrow-left": (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M21 12H9" />
      </>
    ),
    "arrow-right": (
      <>
        <path d="m9 18 6-6-6-6" />
        <path d="M3 12h12" />
      </>
    ),
    camera: (
      <>
        <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    document: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 13h6M9 17h5" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5L9 20H4v-5Z" />
        <path d="m13 6 5 5" />
      </>
    ),
    flash: <path d="M13 2 5 14h7l-1 8 8-12h-7z" />,
    gallery: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m4 17 5-5 4 4 2-2 5 4" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    mic: (
      <>
        <rect x="8" y="3" width="8" height="13" rx="4" />
        <path d="M5 12a7 7 0 0 0 14 0M12 19v3" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5M6.1 8A7 7 0 0 1 18 6l2 6M18 16a7 7 0 0 1-12 2l-2-6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 20 6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 15v5h16v-5" />
      </>
    ),
    volume: (
      <>
        <path d="M5 10v4h4l5 4V6l-5 4z" />
        <path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <span />
        <span />
        <span />
      </div>
      <div>
        <strong>KAROBAAR</strong>
        <small>कारोबार आपका, साथ हमारा</small>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "text";
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <button className={`button ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
}

function Progress({ step = 1 }: { step?: number }) {
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>Business verification</span>
        <strong>{step} of 3</strong>
      </div>
      <div className="progress">
        <span style={{ width: `${step * 33.33}%` }} />
      </div>
    </div>
  );
}

function Header({
  onBack,
  step,
  onSkip,
}: {
  onBack?: () => void;
  step?: number;
  onSkip?: () => void;
}) {
  return (
    <>
      <header className="topbar">
        {onBack ? (
          <button className="icon-button" onClick={onBack} aria-label="Go back">
            <Icon name="arrow-left" />
          </button>
        ) : (
          <Brand />
        )}
        {onBack && <Brand />}
        {onSkip && (
          <button
            type="button"
            className="icon-button help-button"
            onClick={onSkip}
            title="Skip to Dashboard"
            style={{ fontSize: "11px", width: "auto", padding: "0 10px", fontWeight: 700 }}
          >
            Skip →
          </button>
        )}
      </header>
      {step && <Progress step={step} />}
    </>
  );
}

function AiOrb({ onClick, pulse = false }: { onClick: () => void; pulse?: boolean }) {
  return (
    <button
      className={`ai-orb ${pulse ? "pulse" : ""}`}
      onClick={onClick}
      aria-label="Open KAROBAAR AI"
    >
      <span className="ai-spark">✦</span>
      <Icon name="mic" size={25} />
      <span className="online-dot" />
    </button>
  );
}

function AiAvatar({ size = "normal" }: { size?: "normal" | "large" }) {
  return (
    <div className={`ai-avatar ${size}`}>
      <span className="antenna">✦</span>
      <div className="face">
        <i />
        <i />
        <b />
      </div>
    </div>
  );
}

function SecurityNote() {
  return (
    <div className="security-note">
      <Icon name="shield" size={21} />
      <p>
        <strong>Your documents are safe</strong>
        <span>Encrypted, consent-based and used only for verification.</span>
      </p>
    </div>
  );
}

function ScreenTitle({
  eyebrow,
  title,
  hindi,
  description,
}: {
  eyebrow?: string;
  title: string;
  hindi?: string;
  description?: string;
}) {
  return (
    <div className="screen-title">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {hindi && <h2>{hindi}</h2>}
      {description && <p>{description}</p>}
    </div>
  );
}

function OtpSuccess({
  next,
  phone,
}: {
  next: () => void;
  phone?: string;
}) {
  const displayPhone = phone
    ? phone.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, "$1 ••••• ••$4")
    : "+91 ••••• ••482";

  return (
    <div className="screen otp-screen">
      <div className="hero-gradient">
        <Brand />
        <div className="success-illustration">
          <span className="orbit one" />
          <span className="orbit two" />
          <div className="phone-shape">
            <div className="check-badge">
              <Icon name="check" size={34} strokeWidth={2.5} />
            </div>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <main className="success-content">
        <div className="tiny-success">
          <Icon name="check" size={14} /> Verification complete
        </div>
        <h1>
          Mobile Number
          <br />
          Verified!
        </h1>
        <p className="hindi">
          आपका मोबाइल नंबर सफलतापूर्वक
          <br />
          सत्यापित हो गया है।
        </p>
        <div className="number-chip">
          <span>Registered mobile</span>
          <strong>{displayPhone}</strong>
        </div>
        <Button onClick={next} icon="arrow-right">
          Continue
        </Button>
        <small>Next, let's verify your business</small>
      </main>
    </div>
  );
}

function AiIntro({ choose }: { choose: (enabled: boolean) => void }) {
  return (
    <div className="screen ai-intro-screen">
      <div className="intro-background">
        <Brand />
        <div className="ghost-title">
          <span>Next step</span>
          <h2>Set up your business</h2>
        </div>
      </div>
      <div className="overlay" />
      <section className="ai-intro-card">
        <div className="drag-handle" />
        <div className="avatar-halo">
          <AiAvatar size="large" />
        </div>
        <span className="eyebrow">Your smart setup partner</span>
        <h1>Meet KAROBAAR AI</h1>
        <h2>Your Personal Business Assistant</h2>
        <div className="question">
          <strong>Would you like me to guide you through setting up your business?</strong>
          <span>क्या आप चाहते हैं कि मैं आपका कारोबार शुरू करने में मदद करूँ?</span>
        </div>
        <div className="benefits">
          {[
            "I'll explain every step",
            "I'll help you fill information",
            "I'll guide document verification",
          ].map((x) => (
            <div key={x}>
              <span>
                <Icon name="check" size={14} />
              </span>
              {x}
            </div>
          ))}
        </div>
        <Button onClick={() => choose(true)}>
          <Icon name="mic" size={18} /> Yes, Guide Me
        </Button>
        <Button variant="secondary" onClick={() => choose(false)}>
          No, I'll Do It Myself
        </Button>
        <small>You can enable AI assistance anytime.</small>
      </section>
    </div>
  );
}

function MethodCard({ type, onClick }: { type: "digi" | "manual"; onClick: () => void }) {
  const digi = type === "digi";
  return (
    <article className={`method-card ${digi ? "recommended" : ""}`}>
      {digi && <span className="recommend-badge">Recommended</span>}
      <div className={`method-icon ${type}`}>
        {digi ? (
          <>
            <Icon name="document" size={31} />
            <span>
              <Icon name="lock" size={13} />
            </span>
          </>
        ) : (
          <>
            <Icon name="upload" size={31} />
            <i />
          </>
        )}
      </div>
      <div className="method-copy">
        <h3>{digi ? "Verify with DigiLocker" : "Upload Documents Manually"}</h3>
        <h4>{digi ? "DigiLocker से सत्यापन करें" : "दस्तावेज़ खुद अपलोड करें"}</h4>
        <p>
          {digi
            ? "Securely retrieve available documents with your permission."
            : "Take photographs or upload existing documents from your device."}
        </p>
      </div>
      <button className={digi ? "card-cta" : "card-cta outline"} onClick={onClick}>
        {digi ? "Continue with DigiLocker" : "Upload Documents"}
        <Icon name="chevron" size={17} />
      </button>
      {digi && (
        <small>
          <Icon name="check" size={13} /> Fast, secure and less manual work
        </small>
      )}
    </article>
  );
}

function Methods({
  back,
  openDigi,
  openManual,
  aiEnabled,
  openAi,
  onSkip,
}: {
  back: () => void;
  openDigi: () => void;
  openManual: () => void;
  aiEnabled: boolean;
  openAi: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={1} onSkip={onSkip} />
      <main className="content">
        <ScreenTitle
          title="Verify Your Business"
          hindi="अपने कारोबार को सत्यापित करें।"
          description="Choose an easy way to verify your business and continue setting up your online shop."
        />
        {aiEnabled && (
          <div className="ai-tip">
            <AiAvatar />
            <p>
              <strong>I'm here to help</strong>
              <span>DigiLocker is usually the fastest option.</span>
            </p>
            <button onClick={openAi}>
              <Icon name="volume" size={18} />
            </button>
          </div>
        )}
        <div className="method-list">
          <MethodCard type="digi" onClick={openDigi} />
          <div className="or">
            <span>OR</span>
          </div>
          <MethodCard type="manual" onClick={openManual} />
        </div>
        <SecurityNote />
      </main>
      {aiEnabled && <AiOrb onClick={openAi} pulse />}
    </div>
  );
}

function DigiLocker({
  back,
  connect,
  other,
  aiEnabled,
  openAi,
}: {
  back: () => void;
  connect: () => void;
  other: () => void;
  aiEnabled: boolean;
  openAi: () => void;
}) {
  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={1} />
      <main className="content digi-content">
        <div className="digi-illustration">
          <span className="cloud cloud-one" />
          <span className="cloud cloud-two" />
          <div className="locker">
            <Icon name="document" size={45} />
            <div>
              <Icon name="lock" size={24} />
            </div>
          </div>
          <div className="connection-dots">
            <i />
            <i />
            <i />
          </div>
          <div className="karobaar-shield">
            <Icon name="shield" size={35} />
          </div>
        </div>
        <ScreenTitle
          eyebrow="Secure connection"
          title="Connect Your DigiLocker"
          description="Allow KAROBAAR to securely retrieve your eligible documents with your consent."
        />
        <div className="consent-card">
          <h3>
            <Icon name="lock" size={20} /> You're always in control
          </h3>
          <ul>
            <li>
              <span>1</span> You'll continue on the official DigiLocker website.
            </li>
            <li>
              <span>2</span> You choose which documents to share.
            </li>
            <li>
              <span>3</span> We never see or store your DigiLocker password.
            </li>
          </ul>
        </div>
        <div className="button-stack">
          <Button onClick={connect}>
            Connect DigiLocker <Icon name="arrow-right" size={18} />
          </Button>
          <Button variant="secondary" onClick={other}>
            Choose Another Method
          </Button>
        </div>
        <p className="consent-foot">
          <Icon name="shield" size={16} /> By continuing, you consent only to retrieving documents
          you approve.
        </p>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
    </div>
  );
}

function Retrieving({ complete }: { complete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(complete, 2300);
    return () => clearTimeout(timer);
  }, [complete]);
  return (
    <div className="screen retrieval-screen">
      <Brand />
      <div className="retrieval-animation">
        <div className="spin-ring" />
        <div className="retrieval-doc">
          <Icon name="document" size={38} />
        </div>
        <span className="secure-pill">
          <Icon name="lock" size={13} /> Secure
        </span>
      </div>
      <h1>Retrieving your documents…</h1>
      <p>
        We're securely collecting the documents
        <br />
        you approved in DigiLocker.
      </p>
      <div className="retrieval-steps">
        <span className="done">
          <Icon name="check" size={13} /> Permission received
        </span>
        <span className="active">
          <i /> Fetching documents
        </span>
        <span>
          <i /> Preparing preview
        </span>
      </div>
      <small>Please don't close this window</small>
    </div>
  );
}

function DocPreview({ kind }: { kind: "pan" | "udyam" }) {
  return (
    <div className={`doc-preview ${kind}`}>
      <span>भारत सरकार</span>
      <b>{kind === "pan" ? "INCOME TAX DEPARTMENT" : "UDYAM REGISTRATION"}</b>
      <i />
      <i />
      <i />
    </div>
  );
}

function Documents({
  back,
  next,
  aiEnabled,
  openAi,
}: {
  back: () => void;
  next: () => void;
  aiEnabled: boolean;
  openAi: () => void;
}) {
  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={2} />
      <main className="content">
        <ScreenTitle
          title="Your Documents"
          hindi="आपके दस्तावेज़"
          description="We found 2 documents in your DigiLocker. Review them before continuing."
        />
        <div className="document-list">
          <article className="retrieved-card">
            <DocPreview kind="pan" />
            <div>
              <span className="verified-label">
                <Icon name="check" size={12} /> Retrieved
              </span>
              <h3>PAN Card</h3>
              <p>Income Tax Department</p>
              <small>ABCDE••••F</small>
            </div>
            <button aria-label="Document details">
              <Icon name="chevron" size={18} />
            </button>
          </article>
          <article className="retrieved-card">
            <DocPreview kind="udyam" />
            <div>
              <span className="pending-label">Ready to review</span>
              <h3>Udyam Certificate</h3>
              <p>Ministry of MSME</p>
              <small>UDYAM-MH-••-•••••••</small>
            </div>
            <button aria-label="Document details">
              <Icon name="chevron" size={18} />
            </button>
          </article>
        </div>
        <div className="info-banner">
          <span>i</span>
          <p>
            Retrieved documents still need to be reviewed. This does not mean your business is
            verified yet.
          </p>
        </div>
        <div className="sticky-actions">
          <Button variant="secondary">Review Details</Button>
          <Button onClick={next} icon="arrow-right">
            Continue
          </Button>
        </div>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
    </div>
  );
}

const uploadOptions = [
  { name: "PAN Document", desc: "Owner or business PAN", required: "Required" },
  {
    name: "Business Registration Proof",
    desc: "Shop Act, trade licence or accepted proof",
    required: "Required",
  },
  {
    name: "GST Certificate",
    desc: "Only if your business is GST registered",
    required: "If applicable",
  },
  { name: "Udyam Certificate", desc: "For Udyam-registered businesses", required: "If applicable" },
];

function Manual({
  back,
  openCamera,
  next,
  aiEnabled,
  openAi,
}: {
  back: () => void;
  openCamera: () => void;
  next: () => void;
  aiEnabled: boolean;
  openAi: () => void;
}) {
  const [uploaded, setUploaded] = useState<string[]>(["PAN Document"]);
  const toggleUpload = (name: string) =>
    setUploaded((current) =>
      current.includes(name) ? current.filter((x) => x !== name) : [...current, name],
    );
  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={1} />
      <main className="content manual-content">
        <ScreenTitle
          title="Upload Business Documents"
          hindi="अपने व्यवसाय के दस्तावेज़ अपलोड करें।"
          description="Upload only the documents that apply to your business."
        />
        <div className="upload-count">
          <span>
            <b>{uploaded.length}</b> of 2 required uploaded
          </span>
          <div>
            <i style={{ width: `${Math.min((uploaded.length / 2) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="upload-list">
          {uploadOptions.map((doc) => {
            const isUploaded = uploaded.includes(doc.name);
            return (
              <article className={`upload-card ${isUploaded ? "uploaded" : ""}`} key={doc.name}>
                <div className="upload-card-head">
                  <span className="file-icon">
                    {isUploaded ? (
                      <Icon name="check" size={18} />
                    ) : (
                      <Icon name="document" size={20} />
                    )}
                  </span>
                  <div>
                    <h3>{doc.name}</h3>
                    <p>{doc.desc}</p>
                  </div>
                  <em>{doc.required}</em>
                </div>
                {isUploaded ? (
                  <div className="uploaded-file">
                    <div className="mini-preview">PDF</div>
                    <p>
                      <strong>
                        {doc.name === "PAN Document" ? "PAN_card.pdf" : "document.pdf"}
                      </strong>
                      <span>1 page · 1.2 MB · Ready</span>
                    </p>
                    <button aria-label="Preview">
                      <Icon name="chevron" size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-buttons">
                    <button onClick={openCamera}>
                      <Icon name="camera" size={17} /> Take Photo
                    </button>
                    <button onClick={() => toggleUpload(doc.name)}>
                      <Icon name="upload" size={17} /> Upload PDF
                    </button>
                  </div>
                )}
                {isUploaded && (
                  <div className="file-actions">
                    <button onClick={openCamera}>
                      <Icon name="edit" size={15} /> Replace
                    </button>
                    <button onClick={() => toggleUpload(doc.name)}>
                      <Icon name="trash" size={15} /> Remove
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <div className="sticky-actions single">
          <Button onClick={next} disabled={uploaded.length < 2}>
            Submit for Verification <Icon name="arrow-right" size={18} />
          </Button>
          <small>You can add optional documents later</small>
        </div>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
    </div>
  );
}

function Camera({
  back,
  usePhoto,
  aiEnabled,
}: {
  back: () => void;
  usePhoto: () => void;
  aiEnabled: boolean;
}) {
  const [captured, setCaptured] = useState(false);
  return (
    <div className="screen camera-screen">
      <header className="camera-header">
        <button onClick={back}>
          <Icon name="close" />
        </button>
        <div>
          <strong>{captured ? "Review Photo" : "Capture PAN Document"}</strong>
          <span>{captured ? "Check clarity before using" : "Front side"}</span>
        </div>
        <button>
          <Icon name="flash" />
        </button>
      </header>
      <div className={`camera-preview ${captured ? "captured" : ""}`}>
        <div className="camera-texture" />
        {captured ? (
          <div className="captured-document">
            <DocPreview kind="pan" />
            <span>ABCDE1234F</span>
            <i />
          </div>
        ) : (
          <div className="alignment-frame">
            <i />
            <i />
            <i />
            <i />
            <span>Align document within the frame</span>
          </div>
        )}
        <div className="quality-pill">
          <Icon name="check" size={14} /> {captured ? "Image is clear" : "Good lighting detected"}
        </div>
      </div>
      {aiEnabled && (
        <div className="camera-ai">
          <AiAvatar />
          <p>Keep your document inside the frame and make sure all text is clearly visible.</p>
        </div>
      )}
      <div className="camera-controls">
        {!captured ? (
          <>
            <button className="gallery-button">
              <Icon name="gallery" />
              <span>Gallery</span>
            </button>
            <button className="capture-button" onClick={() => setCaptured(true)}>
              <span />
            </button>
            <div className="control-spacer" />
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setCaptured(false)}>
              <Icon name="refresh" size={18} /> Retake
            </Button>
            <Button onClick={usePhoto}>
              Use Photo <Icon name="check" size={18} />
            </Button>
          </>
        )}
      </div>
      <p className="auto-crop">Automatic crop &amp; quality check enabled</p>
    </div>
  );
}

function Review({
  back,
  next,
  aiEnabled,
  openAi,
  merchantFields,
}: {
  back: () => void;
  next: () => void;
  aiEnabled: boolean;
  openAi: () => void;
  merchantFields: Array<{ label: string; value: string; source: string; state: string }>;
}) {
  const [fields, setFields] = useState(merchantFields);
  const [editing, setEditing] = useState(false);

  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={2} />
      <main className="content review-content">
        <ScreenTitle
          title="Review Your Business Details"
          hindi="अपने कारोबार की जानकारी जाँचें।"
          description="We've filled these details from your registration. Please check that everything is correct."
        />
        {aiEnabled && (
          <div className="ai-tip highlight">
            <AiAvatar />
            <p>
              <strong>I found these details</strong>
              <span>Please check the highlighted address.</span>
            </p>
            <button onClick={openAi}>
              <Icon name="volume" size={18} />
            </button>
          </div>
        )}
        <div className="legend">
          <span>
            <i className="blue" /> Confirmed detail
          </span>
          <span>
            <i className="amber" /> Verified registration
          </span>
        </div>
        <div className="field-list">
          {fields.map((field, idx) => (
            <label className={`field ${field.state}`} key={field.label}>
              <span>
                {field.label}
                <em>{field.source}</em>
              </span>
              {editing ? (
                <textarea
                  value={field.value}
                  onChange={(e) => {
                    const updated = [...fields];
                    updated[idx].value = e.target.value;
                    setFields(updated);
                  }}
                  rows={field.label === "Business address" ? 2 : 1}
                />
              ) : (
                <strong>{field.value}</strong>
              )}
              <button onClick={() => setEditing(true)} aria-label={`Edit ${field.label}`}>
                <Icon name="edit" size={16} />
              </button>
              {field.state === "review" && (
                <small>Please confirm this address matches your shop.</small>
              )}
            </label>
          ))}
        </div>
        <div className="sticky-actions">
          <Button variant="secondary" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel Editing" : "Edit Information"}
          </Button>
          <Button onClick={next}>
            {editing ? "Save & Continue" : "Confirm Details"} <Icon name="check" size={18} />
          </Button>
        </div>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
    </div>
  );
}

function Submit({
  back,
  submit,
  method,
  aiEnabled,
  openAi,
}: {
  back: () => void;
  submit: () => void;
  method: "DigiLocker" | "Manual upload";
  aiEnabled: boolean;
  openAi: () => void;
}) {
  const [dialog, setDialog] = useState(false);
  return (
    <div className="screen scroll-screen">
      <Header onBack={back} step={3} />
      <main className="content submit-content">
        <div className="ready-icon">
          <Icon name="document" size={36} />
          <span>
            <Icon name="check" size={18} />
          </span>
        </div>
        <ScreenTitle
          title="Ready to Submit?"
          hindi="जमा करने के लिए तैयार हैं?"
          description="Review your verification summary before sending it to our team."
        />
        <section className="summary-card">
          <div>
            <span>Verification method</span>
            <strong>{method}</strong>
            <Icon name="check" size={17} />
          </div>
          <div>
            <span>Documents submitted</span>
            <strong>{method === "DigiLocker" ? "PAN + Udyam Certificate" : "2 documents"}</strong>
            <Icon name="check" size={17} />
          </div>
          <div>
            <span>Business information</span>
            <strong>All details completed</strong>
            <Icon name="check" size={17} />
          </div>
        </section>
        <div className="complete-banner">
          <Icon name="shield" size={22} />
          <p>
            <strong>Everything looks complete</strong>
            <span>No missing requirements found.</span>
          </p>
        </div>
        <div className="button-stack">
          <Button onClick={() => setDialog(true)}>
            Submit for Verification <Icon name="arrow-right" size={18} />
          </Button>
          <Button variant="secondary" onClick={back}>
            Review Documents
          </Button>
        </div>
        <p className="legal-copy">
          By submitting, you confirm the details are accurate and allow KAROBAAR to verify them.
        </p>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
      {dialog && (
        <div className="dialog-layer">
          <div className="dialog">
            <button className="dialog-close" onClick={() => setDialog(false)}>
              <Icon name="close" />
            </button>
            <div className="dialog-icon">
              <Icon name="shield" size={30} />
            </div>
            <h2>Submit for verification?</h2>
            <p>
              Once submitted, you won't be able to change these details until the review is
              complete.
            </p>
            <Button onClick={submit}>Yes, Submit Now</Button>
            <Button variant="text" onClick={() => setDialog(false)}>
              Go Back &amp; Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const statusContent: Record<
  Status,
  { eyebrow: string; title: string; message: string; cta: string; icon: string }
> = {
  pending: {
    eyebrow: "Verification submitted",
    title: "Verification in Progress",
    message:
      "Your documents have been submitted successfully. Your digital dukaan is ready for preview!",
    cta: "Launch My Dukaan Now",
    icon: "clock",
  },
  verified: {
    eyebrow: "Verification complete",
    title: "Business Verified!",
    message: "Your business has been successfully verified. Let's enter your digital shop.",
    cta: "Continue to Merchant Portal",
    icon: "check",
  },
  action: {
    eyebrow: "Action required",
    title: "A Little More Information Needed",
    message:
      "The address on your registration proof is not clearly visible. You can update this later from your store dashboard.",
    cta: "Continue to Merchant Portal",
    icon: "info",
  },
  rejected: {
    eyebrow: "Notice",
    title: "Application Under Review",
    message:
      "Your documents are currently being checked by our merchant team. You can continue setting up your inventory.",
    cta: "Enter Store Dashboard",
    icon: "close",
  },
};

function StatusScreen({
  status,
  setStatus,
  aiEnabled,
  openAi,
  onComplete,
  storeName,
  location,
}: {
  status: Status;
  setStatus: (x: Status) => void;
  aiEnabled: boolean;
  openAi: () => void;
  onComplete: () => void;
  storeName?: string;
  location?: string;
}) {
  const data = statusContent[status];
  return (
    <div className={`screen status-screen status-${status}`}>
      <header className="status-header">
        <Brand />
        <button className="icon-button" onClick={onComplete} title="Enter Dashboard">
          <Icon name="arrow-right" />
        </button>
      </header>
      <main>
        <div className={`status-illustration ${data.icon}`}>
          <div className="status-rings">
            <span />
            <span />
          </div>
          <div className="status-symbol">
            {status === "pending" ? (
              <div className="clock-face">
                <i />
                <b />
              </div>
            ) : (
              <Icon
                name={data.icon === "info" ? "more" : (data.icon as IconName)}
                size={40}
                strokeWidth={2.5}
              />
            )}
          </div>
        </div>
        <span className="eyebrow">{data.eyebrow}</span>
        <h1>{data.title}</h1>
        <p>{data.message}</p>
        {status === "pending" && (
          <div className="timeline-card">
            <div className="done">
              <i>
                <Icon name="check" size={12} />
              </i>
              <p>
                <strong>Documents submitted</strong>
                <span>Just now</span>
              </p>
            </div>
            <div className="active">
              <i />
              <p>
                <strong>Review in progress</strong>
                <span>AI verifying business profile</span>
              </p>
            </div>
            <div>
              <i />
              <p>
                <strong>Instant access</strong>
                <span>Store dashboard unlocked</span>
              </p>
            </div>
          </div>
        )}
        {(status === "verified" || status === "pending") && (
          <div className="verified-card">
            <Icon name="shield" size={27} />
            <p>
              <strong>{storeName || "Rajesh Kirana & Store"}</strong>
              <span>Verified merchant · {location || "Indiranagar, Bengaluru"}</span>
            </p>
          </div>
        )}
        {(status === "action" || status === "rejected") && (
          <div className="reason-card">
            <strong>{status === "action" ? "What you need to do" : "Reason"}</strong>
            <p>
              {status === "action"
                ? "Retake the photo in good light and keep all four corners visible."
                : "The document is undergoing manual verification."}
            </p>
          </div>
        )}
        <Button onClick={onComplete}>
          {data.cta} <Icon name="arrow-right" size={18} />
        </Button>
        <div className="status-switcher" aria-label="Preview status variations">
          {(["pending", "verified", "action", "rejected"] as Status[]).map((x) => (
            <button className={status === x ? "active" : ""} onClick={() => setStatus(x)} key={x}>
              {x === "action" ? "Action needed" : x}
            </button>
          ))}
        </div>
      </main>
      {aiEnabled && <AiOrb onClick={openAi} />}
    </div>
  );
}

const aiMessages: Record<Screen, string> = {
  otp: "Your mobile number is verified. Tap Continue and I can help you with business setup.",
  "ai-intro": "I can explain every step in simple Hindi or English.",
  methods:
    "Here you can use DigiLocker or upload documents manually. DigiLocker is usually easier.",
  digilocker:
    "Tap Connect DigiLocker. You'll go to the official authorization page and choose what to share.",
  retrieving: "Your approved documents are being securely retrieved.",
  documents: "I found two documents. Please review them before continuing.",
  manual: "Upload your applicable registration document. You can take a photo or choose a PDF.",
  camera: "Keep your document inside the frame and make sure all text is clearly visible.",
  review:
    "I found your business name in the document. Please confirm whether this information is correct.",
  submit: "Everything is complete. I'll ask your permission before the final submission.",
  status: "Your verification is in progress. I'll let you know when the status changes.",
};

function AiSheet({ screen, close }: { screen: Screen; close: () => void }) {
  const [mode, setMode] = useState<"speaking" | "listening" | "idle">("speaking");
  const [lang, setLang] = useState("हिंदी + EN");
  return (
    <div className="sheet-layer" onClick={close}>
      <section className="ai-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle" />
        <header>
          <div className="assistant-name">
            <AiAvatar />
            <p>
              <strong>KAROBAAR AI</strong>
              <span>
                <i />{" "}
                {mode === "listening"
                  ? "Listening…"
                  : mode === "speaking"
                    ? "Speaking…"
                    : "Ready to help"}
              </span>
            </p>
          </div>
          <div>
            <button
              className="language"
              onClick={() =>
                setLang(
                  lang === "हिंदी + EN" ? "मराठी" : lang === "मराठी" ? "Hinglish" : "हिंदी + EN",
                )
              }
            >
              {lang}
            </button>
            <button onClick={close} aria-label="Close assistant">
              <Icon name="close" />
            </button>
          </div>
        </header>
        <div className="waveform">
          {[12, 24, 18, 34, 25, 40, 18, 30, 14, 26, 16, 32, 20].map((height, i) => (
            <i style={{ height: mode === "idle" ? 5 : height }} key={i} />
          ))}
        </div>
        <div className="ai-bubble">
          <span>On this screen</span>
          <p>{aiMessages[screen]}</p>
        </div>
        <div className="suggestions">
          <button>Explain in Hindi</button>
          <button>What do I need?</button>
        </div>
        <div className="voice-controls">
          <button className="round-control">
            <Icon name="volume" />
          </button>
          <button
            className={`main-mic ${mode === "listening" ? "listening" : ""}`}
            onClick={() => setMode(mode === "listening" ? "speaking" : "listening")}
          >
            <Icon name={mode === "listening" ? "more" : "mic"} size={28} />
            <span>{mode === "listening" ? "Tap to stop" : "Tap to speak"}</span>
          </button>
          <button className="round-control" onClick={() => setMode("idle")}>
            <Icon name="close" />
          </button>
        </div>
        <p className="permission-note">
          <Icon name="shield" size={14} /> I'll always ask before filling fields or submitting
          anything.
        </p>
      </section>
    </div>
  );
}

/* ──────────── Root Merchant Onboarding Component ──────────── */
export interface MerchantOnboardingProps {
  session: UserSession;
  onComplete: () => void;
  onSkip?: () => void;
}

export const MerchantOnboarding: React.FC<MerchantOnboardingProps> = ({
  session,
  onComplete,
  onSkip,
}) => {
  const [screen, setScreen] = useState<Screen>("otp");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [method, setMethod] = useState<"DigiLocker" | "Manual upload">("DigiLocker");
  const [status, setStatus] = useState<Status>("pending");

  const merchantFields = useMemo(
    () => [
      {
        label: "Owner name",
        value: session.name || "Rajesh Kumar",
        source: "From PAN",
        state: "ok",
      },
      {
        label: "Business name",
        value: session.storeName || "Rajesh Kirana & Store",
        source: "From Udyam",
        state: "ok",
      },
      {
        label: "PAN number",
        value: "ABCDE •••• F",
        source: "From PAN",
        state: "ok",
      },
      {
        label: "Registration number",
        value: "UDYAM-MH-12-0098241",
        source: "From Udyam",
        state: "ok",
      },
      {
        label: "Business address",
        value: session.location || "Indiranagar, Bengaluru – 560038",
        source: "Needs your review",
        state: "review",
      },
    ],
    [session]
  );

  const goBack = () => {
    const customBack: Partial<Record<Screen, Screen>> = {
      methods: "ai-intro",
      digilocker: "methods",
      documents: "digilocker",
      manual: "methods",
      camera: "manual",
      review: method === "DigiLocker" ? "documents" : "manual",
      submit: "review",
    };
    setScreen(customBack[screen] ?? "methods");
  };

  const content = useMemo(() => {
    const common = { aiEnabled, openAi: () => setAiOpen(true) };
    switch (screen) {
      case "otp":
        return <OtpSuccess next={() => setScreen("ai-intro")} phone={session.phone} />;
      case "ai-intro":
        return (
          <AiIntro
            choose={(enabled) => {
              setAiEnabled(enabled);
              setScreen("methods");
            }}
          />
        );
      case "methods":
        return (
          <Methods
            back={goBack}
            openDigi={() => {
              setMethod("DigiLocker");
              setScreen("digilocker");
            }}
            openManual={() => {
              setMethod("Manual upload");
              setScreen("manual");
            }}
            onSkip={onSkip || onComplete}
            {...common}
          />
        );
      case "digilocker":
        return (
          <DigiLocker
            back={goBack}
            connect={() => setScreen("retrieving")}
            other={() => setScreen("methods")}
            {...common}
          />
        );
      case "retrieving":
        return <Retrieving complete={() => setScreen("documents")} />;
      case "documents":
        return <Documents back={goBack} next={() => setScreen("review")} {...common} />;
      case "manual":
        return (
          <Manual
            back={goBack}
            openCamera={() => setScreen("camera")}
            next={() => setScreen("review")}
            {...common}
          />
        );
      case "camera":
        return <Camera back={goBack} usePhoto={() => setScreen("manual")} aiEnabled={aiEnabled} />;
      case "review":
        return (
          <Review
            back={goBack}
            next={() => setScreen("submit")}
            merchantFields={merchantFields}
            {...common}
          />
        );
      case "submit":
        return (
          <Submit back={goBack} submit={() => setScreen("status")} method={method} {...common} />
        );
      case "status":
        return (
          <StatusScreen
            status={status}
            setStatus={setStatus}
            onComplete={onComplete}
            storeName={session.storeName}
            location={session.location}
            {...common}
          />
        );
    }
  }, [screen, aiEnabled, method, status, session, merchantFields, onComplete, onSkip]);

  const initials = (session.name || "Rajesh").substring(0, 2).toUpperCase();

  return (
    <div className="merchant-onboarding-container">
      <div className="app-shell">
        <aside className="desktop-context">
          <div className="desktop-brand">
            <Brand />
            <button
              className="sidebar-collapse"
              aria-label="Skip to store"
              onClick={onSkip || onComplete}
              title="Skip to Dashboard"
            >
              <Icon name="arrow-right" size={17} />
            </button>
          </div>
          <div className="merchant-welcome">
            <div className="merchant-avatar">{initials}</div>
            <div>
              <span>Welcome, {session.name || "Merchant"}</span>
              <strong>Let's set up your business</strong>
            </div>
          </div>
          <div className="desktop-progress">
            <div>
              <span>Onboarding progress</span>
              <strong>{screen === "status" ? "100%" : screen === "otp" ? "20%" : "60%"}</strong>
            </div>
            <i>
              <b
                style={{
                  width: screen === "status" ? "100%" : screen === "otp" ? "20%" : "60%",
                }}
              />
            </i>
          </div>
          <nav aria-label="Onboarding screens">
            <p>BUSINESS SETUP</p>
            {navOrder
              .filter((x) => !["retrieving", "camera", "ai-intro"].includes(x))
              .map((item, i) => (
                <button
                  key={item}
                  className={screen === item ? "active" : ""}
                  onClick={() => setScreen(item)}
                >
                  <span>
                    {screen === item || navOrder.indexOf(screen) > navOrder.indexOf(item) ? (
                      <Icon name="check" size={13} />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <strong>
                      {item === "otp"
                        ? "Mobile verified"
                        : item === "methods"
                          ? "Verification method"
                          : item === "digilocker"
                            ? "Connect documents"
                            : item === "documents"
                              ? "Your documents"
                              : item === "manual"
                                ? "Upload documents"
                                : item === "review"
                                  ? "Business details"
                                  : item === "submit"
                                    ? "Submit verification"
                                    : "Verification status"}
                    </strong>
                    <small>
                      {item === "otp"
                        ? session.phone || "+91 ••••• ••482"
                        : item === "status"
                          ? "Track your application"
                          : `Step ${i + 1} of 8`}
                    </small>
                  </div>
                </button>
              ))}
          </nav>
          <div className="desktop-trust">
            <Icon name="shield" />
            <span>
              <strong>Your data is protected</strong>
              Secure &amp; consent-based verification
            </span>
          </div>
        </aside>
        <div className="device-frame">
          {content}
          {aiOpen && <AiSheet screen={screen} close={() => setAiOpen(false)} />}
        </div>
      </div>
    </div>
  );
};

export default MerchantOnboarding;
