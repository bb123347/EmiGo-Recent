import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";

export async function uploadImageAsync({ uri, path }) {
  if (!uri) throw new Error("Missing image URI");
  if (!path) throw new Error("Missing upload path");

  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}