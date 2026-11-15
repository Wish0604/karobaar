import React from "react";

export type MascotState = "idle" | "hover" | "listening" | "thinking" | "speaking" | "executing" | "success" | "error";

/**
 * KAROBAAR AI mascot — white round head, noodle limbs, yellow shoes.
 * Live cartoon character: ears pop up in hearing mode, mic held in the right
 * hand (raised to the mouth while listening), mouth talks while speaking,
 * blinks while idle. All emotion is driven by `data-state` + CSS (.kai-m rules).
 */
export function AIMascot({
  state = "idle",
  level = 0,
  size = 64,
  headOnly = false,
}: {
  state?: MascotState;
  level?: number;
  size?: number;
  headOnly?: boolean;
}) {
  const ink = { stroke: "#171717", strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };
  const common = {
    className: "kai-m",
    "data-state": state,
    style: { ["--lv" as any]: level },
    role: "img" as const,
    "aria-label": `KAROBAAR assistant, ${state}`,
  };

  const head = (
    <g className="head">
      {/* cartoon ears — hidden normally, pop up in hearing mode */}
      <g className="ear l">
        <ellipse cx="41" cy="13" rx="6" ry="9" fill="#fff" stroke="#171717" strokeWidth="2.4" transform="rotate(-24 41 13)" />
        <ellipse cx="41.5" cy="13.5" rx="2.6" ry="4.4" fill="#FFC928" transform="rotate(-24 41.5 13.5)" />
      </g>
      <g className="ear r">
        <ellipse cx="79" cy="13" rx="6" ry="9" fill="#fff" stroke="#171717" strokeWidth="2.4" transform="rotate(24 79 13)" />
        <ellipse cx="78.5" cy="13.5" rx="2.6" ry="4.4" fill="#FFC928" transform="rotate(24 78.5 13.5)" />
      </g>
      <circle cx="60" cy="36" r="25" fill="#fff" stroke="#171717" strokeWidth="2.6" />
      <g className="brows"><path d="M49 22 Q53 19 57 22" {...ink} strokeWidth="2" /><path d="M63 22 Q67 19 71 22" {...ink} strokeWidth="2" /></g>
      <g className="eyes"><rect x="51.5" y="27" width="4" height="13" rx="2" fill="#171717" /><rect x="64.5" y="27" width="4" height="13" rx="2" fill="#171717" /></g>
      <path className="mouth" d="M52 47 Q60 53 68 47" {...ink} strokeWidth="2.2" />
    </g>
  );

  if (headOnly) {
    return (
      <svg {...common} viewBox="30 2 60 60" width={size} height={size}>
        {head}
      </svg>
    );
  }

  return (
    <svg {...common} viewBox="0 0 120 140" width={size} height={size * 140 / 120}>
      <ellipse className="shadow" cx="60" cy="134" rx="24" ry="3.5" fill="#000" opacity=".12" />
      <g className="all">
        <path className="leg" d="M60 92 Q48 106 45 122" {...ink} />
        <path className="leg" d="M60 92 Q72 106 77 122" {...ink} />
        <ellipse cx="42" cy="125" rx="9" ry="5" fill="#FFC928" stroke="#171717" strokeWidth="2" />
        <ellipse cx="80" cy="125" rx="9" ry="5" fill="#FFC928" stroke="#171717" strokeWidth="2" />
        <path d="M60 58 L60 92" {...ink} />
        <ellipse cx="60" cy="63" rx="7" ry="2.6" fill="#FFC928" stroke="#171717" strokeWidth="1.6" />
        <g className="arm l"><path d="M60 72 Q44 76 37 92" {...ink} /><circle cx="36" cy="94" r="5.5" fill="#fff" stroke="#171717" strokeWidth="2" /></g>
        <g className="arm r">
          <path d="M60 72 Q76 76 83 92" {...ink} />
          <circle cx="84" cy="94" r="5.5" fill="#fff" stroke="#171717" strokeWidth="2" />
          {/* handheld mic — rides the arm up to the mouth in hearing mode */}
          <g className="mic">
            <path d="M84 94 L90.5 102" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            <circle cx="93.5" cy="106" r="6" fill="#171717" />
            <path d="M89.5 103.5 a6 6 0 0 1 6.5 -2.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".7" />
          </g>
        </g>
        {head}
      </g>
    </svg>
  );
}
