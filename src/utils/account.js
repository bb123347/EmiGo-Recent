import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseClient";

export async function getUserAccount(uid) {
  if (!uid) return null;

  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}