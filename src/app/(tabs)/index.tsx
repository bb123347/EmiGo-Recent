import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Sparkles,
  Heart,
  CalendarDays,
  ArrowRight,
} from "lucide-react-native";

import useUser from "../../utils/auth/useUser";
import { getEventsList } from "../../utils/events";
import { getSavedEventCount } from "../../utils/savedEvents";
import EventCard from "../../components/EventCard";
import Card from "../../components/Card";
import { theme } from "../../components/theme";
import FilterChip from "../../components/FilterChip";
import { getMyRsvpCount } from "../../utils/rsvp";


const FILTERS = [
  { label: "♿ Wheelchair", value: "wheelchair" },
  { label: "🤟 ASL", value: "asl" },
  { label: "🔇 Quiet", value: "quiet sensory" },
  { label: "🆓 Free", value: "free" },
  { label: "🎨 Arts", value: "arts art museum" },
  { label: "🍽 Food", value: "food restaurant" },
  { label: "🎵 Music", value: "music" },
  { label: "🏃 Exercise", value: "exercise yoga fitness sports" },
];

export default function HomeTab() {
  const router = useRouter();
  const { data: user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const {
  data: eventsData,
  isRefetching,
  refetch,
} = useQuery({
  queryKey: ["events"],
  queryFn: getEventsList,
});

  const { data: savedCount = 0 } = useQuery({
    queryKey: ["saved-event-count", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getSavedEventCount({ uid: user.uid }),
  });
  const { data: rsvpCount = 0 } = useQuery({
    queryKey: ["rsvp-count", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getMyRsvpCount({ uid: user.uid }),
});

  const events = eventsData || [];

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "there";

  const searchTerms = [
    search,
    ...selectedFilters.map(
      (filter) => FILTERS.find((f) => f.label === filter)?.value || "",
    ),
  ]
    .join(" ")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filteredEvents = events.filter((event: any) => {
    if (searchTerms.length === 0) return true;

    const text = [
      event.title,
      event.description,
      event.category,
      event.city,
      event.state,
      event.venue_name,
      event.price_type,
      ...(Array.isArray(event.accessibility_features)
        ? event.accessibility_features.map((f: any) => f.name)
        : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => text.includes(term));
  });

  const recommendedEvent = filteredEvents[0];
  const visibleEvents = filteredEvents.slice(0, 4);

  const toggleFilter = (label: string) => {
    setSelectedFilters((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 54,
        paddingBottom: 28,
      }}
      data={visibleEvents}
      keyExtractor={(item: any) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
}
      ListHeaderComponent={
        <View>
          <Text
  style={{
    fontSize: 16,
    color: theme.colors.secondaryText,
  }}
>
  Good {getGreeting()}
</Text>

<Text
  style={{
    fontSize: 34,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 4,
  }}
>
  {user?.displayName || "Welcome"} 👋
</Text>

          <Text
            style={{
              fontSize: 17,
              color: theme.colors.secondaryText,
              marginBottom: 18,
              lineHeight: 23,
            }}
          >
            Ready to discover accessible experiences today?
          </Text>

          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.large,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              minHeight: 56,
            }}
          >
            <Search size={20} color={theme.colors.secondaryText} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder='Try "ASL", "free", "quiet", "Philadelphia"'
              placeholderTextColor={theme.colors.secondaryText}
              style={{ flex: 1, fontSize: 16, color: theme.colors.text }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            {FILTERS.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                selected={selectedFilters.includes(filter.label)}
                onPress={() => toggleFilter(filter.label)}
              />
            ))}
          </View>

          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Sparkles size={22} color={theme.colors.primary} />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                Recommended for You
              </Text>
            </View>

            {recommendedEvent ? (
              <Pressable
                onPress={() =>
                  router.push(`/(tabs)/events/${recommendedEvent.id}`)
                }
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  {recommendedEvent.title}
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    color: theme.colors.secondaryText,
                  }}
                >
                  {recommendedEvent.city || "Accessible event"}
                </Text>
              </Pressable>
            ) : (
              <Text style={{ color: theme.colors.secondaryText }}>
                No matching recommendation yet.
              </Text>
            )}
          </Card>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Heart size={22} color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                Saved
              </Text>
              <Text style={{ marginTop: 4, color: theme.colors.secondaryText }}>
                {savedCount} event{savedCount === 1 ? "" : "s"}
              </Text>
            </Pressable>

            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <CalendarDays size={22} color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                Upcoming
              </Text>
              <Text
  style={{
    marginTop: 4,
    color: theme.colors.secondaryText,
  }}
>
  {rsvpCount} event{rsvpCount === 1 ? "" : "s"}
</Text>
            </View>
          </View>

          <View style={{ marginTop: 4, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              {search.trim() || selectedFilters.length
                ? "Search Results"
                : "Recently Added"}
            </Text>

            <Text style={{ marginTop: 4, color: theme.colors.secondaryText }}>
              {filteredEvents.length} matching event
              {filteredEvents.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => router.push(`/(tabs)/events/${item.id}`)}
        />
      )}
      ListFooterComponent={
        <View>
          {filteredEvents.length === 0 && (
            <Card>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: theme.colors.text,
                }}
              >
                No events found
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: theme.colors.secondaryText,
                  lineHeight: 21,
                }}
              >
                Try searching for ASL, wheelchair, quiet, free, or a city name.
              </Text>
            </Card>
          )}

          <Pressable
            onPress={() => router.push("/(tabs)/events")}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.large,
              padding: 16,
              alignItems: "center",
              marginTop: 4,
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
              Browse All Events
            </Text>
            <ArrowRight size={18} color="white" />
          </Pressable>
        </View>
      }
    />
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}