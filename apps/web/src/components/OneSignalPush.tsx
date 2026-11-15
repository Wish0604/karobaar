import React, { useEffect } from "react";

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let scriptInjected = false;

function injectSdk(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptInjected) return resolve();
    scriptInjected = true;
    const w = window as any;
    w.OneSignalDeferred = w.OneSignalDeferred || [];
    const s = document.createElement("script");
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js";
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

/**
 * OneSignal web push. Inert unless VITE_ONESIGNAL_APP_ID is set, so the app
 * runs unchanged before OneSignal keys are configured.
 *
 * Identity: users are logged in to OneSignal with an external id
 * `${role}_${userId}` so the backend can target them individually
 * (e.g. "merchant_biz_1", "customer_u_demo").
 */
export const OneSignalPush: React.FC<{ userId?: string | null; role?: string | null }> = ({ userId, role }) => {
  useEffect(() => {
    if (!APP_ID) return;
    let disposed = false;

    injectSdk().then(async () => {
      if (disposed) return;
      const OneSignal = (window as any).OneSignal;
      if (!OneSignal) return;
      try {
        await OneSignal.init({
          appId: APP_ID,
          // Required while running the dev preview on http://localhost
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/push/onesignal/" },
          notifyButton: { enable: true },
          slidedown: {
            enabled: true,
            prompts: [{ type: "push", autoPrompt: true, text: { message: "Get instant order and stock alerts from KAROBAAR" } }],
          },
        });

        // Deep link: notifications carry data.url — open it on click.
        OneSignal.Notifications.addNotificationClickListener?.((event: any) => {
          const url = event?.notification?.data?.url;
          if (url) window.location.href = url;
        });
      } catch (err) {
        console.warn("[OneSignal] init failed:", err);
      }
    });

    return () => {
      disposed = true;
    };
  }, []);

  // Tag the subscribed device to the logged-in user so backend can target them.
  useEffect(() => {
    if (!APP_ID || !userId || !role) return;
    const externalId = `${role}_${userId}`;
    const timer = window.setInterval(() => {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.User) {
        window.clearInterval(timer);
        try {
          if (OneSignal.User.id !== externalId) {
            OneSignal.User.login(externalId);
          }
        } catch (err) {
          console.warn("[OneSignal] login failed:", err);
        }
      }
    }, 800);
    // stop polling after 20s if SDK never became ready
    const stop = window.setTimeout(() => window.clearInterval(timer), 20000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [userId, role]);

  return null;
};
