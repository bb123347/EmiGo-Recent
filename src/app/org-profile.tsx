import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Building2, Mail, MapPin, Phone, Users } from "lucide-react-native";

import useUser from "../utils/auth/useUser";
import { getUserAccount } from "../utils/account";
import { theme } from "../components/theme";

export default function OrgProfileScreen() {
  const router = useRouter();
  const { data: user } = useUser();

  const { data: account } = useQuery({
    queryKey: ["account", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getUserAccount(user.uid),
  });

  const org = account?.organization || {};

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 }}
    >
      <Pressable onPress={() => router.back()} style={{ marginBottom: 18 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>← Back</Text>
      </Pressable>

      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: "#EAF3FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}>
          <Building2 size={42} color={theme.colors.primary} />
        </View>

        <Text style={{ fontSize: 30, fontWeight: "900", color: theme.colors.text, textAlign: "center" }}>
          {org.name || account?.displayName || "Organization"}
        </Text>

        <Text style={{ marginTop: 6, color: theme.colors.secondaryText }}>
          {org.type || "Organization account"}
        </Text>
      </View>

      <InfoCard icon={<Mail size={20} color={theme.colors.primary} />} label="Email" value={account?.email || user?.email || "Not set"} />
      <InfoCard icon={<Phone size={20} color={theme.colors.primary} />} label="Phone" value={org.phone || "Not set"} />
      <InfoCard
  icon={<Building2 size={20} color={theme.colors.primary} />}
  label="Website"
  value={org.website || "Not set"}
/>

<InfoCard
  icon={<Building2 size={20} color={theme.colors.primary} />}
  label="Description"
  value={org.description || "Not set"}
/>
      <InfoCard icon={<MapPin size={20} color={theme.colors.primary} />} label="Address" value={org.address || "Not set"} />
      <InfoCard icon={<Users size={20} color={theme.colors.primary} />} label="Members / Residents" value={org.member_count != null ? String(org.member_count) : "Not set"} />
      <InfoCard icon={<Building2 size={20} color={theme.colors.primary} />} label="Contact Person" value={org.contact_person || "Not set"} />
      <Pressable
  onPress={() => router.push("/org-edit-profile")}
  style={{
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
  }}
>
  <Text style={{ color: "white", fontSize: 17, fontWeight: "900" }}>
    Edit Organization Profile
  </Text>
</Pressable>
    </ScrollView>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <View style={{
      backgroundColor: "white",
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    }}>
      <View style={{ width: 28 }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.secondaryText, fontWeight: "700", marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}