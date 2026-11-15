/**
 * OneSignal web push sender (server-side).
 * No-ops when ONESIGNAL_APP_ID / ONESIGNAL_REST_API_KEY are not set.
 *
 * Users are targeted by OneSignal external ids set from the frontend:
 *   merchant_${businessId}  e.g. merchant_biz_1
 *   customer_${customerId}  e.g. customer_u_demo
 */
const APP_ID = process.env.ONESIGNAL_APP_ID || "";
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY || "";
const WEB_APP_URL = process.env.WEB_APP_URL || "";

export function pushConfigured(): boolean {
  return Boolean(APP_ID && REST_KEY);
}

export interface PushPayload {
  externalIds: string[];
  heading: string;
  content: string;
  url?: string;
  data?: Record<string, unknown>;
}

export async function sendPush(payload: PushPayload): Promise<void> {
  if (!pushConfigured()) {
    console.warn("[onesignal] skipped (ONESIGNAL_APP_ID/REST key not set):", payload.heading);
    return;
  }
  try {
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        include_aliases: { external_id: payload.externalIds },
        target_channel: "push",
        headings: { en: payload.heading },
        contents: { en: payload.content },
        url: payload.url || WEB_APP_URL || undefined,
        data: { ...payload.data, url: payload.url || WEB_APP_URL || undefined },
        web_push_topic: "karobaar",
      }),
    });
    if (!res.ok) {
      console.warn("[onesignal] send failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.warn("[onesignal] send error:", err);
  }
}
