import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react-native";

import { getUserAccount } from "../utils/account";
import { theme } from "../components/theme";

export default function OrgPublicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: account } = useQuery({
    queryKey: ["public-org", id],
    enabled: !!id,
    queryFn: () => getUserAccount(String(id)),
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
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "#EAF3FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}>
          <Building2 size={44} color={theme.colors.primary} />
        </View>

        <Text style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text, textAlign: "center" }}>
          {org.name || account?.displayName || "Organization"}
        </Text>

{org.verified && (
  <View
    style={{
      marginTop: 10,
      alignSelf: "center",
      backgroundColor: "#EAF8F0",
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    }}
  >
    <Text
      style={{
        color: "#1E8E3E",
        fontWeight: "900",
      }}
    >
      ✅ Verified Organization
    </Text>
  </View>
)}

        <Text style={{ marginTop: 8, color: theme.colors.secondaryText }}>
          {org.type || "Organization"}
        </Text>
      </View>

      <Info label="Description" value={org.description || "Not listed"} />
      <Info label="Address" value={org.address || "Not listed"} />
      <Info label="Website" value={org.website || "Not listed"} />
      <Info label="Contact" value={org.contact_person || "Not listed"} />
      <Info label="Phone" value={org.phone || "Not listed"} />
    </ScrollView>
  );
}

function Info({ label, value }: any) {
  return (
    <View style={{
      backgroundColor: "white",
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}>
      <Text style={{ color: theme.colors.secondaryText, fontWeight: "800" }}>{label}</Text>
      <Text style={{ marginTop: 6, color: theme.colors.text, fontSize: 17, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}