import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseClient";

export async function getMyOrganizationEvents({ uid }) {
  if (!uid) return [];

  const q = query(
    collection(db, "events"),
    where("organizer_uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  const events = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  events.sort((a, b) => {
    const aDate = normalizeDate(a.created_at);
    const bDate = normalizeDate(b.created_at);
    return bDate.getTime() - aDate.getTime();
  });

  return events;
}

function normalizeDate(value) {
  if (!value) return new Date(0);
  if (value?.toDate) return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "string") return new Date(value);
  return new Date(0);
}