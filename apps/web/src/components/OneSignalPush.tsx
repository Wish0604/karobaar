import React, { useEffect } from "react";

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

type OneSignalApi = any;

let scriptInjected = false;
let sdkReady = false;
let pendingExternalId: string | null = null;
let oneSignalApi: OneSignalApi | null = null;

/** Canonical v16 boot: queue a callback BEFORE loading the stub — the SDK
 *  executes it exactly when it is ready, so init/login never race. */
function bootSdk() {
  if (scriptInjected || !APP_ID) return;
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

      // Deep link: notifications carry data.url — open it on click.
      OneSignal.Notifications.addNotificationClickListener?.((event: any) => {
        const url = event?.notification?.launchURL || event?.notification?.url || event?.notification?.data?.url;
        if (url) window.location.href = url;
      });

      sdkReady = true;
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
  useEffect(() => {
    if (!APP_ID) return;
    bootSdk();
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

  return null;
};
