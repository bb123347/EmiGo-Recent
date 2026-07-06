import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import {
  User,
  Heart,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react-native";

import { theme } from "../../../components/theme";
import useUser from "../../../utils/auth/useUser";
import PreferenceToggle from "../../../components/PreferenceToggle";
import {
  DEFAULT_PREFERENCES,
  getUserProfile,
  saveAccessibilityPreferences,
} from "../../../utils/profile";

import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../../../utils/firebaseClient";
import { getUserAccount } from "../../../utils/account";

export default function ProfileScreen() {
  const { data: user } = useUser();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const router = useRouter();

useEffect(() => {
  async function redirectOrg() {
    if (!user?.uid) return;

    const account = await getUserAccount(user.uid);

    if (account?.account_type === "organization") {
      router.replace("/org-dashboard");
    }
  }

  redirectOrg();
}, [user?.uid]);

  const handleSignOut = async () => {
  await signOut(auth);
  router.replace("/(auth)/sign-in");
};


  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Welcome!";

  const email = user?.email || "";

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user?.uid) {
        setLoadingPrefs(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!mounted) return;

        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...(profile?.accessibility_preferences || {}),
        });
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        if (mounted) setLoadingPrefs(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const togglePreference = async (key: keyof typeof preferences) => {
    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(nextPreferences);

    if (!user?.uid) return;

    try {
      setSavingPrefs(true);
      await saveAccessibilityPreferences({
        uid: user.uid,
        preferences: nextPreferences,
      });
    } catch (e) {
      console.error("Preference save error:", e);
      alert("Could not save preference. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 40,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: "#EAF3FF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <User size={42} color={theme.colors.primary} />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {displayName}
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: theme.colors.secondaryText,
            fontSize: 16,
          }}
        >
          {email || "Your EmiGo profile"}
        </Text>
      </View>

      <Section title="Accessibility Preferences">
        {loadingPrefs ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator />
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: theme.colors.secondaryText,
              }}
            >
              Loading preferences…
            </Text>
          </View>
        ) : (
          <>
            <PreferenceToggle
              label="♿ Wheelchair Accessible"
              enabled={preferences.wheelchair}
              onToggle={() => togglePreference("wheelchair")}
            />

            <PreferenceToggle
              label="🤟 ASL Interpretation"
              enabled={preferences.asl}
              onToggle={() => togglePreference("asl")}
            />

            <PreferenceToggle
              label="🔇 Quiet Spaces"
              enabled={preferences.quiet}
              onToggle={() => togglePreference("quiet")}
            />

            <PreferenceToggle
              label="🅿️ Accessible Parking"
              enabled={preferences.parking}
              onToggle={() => togglePreference("parking")}
            />

            <PreferenceToggle
              label="🚻 Accessible Restrooms"
              enabled={preferences.restroom}
              onToggle={() => togglePreference("restroom")}
            />

            <PreferenceToggle
              label="👁️ Low Vision Support"
              enabled={preferences.lowVision}
              onToggle={() => togglePreference("lowVision")}
            />

            <PreferenceToggle
              label="🦮 Service Animals Welcome"
              enabled={preferences.serviceAnimals}
              onToggle={() => togglePreference("serviceAnimals")}
            />

            {savingPrefs && (
              <Text
                style={{
                  marginTop: 8,
                  color: theme.colors.secondaryText,
                  fontSize: 13,
                }}
              >
                Saving…
              </Text>
            )}
          </>
        )}
      </Section>

      <Section title="My Activity">
        <Row icon={<CalendarDays size={20} />} text="Upcoming Events" value="0" />
        <Row icon={<Heart size={20} />} text="Saved Events" value="0" />
      </Section>

      <Section title="Account">
        <Row icon={<Settings size={20} />} text="Settings" />
        <Row icon={<LogOut size={20} />} text="Sign Out" onPress={handleSignOut} />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: any) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          fontWeight: "900",
          fontSize: 20,
          marginBottom: 14,
        }}
      >
        {title}
      </Text>

      {children}
    </View>
  );
}

function Row({ icon, text, value, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <View style={{ width: 32 }}>{icon}</View>

      <Text style={{ flex: 1, fontSize: 16 }}>{text}</Text>

      {value && (
        <Text
          style={{
            fontWeight: "700",
            color: theme.colors.secondaryText,
          }}
        >
          {value}
        </Text>
      )}
    </Pressable>
  );
}