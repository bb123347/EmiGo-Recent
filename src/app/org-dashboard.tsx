import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Building2,
  CalendarDays,
  Plus,
  Users,
  LogOut,
  Eye,
} from "lucide-react-native";
import { signOut } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";

import { theme } from "../components/theme";
import useUser from "../utils/auth/useUser";
import { auth } from "../utils/firebaseClient";
import { getMyOrganizationEvents } from "../utils/orgEvents";
import { getUserAccount } from "../utils/account";

export default function OrgDashboard() {
  const router = useRouter();
  const { data: user } = useUser();

  const { data: orgEvents = [] } = useQuery({
    queryKey: ["org-events", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getMyOrganizationEvents({ uid: user.uid }),
  });

  const { data: account } = useQuery({
    queryKey: ["account", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getUserAccount(user.uid),
  });

  const org = account?.organization || {};
  const memberCount =
    org.member_count != null ? String(org.member_count) : "0";

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/(auth)/sign-in");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontSize: 16, color: theme.colors.secondaryText }}>
        EmiGo for Organizations
      </Text>

      <Text
        style={{
          fontSize: 32,
          fontWeight: "900",
          color: theme.colors.text,
          marginTop: 4,
        }}
      >
        {org.name || user?.displayName || "Your Organization"}
      </Text>

      <Text
        style={{
          marginTop: 8,
          marginBottom: 22,
          color: theme.colors.secondaryText,
          fontSize: 16,
          lineHeight: 22,
        }}
      >
        Manage events, profile, and community RSVPs.
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
        <MetricCard label="Events" value={String(orgEvents.length)} />
        <MetricCard label="Members" value={memberCount} />
      </View>

      <Pressable
        onPress={() => router.push("/(org)/create")}
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 24,
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <Plus size={22} color="white" />
        <Text style={{ color: "white", fontSize: 17, fontWeight: "900" }}>
          Create Event
        </Text>
      </Pressable>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "900",
          color: theme.colors.text,
          marginBottom: 12,
        }}
      >
        Quick Actions
      </Text>

      <ActionCard
        icon={<CalendarDays size={24} color={theme.colors.primary} />}
        title="My Events"
        subtitle="View, edit, and manage published events"
        onPress={() => router.push("/(org)/events")}
      />

      <ActionCard
        icon={<Building2 size={24} color={theme.colors.primary} />}
        title="Organization Profile"
        subtitle="Update public organization details"
        onPress={() => router.push("/(org)/profile")}
      />

      <ActionCard
        icon={<Users size={24} color={theme.colors.primary} />}
        title="Members / Residents"
        subtitle={`${memberCount} listed in your profile`}
        onPress={() => router.push("/(org)/profile")}
      />

      <ActionCard
        icon={<Eye size={24} color={theme.colors.primary} />}
        title="Browse EmiGo Events"
        subtitle="See the public event experience"
        onPress={() => router.push("/(tabs)/events")}
      />

      <Pressable
        onPress={handleSignOut}
        style={{
          marginTop: 8,
          backgroundColor: "#F0F0F2",
          borderRadius: 22,
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <LogOut size={20} color="#111" />
        <Text style={{ color: "#111", fontSize: 17, fontWeight: "900" }}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function MetricCard({ label, value }: any) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.secondaryText, fontWeight: "800" }}>
        {label}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 30,
          fontWeight: "900",
          color: theme.colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "white",
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            color: theme.colors.secondaryText,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}