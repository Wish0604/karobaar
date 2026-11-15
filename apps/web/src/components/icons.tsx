import React from "react";

/**
 * Small, consistent stroke icon set replacing emoji across the app.
 * All icons are 24x24 stroke SVGs that inherit text color via currentColor,
 * so they sit naturally inside buttons, nav items, badges and headings.
 */
export type IconName =
  | "chart" | "package" | "bag" | "cart" | "clipboard" | "card" | "users" | "user" | "store"
  | "settings" | "search" | "calendar" | "bell" | "mic" | "micOff" | "bot"
  | "sparkle" | "zap" | "send" | "speaker" | "speakerOff" | "maximize" | "minimize"
  | "x" | "check" | "checkCircle" | "alert" | "ban" | "arrowRight" | "trendingUp"
  | "lightbulb" | "megaphone" | "upload" | "printer" | "receipt" | "camera" | "pen"
  | "link" | "qr" | "smartphone" | "truck" | "palette" | "star" | "heart" | "eye"
  | "lock" | "globe" | "message" | "logout" | "wallet" | "shieldCheck" | "pin"
  | "wheat" | "droplet" | "bowl" | "noodle" | "cookie" | "milk" | "salt" | "soap"
  | "bank" | "download" | "clock" | "move" | "keyboard";

const PATHS: Record<IconName, React.ReactNode> = {
  move: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <polyline points="8 6 12 2 16 6" />
      <polyline points="8 18 12 22 16 18" />
      <polyline points="6 8 2 12 6 16" />
      <polyline points="18 8 22 12 18 16" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="10" x2="6.01" y2="10" />
      <line x1="10" y1="10" x2="10.01" y2="10" />
      <line x1="14" y1="10" x2="14.01" y2="10" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M6 14h12" />
    </>
  ),
  chart: (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </>
  ),
  package: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="11" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  store: (
    <>
      <path d="M3 9.5V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9.5" />
      <path d="M2 5h20l-1.6 4a2.6 2.6 0 0 1-2.4 1.7 2.8 2.8 0 0 1-2.7-1.7 2.8 2.8 0 0 1-2.6 1.7 2.8 2.8 0 0 1-2.6-1.7 2.8 2.8 0 0 1-2.7 1.7 2.8 2.8 0 0 1-2.6-1.7 2.8 2.8 0 0 1-2.7 1.7A2.6 2.6 0 0 1 3.6 9Z" />
      <path d="M9 21v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
    </>
  ),
  settings: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  mic: (
    <>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </>
  ),
  micOff: (
    <>
      <path d="M15 9.5V5a3 3 0 0 0-5.7-1.3" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <path d="M19 10v2a7 7 0 0 1-11 5.7" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V5" />
      <circle cx="12" cy="3.5" r="1.2" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
      <path d="M9.5 17h5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.7 1.5-5.7 1.8L12 18l-1.8-5.7L4.5 10.5 10.2 9Z" />
      <path d="M19 16.5v3" />
      <path d="M17.5 18h3" />
    </>
  ),
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  speaker: (
    <>
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.8 5.8a9.5 9.5 0 0 1 0 12.4" />
    </>
  ),
  speakerOff: (
    <>
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </>
  ),
  maximize: (
    <>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </>
  ),
  minimize: (
    <>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  checkCircle: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  alert: (
    <>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <line x1="5" y1="5" x2="19" y2="19" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  trendingUp: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21.5h4" />
      <path d="M12 2.5a7 7 0 0 0-4.3 12.5c.8.7 1.3 1.8 1.3 3h6c0-1.2.5-2.3 1.3-3A7 7 0 0 0 12 2.5z" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 10.5 17-5.5v14l-17-5.5v-3z" />
      <path d="M11.6 16.9a3 3 0 1 1-5.8-1.7" />
      <path d="M20 5v14" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  printer: (
    <>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 2v20l2.3-1.5L9.6 22l2.4-1.5 2.4 1.5 2.3-1.5L19 22V2l-2.3 1.5L14.4 2 12 3.5 9.6 2 7.3 3.5Z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  pen: (
    <>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3z" />
      <line x1="14" y1="21" x2="14" y2="17.5" />
      <line x1="17.5" y1="21" x2="21" y2="21" />
      <line x1="21" y1="17.5" x2="21" y2="14" />
    </>
  ),
  smartphone: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  truck: (
    <>
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h3" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  palette: (
    <>
      <path d="M12 2A10 10 0 0 0 2 12c0 5.5 4.5 10 10 10a2 2 0 0 0 2-2c0-.9-.4-1.7-.9-2.3-.5-.6-.9-1.3-.9-2.2 0-1.7 1.4-3 3-3h2.8a4 4 0 0 0 3.9-3A10 10 0 0 0 12 2z" />
      <circle cx="7.5" cy="11.5" r="0.6" />
      <circle cx="10.5" cy="7.5" r="0.6" />
      <circle cx="15" cy="7.5" r="0.6" />
    </>
  ),
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  eye: (
    <>
      <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="3.5" y="11" width="17" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" />
      <path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5 14.5 14.5 0 0 1-3.8 9.5 14.5 14.5 0 0 1-3.8-9.5A14.5 14.5 0 0 1 12 2.5z" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0 0 4h16a1.5 1.5 0 0 1 1.5 1.5v9A2 2 0 0 1 19.5 19h-15A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5" />
      <circle cx="16.5" cy="13.5" r="1" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 21.5V8" />
      <path d="M12 8C9.2 8 7 5.8 7 3c2.8 0 5 2.2 5 5z" />
      <path d="M12 8c2.8 0 5-2.2 5-5-2.8 0-5 2.2-5 5z" />
      <path d="M12 14c-2.8 0-5-2.2-5-5 2.8 0 5 2.2 5 5z" />
      <path d="M12 14c2.8 0 5-2.2 5-5-2.8 0-5 2.2-5 5z" />
    </>
  ),
  droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  bowl: (
    <>
      <path d="M4 11h16a1 1 0 0 1 1 1 8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8 1 1 0 0 1 1-1Z" />
      <path d="M9 7c0-1.5.8-2 .8-3" />
      <path d="M14.2 7c0-1.5.8-2 .8-3" />
    </>
  ),
  noodle: (
    <>
      <path d="M4 12h16a1 1 0 0 1 1 1 8 8 0 0 1-8 7h-2a8 8 0 0 1-8-7 1 1 0 0 1 1-1Z" />
      <path d="M8 12V4" />
      <path d="M12 12V3" />
      <path d="M16 12V4" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <line x1="9.5" y1="15" x2="9.51" y2="15" />
      <line x1="14.5" y1="15" x2="14.51" y2="15" />
      <line x1="12" y1="12" x2="12.01" y2="12" />
    </>
  ),
  milk: (
    <>
      <path d="M9.5 2h5v3l2.5 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2.5-4Z" />
      <line x1="7" y1="13" x2="17" y2="13" />
    </>
  ),
  salt: (
    <>
      <path d="M9.5 3h5v4h-5z" />
      <path d="M7.5 21l1-14h7l1 14z" />
      <line x1="10" y1="12" x2="10.01" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
      <line x1="14" y1="12" x2="14.01" y2="12" />
    </>
  ),
  soap: (
    <>
      <rect x="5" y="9" width="14" height="11" rx="3" />
      <path d="M9 9V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V9" />
      <line x1="19.5" y1="4.5" x2="21" y2="3" />
      <line x1="20.5" y1="7" x2="22" y2="6.5" />
    </>
  ),
  bank: (
    <>
      <path d="m3 9.5 9-6.5 9 6.5" />
      <path d="M5 9.5V19" />
      <path d="M12 9.5V19" />
      <path d="M19 9.5V19" />
      <path d="M3 21h18" />
      <path d="M2 9.5h20" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, strokeWidth = 1.8, className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);
