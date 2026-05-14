import { Platform } from "react-native";

const TIKTOK_PIXEL_ID = "D82IE4BC77U5JA98659G";

/**
 * Initialize TikTok tracking.
 * - On web: injects the TikTok Pixel script
 * - On native: initializes the TikTok Business SDK (requires custom dev build)
 */
export async function initTikTokTracking() {
  if (Platform.OS === "web") {
    initWebPixel();
  } else {
    await initNativeSDK();
  }
}

/**
 * Track app open event
 */
export async function trackAppOpen() {
  if (Platform.OS === "web") {
    trackWebEvent("ViewContent", { content_name: "app_open" });
  } else {
    try {
      const TiktokSDK = await import("@layers/expo-tiktok-business");
      TiktokSDK.default.trackEvent("LaunchAPP");
    } catch (e) {
      console.log("[TikTok] Native tracking not available:", e);
    }
  }
}

/**
 * Track app install event (call once on first launch)
 */
export async function trackAppInstall() {
  if (Platform.OS === "web") {
    trackWebEvent("CompleteRegistration", { content_name: "app_install" });
  } else {
    try {
      const TiktokSDK = await import("@layers/expo-tiktok-business");
      TiktokSDK.default.trackEvent("InstallApp");
    } catch (e) {
      console.log("[TikTok] Native tracking not available:", e);
    }
  }
}

// ---- Web Pixel ----

function initWebPixel() {
  if (Platform.OS !== "web") return;
  try {
    const script = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
        ttq.load('${TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    const scriptEl = document.createElement("script");
    scriptEl.innerHTML = script;
    document.head.appendChild(scriptEl);
    console.log("[TikTok] Web Pixel initialized:", TIKTOK_PIXEL_ID);
  } catch (e) {
    console.log("[TikTok] Web Pixel init error:", e);
  }
}

function trackWebEvent(eventName: string, params?: Record<string, any>) {
  if (Platform.OS !== "web") return;
  try {
    const w = window as any;
    if (w.ttq) {
      w.ttq.track(eventName, params);
      console.log("[TikTok] Web event tracked:", eventName);
    }
  } catch (e) {
    console.log("[TikTok] Web event error:", e);
  }
}

// ---- Native SDK ----

async function initNativeSDK() {
  try {
    const TiktokSDK = await import("@layers/expo-tiktok-business");
    await TiktokSDK.default.initialize(
      {
        ios: "com.opticalrxnow.mobile.v1",
        android: "com.opticalrxnow.mobile.v1",
      },
      {
        ios: TIKTOK_PIXEL_ID,
        android: TIKTOK_PIXEL_ID,
      },
      {
        debugMode: __DEV__,
      }
    );
    console.log("[TikTok] Native SDK initialized");
  } catch (e) {
    console.log("[TikTok] Native SDK not available (expected in Expo Go):", e);
  }
}
