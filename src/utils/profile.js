import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseClient";

const DEFAULT_PREFERENCES = {
  wheelchair: false,
  asl: false,
  quiet: false,
  parking: false,
  restroom: false,
  lowVision: false,
  serviceAnimals: false,
};

export async function getUserProfile(uid) {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      accessibility_preferences: DEFAULT_PREFERENCES,
    };
  }

  return snap.data();
}

export async function saveAccessibilityPreferences({ uid, preferences }) {
  if (!uid) throw new Error("Not signed in");

  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      accessibility_preferences: preferences,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );

  return true;
}

export { DEFAULT_PREFERENCES };