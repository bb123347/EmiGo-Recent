import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import useUser from "../../utils/auth/useUser";
import { getSavedEvents } from "../../utils/savedEvents";
import EventCard from "../../components/EventCard";
import { theme } from "../../components/theme";
import EmptyState from "../../components/EmptyState";

export default function SavedScreen() {
  const router = useRouter();
  const { data: user } = useUser();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["saved-events", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getSavedEvents({ uid: user.uid }),
  });

  const events = data || [];

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: theme.colors.secondaryText }}>
          Loading saved events…
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 54,
        paddingBottom: 28,
      }}
      data={events}
      keyExtractor={(item: any) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListHeaderComponent={
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: theme.colors.text,
            }}
          >
            Saved Events
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: theme.colors.secondaryText,
              fontSize: 16,
            }}
          >
            Events you want to revisit
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="❤️"
          title="No saved events yet"
          message="Tap Save on any event to keep it here for later."
          actionLabel="Browse Events"
          onAction={() => router.push("/(tabs)/events")}
        />
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => router.push(`/(tabs)/events/${item.id}`)}
        />
      )}
    />
  );
}