import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseClient";
import { getEventById } from "./events";

export async function rsvpToEvent({
  uid,
  eventId,
  name = "",
  email = "",
  attendeeCount = 1,
  accountType = "individual",
  notes = "",
  accessibilityRequests = [],
}) {
  if (!uid) throw new Error("Not signed in");
  if (!eventId) throw new Error("Missing event ID");

  await setDoc(doc(db, "users", uid, "rsvps", eventId), {
    event_id: eventId,
    user_id: uid,
    attendee_name: name,
    attendee_email: email,
    attendee_count: Number(attendeeCount) || 1,
    account_type: accountType,
    organizer_notes: notes,
    accessibility_requests: accessibilityRequests,
    rsvped_at: serverTimestamp(),
  });
  await updateDoc(
  doc(db, "events", eventId),
  {
    attendee_count: increment(Number(attendeeCount) || 1),
  }
);
}

export async function unRsvpFromEvent({ uid, eventId }) {
  if (!uid) throw new Error("Not signed in");
  if (!eventId) throw new Error("Missing event ID");

  const rsvpRef = doc(db, "users", uid, "rsvps", eventId);
  const rsvpSnap = await getDoc(rsvpRef);

  const attendeeCount = rsvpSnap.exists()
    ? Number(rsvpSnap.data()?.attendee_count || 1)
    : 1;

  await deleteDoc(rsvpRef);

  await updateDoc(doc(db, "events", eventId), {
    attendee_count: increment(-attendeeCount),
  });
}
export async function getMyRsvpStatus({ uid, eventId }) {
  if (!uid || !eventId) return false;

  const snap = await getDoc(doc(db, "users", uid, "rsvps", eventId));
  return snap.exists();
}

export async function getMyRsvpCount({ uid }) {
  if (!uid) return 0;

  const snap = await getCountFromServer(
    collection(db, "users", uid, "rsvps")
  );

  return snap.data().count || 0;
}

export async function getMyRsvps({ uid }) {
  if (!uid) return [];

  const snapshot = await getDocs(
    collection(db, "users", uid, "rsvps")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getUpcomingEvents({ uid }) {
  if (!uid) return [];

  const snapshot = await getDocs(
    collection(db, "users", uid, "rsvps")
  );

  const events = await Promise.all(
    snapshot.docs.map(async (doc) => {
      return getEventById(doc.id);
    }),
  );

  return events
    .filter(Boolean)
    .sort((a, b) => {
      const aDate =
        a.start_datetime?.toDate?.() ??
        new Date(a.start_datetime);

      const bDate =
        b.start_datetime?.toDate?.() ??
        new Date(b.start_datetime);

      return aDate - bDate;
    });
}