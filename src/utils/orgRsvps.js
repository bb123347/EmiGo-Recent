import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseClient";

export async function getEventRsvpsForOrganizer({ eventId }) {
  if (!eventId) return [];

  const q = query(
    collectionGroup(db, "rsvps"),
    where("event_id", "==", eventId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}