import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../utils/firebaseClient";
import { theme } from "../../components/theme";
import { DEFAULT_PREFERENCES } from "../../utils/profile";

export default function SignUpScreen() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"individual" | "organization">("individual");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [memberCount, setMemberCount] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (accountType === "organization" && !orgName.trim()) {
      setError("Organization name is required.");
      return;
    }

    try {
      setLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const displayName =
        accountType === "organization" ? orgName.trim() : name.trim();

      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          email: credential.user.email,
          displayName,
          account_type: accountType,
          accessibility_preferences: DEFAULT_PREFERENCES,
          organization:
            accountType === "organization"
              ? {
                  name: orgName.trim(),
                  type: orgType.trim(),
                  address: orgAddress.trim(),
                  contact_person: contactPerson.trim(),
                  phone: phone.trim(),
                  member_count: memberCount ? Number(memberCount) : null,
                  verified: false,
                }
              : null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <Text style={{ fontSize: 38, fontWeight: "900", color: theme.colors.text }}>
          Create Account
        </Text>

        <Text
          style={{
            marginTop: 8,
            marginBottom: 22,
            color: theme.colors.secondaryText,
            fontSize: 17,
            lineHeight: 23,
          }}
        >
          Join EmiGo as an individual or organization.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          <AccountTypeButton
            title="👤 Individual"
            selected={accountType === "individual"}
            onPress={() => setAccountType("individual")}
          />
          <AccountTypeButton
            title="🏢 Organization"
            selected={accountType === "organization"}
            onPress={() => setAccountType("organization")}
          />
        </View>

        {accountType === "individual" ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={theme.colors.secondaryText}
            autoCapitalize="words"
            style={inputStyle}
          />
        ) : (
          <>
            <TextInput
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Organization name"
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="words"
              style={inputStyle}
            />

            <TextInput
              value={orgType}
              onChangeText={setOrgType}
              placeholder="Organization type, e.g. care home, nonprofit, gym"
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="words"
              style={inputStyle}
            />

            <TextInput
              value={orgAddress}
              onChangeText={setOrgAddress}
              placeholder="Organization address"
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="words"
              style={inputStyle}
            />

            <TextInput
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Contact person"
              placeholderTextColor={theme.colors.secondaryText}
              autoCapitalize="words"
              style={inputStyle}
            />

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={theme.colors.secondaryText}
              keyboardType="phone-pad"
              style={inputStyle}
            />

            <TextInput
              value={memberCount}
              onChangeText={setMemberCount}
              placeholder="Number of members/residents"
              placeholderTextColor={theme.colors.secondaryText}
              keyboardType="number-pad"
              style={inputStyle}
            />
          </>
        )}

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
          onPress={handleSignUp}
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
              Create Account
            </Text>
          )}
        </Pressable>

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: theme.colors.secondaryText }}>
            Already have an account?{" "}
            <Link
              href="/(auth)/sign-in"
              style={{ color: theme.colors.primary, fontWeight: "900" }}
            >
              Sign in
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AccountTypeButton({ title, selected, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 52,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : "#E8E8E8",
        backgroundColor: selected ? "#EAF3FF" : "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontWeight: "900",
          color: selected ? theme.colors.primary : theme.colors.text,
        }}
      >
        {title}
      </Text>
    </Pressable>
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