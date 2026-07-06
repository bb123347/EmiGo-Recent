import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";

export default function useUser() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setData(user || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user: data,
    data,
    loading,
    refetch: async () => data,
  };
}