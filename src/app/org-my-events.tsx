import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import useUser from "../utils/auth/useUser";
import { getMyOrganizationEvents } from "../utils/orgEvents";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { theme } from "../components/theme";

export default function OrgMyEventsScreen() {
  const router = useRouter();
  const { data: user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["org-events", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getMyOrganizationEvents({ uid: user.uid }),
  });

  const events = data || [];

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: theme.colors.secondaryText }}>Loading your events…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 54, paddingBottom: 28 }}
      data={events}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 14 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text }}>
            My Events
          </Text>
          <Text style={{ marginTop: 6, color: theme.colors.secondaryText, fontSize: 16 }}>
            Events published by your organization
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="📅"
          title="No events yet"
          message="Create your first event and it will appear here."
          actionLabel="Create Event"
          onAction={() => router.push("/org-create-event")}
        />
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => router.push(`/org-edit-event?id=${item.id}`)}
        />
      )}
    />
  );
}