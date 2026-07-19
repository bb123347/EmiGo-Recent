import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  // Ensure the native splash is dismissed once the root layout mounts —
  // expo-router's own hideAsync isn't firing reliably in the standalone build.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
