import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { theme } from "../components/theme";
import { getEventRsvpsForOrganizer } from "../utils/orgRsvps";
import EmptyState from "../components/EmptyState";

export default function OrgEventRsvpsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["org-event-rsvps", id],
    enabled: !!id,
    queryFn: () => getEventRsvpsForOrganizer({ eventId: String(id) }),
  });

  const rsvps = data || [];

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: theme.colors.secondaryText }}>
          Loading RSVPs…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 40,
      }}
    >
      <Pressable onPress={() => router.back()} style={{ marginBottom: 18 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
          ← Back
        </Text>
      </Pressable>

      <Text style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text }}>
        Event RSVPs
      </Text>

      <Text style={{ marginTop: 8, marginBottom: 20, color: theme.colors.secondaryText, fontSize: 16 }}>
        {rsvps.length} attendee{rsvps.length === 1 ? "" : "s"} RSVP'd
      </Text>

      <Text
  style={{
    marginTop: 8,
    color: theme.colors.secondaryText,
    lineHeight: 22,
  }}
>
  Review accessibility requests before the event so your team can prepare.
</Text>

      {error ? (
        <Text style={{ color: "#D93025" }}>
          {String((error as any)?.message || error)}
        </Text>
      ) : rsvps.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No RSVPs yet"
          message="When people RSVP to this event, they will appear here."
        />
      ) : (
        rsvps.map((rsvp: any, index: number) => (
          <View
            key={`${rsvp.id}-${index}`}
            style={{
              backgroundColor: "white",
              borderRadius: 22,
              padding: 18,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
  style={{
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }}
>
  <Text
    style={{
      fontSize: 18,
      fontWeight: "900",
      color: theme.colors.text,
    }}
  >
    {rsvp.attendee_name || "Organization"}
  </Text>

  {!!rsvp.attendee_email && (
    <Text
      style={{
        marginTop: 4,
        color: theme.colors.secondaryText,
      }}
    >
      {rsvp.attendee_email}
    </Text>
  )}

  <Text
    style={{
      marginTop: 12,
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.text,
    }}
  >
    👥 {rsvp.attendee_count || 1} attending
  </Text>

  {Array.isArray(rsvp.accessibility_requests) &&
    rsvp.accessibility_requests.length > 0 && (
      <>
        <Text
          style={{
            marginTop: 16,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          Accessibility Requests
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 10,
          }}
        >
          {rsvp.accessibility_requests.map((request: string) => (
            <View
              key={request}
              style={{
                backgroundColor: "#EAF3FF",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "800",
                }}
              >
                {request}
              </Text>
            </View>
          ))}
        </View>
      </>
    )}

  {!!rsvp.organizer_notes && (
    <>
      <Text
        style={{
          marginTop: 18,
          fontWeight: "900",
          color: theme.colors.text,
        }}
      >
        Notes
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: theme.colors.secondaryText,
          lineHeight: 22,
        }}
      >
        {rsvp.organizer_notes}
      </Text>
    </>
  )}
</View>
          </View>
        ))
      )}
    </ScrollView>
  );
}