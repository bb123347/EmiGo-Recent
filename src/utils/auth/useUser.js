import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";

export default function useUser() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    const finish = (user) => {
      settled = true;
      setData(user || null);
      setLoading(false);
    };

    // Fallback: if Firebase Auth never emits an initial state (e.g. the
    // native persistence layer fails to resolve in a release build), don't
    // hang forever on the loading screen — treat the user as signed out so
    // the app can at least render the sign-in flow.
    const timeout = setTimeout(() => {
      if (!settled) {
        console.warn("[useUser] onAuthStateChanged did not fire within 8s; treating as signed out");
        finish(null);
      }
    }, 8000);

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => finish(user),
        (error) => {
          console.error("[useUser] onAuthStateChanged error:", error);
          finish(null);
        }
      );
    } catch (error) {
      console.error("[useUser] failed to subscribe to auth state:", error);
      finish(null);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return {
    user: data,
    data,
    loading,
    refetch: async () => data,
  };
}
