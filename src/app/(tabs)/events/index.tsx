import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getEventsList } from "../../../utils/events";
import EventCard from "../../../components/EventCard";
import { theme } from "../../../components/theme";

export default function EventsIndex() {
  const router = useRouter();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["events"],
    queryFn: getEventsList,
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
          Loading events…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            marginBottom: 10,
            color: theme.colors.text,
          }}
        >
          Failed to load events
        </Text>

        <Text
          style={{
            color: theme.colors.secondaryText,
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          {String((error as any)?.message || error)}
        </Text>

        <Pressable
          onPress={() => refetch()}
          style={{
            padding: 14,
            borderRadius: theme.radius.medium,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <FlatList
        data={events}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View style={{ paddingTop: 54, paddingBottom: 14 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              EmiGo
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: theme.colors.secondaryText,
                lineHeight: 22,
              }}
            >
              Accessible events near you
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              padding: 24,
              borderRadius: theme.radius.large,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: theme.colors.text,
                marginBottom: 6,
              }}
            >
              No events yet
            </Text>
            <Text style={{ color: theme.colors.secondaryText }}>
              Events you create in EmiGo will appear here.
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => router.push(`/(tabs)/events/${item.id}`)}
          />
        )}
      />
    </View>
  );
}