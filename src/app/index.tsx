import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import useUser from "../utils/auth/useUser";
import { getUserAccount } from "../utils/account";
import { theme } from "../components/theme";

export default function Index() {
  const { data: user, loading } = useUser();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccount() {
      if (loading) return;

      if (!user?.uid) {
        if (mounted) {
          setAccountType(null);
          setCheckingAccount(false);
        }
        return;
      }

      try {
        const account = await getUserAccount(user.uid);
        if (mounted) {
          setAccountType(account?.account_type || "individual");
        }
      } catch (e) {
        console.error("Account check error:", e);
        if (mounted) setAccountType("individual");
      } finally {
        if (mounted) setCheckingAccount(false);
      }
    }

    checkAccount();

    return () => {
      mounted = false;
    };
  }, [user?.uid, loading]);

  if (loading || checkingAccount) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Redirect
      href={accountType === "organization" ? "/(org)/dashboard" : "/(tabs)/events"}
    />
  );
}