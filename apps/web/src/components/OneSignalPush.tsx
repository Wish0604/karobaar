import React, { useEffect } from "react";

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

type OneSignalApi = any;

let scriptInjected = false;
let sdkReady = false;
let pendingExternalId: string | null = null;
let oneSignalApi: OneSignalApi | null = null;
const readyCallbacks: Array<() => void> = [];

/** Canonical v16 boot: queue a callback BEFORE loading the stub — the SDK
 *  executes it exactly when it is ready, so init/login never race. */
function bootSdk(onReady?: () => void) {
  if (!APP_ID) return;
  if (scriptInjected) {
    if (sdkReady) onReady?.();
    else if (onReady) readyCallbacks.push(onReady);
    return;
  }
  scriptInjected = true;
  const w = window as any;
  w.OneSignalDeferred = w.OneSignalDeferred || [];

  w.OneSignalDeferred.push(async (OneSignal: OneSignalApi) => {
    oneSignalApi = OneSignal;
    try {
      await OneSignal.init({
        appId: APP_ID,
        // Required while running the dev preview on http://localhost
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/push/onesignal/" },
        notifyButton: { enable: true },
        promptOptions: {
          slidedown: {
            enabled: true,
            autoPrompt: true,
            timeDelay: 3,
            text: {
              message: "Get instant order and stock alerts from KAROBAAR",
              acceptButton: "Enable",
              cancelButton: "No thanks",
            },
          },
        },
      });

      // Mark the SDK ready before prompting so a rejected automatic prompt
      // still leaves the explicit in-app permission button available.
      sdkReady = true;
      readyCallbacks.splice(0).forEach((callback) => callback());
      onReady?.();
      try {
        await OneSignal.Slidedown?.promptPush?.();
      } catch (err) {
        console.warn("[OneSignal] automatic prompt unavailable:", err);
      }

      // Deep link: notifications carry data.url — open it on click.
      OneSignal.Notifications.addNotificationClickListener?.((event: any) => {
        const url = event?.notification?.launchURL || event?.notification?.url || event?.notification?.data?.url;
        if (url) window.location.href = url;
      });

      if (pendingExternalId) {
        try {
          OneSignal.User.login(pendingExternalId);
        } catch (err) {
          console.warn("[OneSignal] login failed:", err);
        }
      }
    } catch (err) {
      console.warn("[OneSignal] init failed:", err);
    }
  });

  const s = document.createElement("script");
  s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  s.async = true;
  document.head.appendChild(s);
}

function loginUser(externalId: string) {
  if (sdkReady && oneSignalApi) {
    if (oneSignalApi.User?.externalId !== externalId) {
      try {
        oneSignalApi.User.login(externalId);
      } catch (err) {
        console.warn("[OneSignal] login failed:", err);
      }
    }
  } else {
    pendingExternalId = externalId; // applied by the deferred callback when ready
  }
}

/**
 * OneSignal web push. Inert unless VITE_ONESIGNAL_APP_ID is set, so the app
 * runs unchanged before OneSignal keys are configured.
 *
 * Identity: users are logged in to OneSignal with an external id
 * `${role}_${userId}` so the backend can target them individually
 * (e.g. "merchant_u_demo", "customer_u_demo").
 */
export const OneSignalPush: React.FC<{ userId?: string | null; role?: string | null }> = ({ userId, role }) => {
  const [showEnableButton, setShowEnableButton] = React.useState(false);

  useEffect(() => {
    if (!APP_ID) return;
    bootSdk(() => setShowEnableButton(true));
  }, []);

  // Bind the subscribed device to the logged-in user so the backend can target them.
  useEffect(() => {
    if (!APP_ID) return;
    if (!userId || !role) {
      pendingExternalId = null;
      if (sdkReady && oneSignalApi) oneSignalApi.User?.logout?.();
      return;
    }
    loginUser(`${role}_${userId}`);
  }, [userId, role]);

  if (!APP_ID || !showEnableButton) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await oneSignalApi?.Notifications?.requestPermission?.();
          await oneSignalApi?.Slidedown?.promptPush?.();
          setShowEnableButton(false);
        } catch (err) {
          console.warn("[OneSignal] permission request failed:", err);
        }
      }}
      style={{ position: "fixed", right: 18, bottom: 18, zIndex: 9999, border: 0, borderRadius: 999, padding: "11px 16px", background: "#176b4d", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}
    >
      Enable notifications
    </button>
  );
};
