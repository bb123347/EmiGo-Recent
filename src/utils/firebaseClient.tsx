import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Surface a missing/empty config early and loudly rather than failing silently
// later. EXPO_PUBLIC_* values are inlined at build time — if they weren't set
// for the build, this will show up in the device logs.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "[firebaseClient] Firebase config is missing. EXPO_PUBLIC_FIREBASE_* env vars were not inlined into this build.",
    { hasApiKey: !!firebaseConfig.apiKey, projectId: firebaseConfig.projectId }
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Persist auth on device. `initializeAuth` throws if auth was already
// initialized (e.g. after a fast refresh), so fall back to `getAuth`.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  console.warn("[firebaseClient] initializeAuth failed, falling back to getAuth:", error);
  _auth = getAuth(app);
}
export const auth = _auth;

export const db = getFirestore(app);
export const storage = getStorage(app);
