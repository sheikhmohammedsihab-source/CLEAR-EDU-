import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";

// Exact Firebase Web configuration provided by CLEAR EDU specification
export const firebaseConfig = {
  apiKey: "AIzaSyDSlRSRkuBEgCrH4DWZLNRhfxZLgCjudyM",
  authDomain: "clear-edu.firebaseapp.com",
  databaseURL: "https://clear-edu-default-rtdb.firebaseio.com",
  projectId: "clear-edu",
  storageBucket: "clear-edu.firebasestorage.app",
  messagingSenderId: "934791380828",
  appId: "1:934791380828:web:459f21392183a5c0cdcb99"
};

// Initialize Firebase app safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Realtime Database
export const auth = getAuth(app);
export const database = getDatabase(app);

// Initialize Firebase App Check for production / development
let appCheckInstance: AppCheck | null = null;

export function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  try {
    // Check if debug token is enabled in localhost / dev
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN as string) || true;
    }

    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
    if (recaptchaSiteKey) {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err) {
    console.info('App Check initialization note: Recaptcha site key not set in environment or debug mode active.');
  }

  return appCheckInstance;
}

export default app;
