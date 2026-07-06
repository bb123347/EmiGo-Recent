import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseClient";
import { getEventById } from "./events";

export async function saveEvent({ uid, eventId }) {
  if (!uid) throw new Error("Not signed in");
  if (!eventId) throw new Error("Missing event ID");

  await setDoc(doc(db, "users", uid, "saved_events", eventId), {
    event_id: eventId,
    saved_at: serverTimestamp(),
  });
}

export async function unsaveEvent({ uid, eventId }) {
  if (!uid) throw new Error("Not signed in");
  if (!eventId) throw new Error("Missing event ID");

  await deleteDoc(doc(db, "users", uid, "saved_events", eventId));
}

export async function getSavedEventStatus({ uid, eventId }) {
  if (!uid || !eventId) return false;

  const snap = await getDoc(doc(db, "users", uid, "saved_events", eventId));
  return snap.exists();
}

export async function getSavedEventCount({ uid }) {
  if (!uid) return 0;

  const snap = await getCountFromServer(
    collection(db, "users", uid, "saved_events"),
  );

  return snap.data().count || 0;
}

export async function getSavedEvents({ uid }) {
  if (!uid) return [];

  const snapshot = await getDocs(collection(db, "users", uid, "saved_events"));

  const events = await Promise.all(
    snapshot.docs.map(async (savedDoc) => {
      return getEventById(savedDoc.id);
    }),
  );

  return events.filter(Boolean);
}