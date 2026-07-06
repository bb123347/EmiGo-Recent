import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../utils/firebaseClient";
import { theme } from "../../components/theme";
import { getUserAccount } from "../../utils/account";

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
const credential = await signInWithEmailAndPassword(
  auth,
  email.trim(),
  password,
);
      const account = await getUserAccount(credential.user.uid);

      router.replace(
        account?.account_type === "organization"
          ? "/(org)/dashboard"
          : "/(tabs)"
);
    } catch (e: any) {
      setError(e?.message || "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 90,
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 38, fontWeight: "900", color: theme.colors.text }}>
          EmiGo
        </Text>

        <Text
          style={{
            marginTop: 8,
            marginBottom: 28,
            color: theme.colors.secondaryText,
            fontSize: 17,
            lineHeight: 23,
          }}
        >
          Sign in to find accessible experiences with confidence.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.colors.secondaryText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.colors.secondaryText}
          secureTextEntry
          style={inputStyle}
        />

        {!!error && (
          <Text style={{ color: "#D93025", marginBottom: 12, lineHeight: 20 }}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          style={{
            minHeight: 52,
            borderRadius: theme.radius.large,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
              Sign In
            </Text>
          )}
        </Pressable>

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: theme.colors.secondaryText }}>
            New to EmiGo?{" "}
            <Link href="/(auth)/sign-up" style={{ color: theme.colors.primary, fontWeight: "900" }}>
              Create an account
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputStyle: any = {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: "#E8E8E8",
  borderRadius: 18,
  minHeight: 54,
  paddingHorizontal: 16,
  fontSize: 16,
  marginBottom: 12,
  color: "#111",
};