import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Linking,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Mail, ArrowLeft, Heart } from "lucide-react-native";
import { getEventById } from "../../../utils/events";
import AccessibilityBadge from "../../../components/AccessibilityBadge";
import { useEffect, useState } from "react";
import { theme } from "../../../components/theme";
import useUser from "../../../utils/auth/useUser";
import {
  saveEvent,
  unsaveEvent,
  getSavedEventStatus,
} from "../../../utils/savedEvents";
import {
  rsvpToEvent,
  unRsvpFromEvent,
  getMyRsvpStatus,
} from "../../../utils/rsvp";
import { getUserAccount } from "../../../utils/account";

// react-native-maps pulls in a native component via requireNativeComponent,
// which THROWS at import time if the native module isn't registered in the
// build. Because expo-router eagerly requires every route file at bootstrap,
// an unguarded top-level import here can crash the whole app to a white screen
// before anything renders. Load it defensively so a missing/misbehaving native
// module just disables the inline map instead of taking down the entire app.
let MapView: any = null;
let Marker: any = null;
try {
  const maps = require("react-native-maps");
  MapView = maps.default ?? maps.MapView ?? null;
  Marker = maps.Marker ?? null;
} catch (e) {
  console.warn("[EventDetail] react-native-maps unavailable:", e);
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [groupCount, setGroupCount] = useState("1");
  const [accountType, setAccountType] = useState("individual");
  const [groupNotes, setGroupNotes] = useState("");
  const [accessibilityRequests, setAccessibilityRequests] = useState<string[]>([]);
  

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: async () => getEventById(String(id)),
  });

useEffect(() => {
  let mounted = true;

  async function loadSavedStatus() {
    if (!user?.uid || !id) return;

    const status = await getSavedEventStatus({
      uid: user.uid,
      eventId: String(id),
    });

    if (mounted) setIsSaved(status);
  }

  loadSavedStatus();

  return () => {
    mounted = false;
  };
}, [user?.uid, id]);

useEffect(() => {
  async function loadAccountType() {
    if (!user?.uid) return;

    const account = await getUserAccount(user.uid);
    setAccountType(account?.account_type || "individual");
  }

  loadAccountType();
}, [user?.uid]);

useEffect(() => {
  let mounted = true;

  async function loadRsvpStatus() {
    if (!user?.uid || !id) return;

    const status = await getMyRsvpStatus({
      uid: user.uid,
      eventId: String(id),
    });

    if (mounted) setIsRsvped(status);
  }

  loadRsvpStatus();

  return () => {
    mounted = false;
  };
}, [user?.uid, id]);

const toggleAccessibilityRequest = (request: string) => {
  setAccessibilityRequests((current) =>
    current.includes(request)
      ? current.filter((item) => item !== request)
      : [...current, request]
  );
};

const handleToggleRsvp = async () => {
  if (!user?.uid) {
    alert("Please sign in to RSVP.");
    return;
  }

  try {
    setRsvpLoading(true);

    if (isRsvped) {
      await unRsvpFromEvent({ uid: user.uid, eventId: String(id) });
      setIsRsvped(false);
    } else {
  const requestedCount =
    accountType === "organization" ? Number(groupCount) || 1 : 1;

  const capacity = Number(event.capacity || 0);
  const attending = Number(event.attendee_count || 0);
  const spotsRemaining = capacity ? capacity - attending : null;

  if (spotsRemaining !== null && requestedCount > spotsRemaining) {
    alert(
      `Only ${spotsRemaining} spot${
        spotsRemaining === 1 ? "" : "s"
      } remaining. Please reduce your group size or contact the organizer.`
    );
    return;
  }

  await rsvpToEvent({
    uid: user.uid,
    eventId: String(id),
    name: user.displayName || "",
    email: user.email || "",
    attendeeCount: requestedCount,
    accountType,
    notes: groupNotes,
    accessibilityRequests,
  });

  setIsRsvped(true);
}
queryClient.invalidateQueries({ queryKey: ["upcoming-events", user.uid] });
queryClient.invalidateQueries({ queryKey: ["rsvp-count", user.uid] });
  } catch (e) {
    console.error("RSVP error:", e);
    alert("Could not update RSVP. Please try again.");
  } finally {
    setRsvpLoading(false);
  }
};

const handleToggleSave = async () => {
  if (!user?.uid) {
    alert("Please sign in to save events.");
    return;
  }

  try {
    setSaveLoading(true);

  if (isSaved) {
  await unsaveEvent({ uid: user.uid, eventId: String(id) });
  setIsSaved(false);
} else {
  await saveEvent({ uid: user.uid, eventId: String(id) });
  setIsSaved(true);
}

queryClient.invalidateQueries({ queryKey: ["saved-events", user.uid] });
queryClient.invalidateQueries({ queryKey: ["saved-event-count", user.uid] });
  } catch (e) {
    console.error("Save event error:", e);
    alert("Could not update saved event. Please try again.");
  } finally {
    setSaveLoading(false);
  }
};

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading event…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTitle}>Failed to load event</Text>
        <Text style={styles.muted}>
          {String((error as any)?.message || error)}
        </Text>

        <Pressable onPress={() => refetch()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTitle}>Event not found</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to events</Text>
        </Pressable>
      </View>
    );
  }

  const organizerEmail = String(event.organizer_email || "").trim();
  const organizerName = String(event.organizer_name || "").trim();
  const addressLine = [event.address, event.city, event.state, event.zip_code]
    .filter(Boolean)
    .join(", ");

  const accessibilityFeatures = Array.isArray(event.accessibility_features)
    ? event.accessibility_features
    : [];

  const imageUrl = String(event.image_url || "").trim();
  const latitude = Number(event.latitude);
  const longitude = Number(event.longitude);
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const handleEmailOrganizer = () => {
    if (!organizerEmail) return;

    const subject = encodeURIComponent(`Question about: ${event.title}`);
    Linking.openURL(`mailto:${organizerEmail}?subject=${subject}`);
  };

  const handleOpenMaps = () => {
    if (event.latitude && event.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`,
      );
      return;
    }

    const query = encodeURIComponent(
      [event.venue_name, event.address, event.city, event.state, event.zip_code]
        .filter(Boolean)
        .join(" "),
    );

    if (query) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

const attending = Number(event.attendee_count || 0);
const capacity = Number(event.capacity || 0);
const spotsRemaining = capacity ? Math.max(0, capacity - attending) : null;
const attendancePercent = capacity
  ? Math.min(100, Math.round((attending / capacity) * 100))
  : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F8" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 128 }}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={18} color="#357AFF" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

{imageUrl ? (
  <Image
    source={{ uri: imageUrl }}
    resizeMode="cover"
    style={styles.heroImage}
  />
) : (
  <View style={styles.heroPlaceholder}>
    <Text style={{ fontSize: 48 }}>🎉</Text>
    <Text
      style={{
        marginTop: 8,
        fontWeight: "800",
        color: "#357AFF",
      }}
    >
      EmiGo Event
    </Text>
  </View>
)}

        <View style={styles.heroCard}>
          <Text style={styles.title}>{event.title}</Text>

          <Text
  style={{
    marginTop: 6,
    fontSize: 17,
    color: theme.colors.secondaryText,
  }}
>
  <Text
  style={{
    marginTop: 6,
    fontSize: 17,
    color: theme.colors.secondaryText,
  }}
>
  Hosted by {event.organizer_name}
  {event.organizer_verified ? " ✅" : ""}
</Text>
</Text>

          {!!event.start_datetime && (
            <View style={styles.row}>
              <Calendar size={18} color="#666" />
              <Text style={styles.metaText}>{formatStart(event.start_datetime)}</Text>
            </View>
          )}

          {!!event.category && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(event.category)}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RSVP</Text>
          <Text style={styles.cardText}>
            Reserve your spot for this accessible event.
          </Text>

{isRsvped && accountType === "organization" && (
  <Text style={{ marginTop: 10, color: "#357AFF", fontWeight: "900" }}>
    Your organization is RSVP'd for {groupCount} attendee
    {Number(groupCount) === 1 ? "" : "s"}.
  </Text>
)}

{accountType === "organization" && (
  <View style={{ marginTop: 14 }}>
    <Text style={{ fontWeight: "900", color: "#111", marginBottom: 8 }}>
      Bringing a group?
    </Text>

    <Text style={{ color: "#666", marginBottom: 12, lineHeight: 20 }}>
      Select how many members, residents, or guests your organization is bringing.
    </Text>

    <View style={styles.groupStepper}>
      <Pressable
        onPress={() =>
          setGroupCount((current) =>
            String(Math.max(1, (Number(current) || 1) - 1))
          )
        }
        style={styles.stepperButton}
      >
        <Text style={styles.stepperButtonText}>−</Text>
      </Pressable>

      <Text style={styles.stepperCount}>{groupCount}</Text>

      <Pressable
        onPress={() =>
          setGroupCount((current) => String((Number(current) || 1) + 1))
        }
        style={styles.stepperButton}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>

<Text
  style={{
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "900",
    color: theme.colors.text,
  }}
>
  Notes for the organizer (optional)
</Text>

<TextInput
  value={groupNotes}
  onChangeText={setGroupNotes}
  placeholder="Arrival time, accessibility requests, transportation details..."
  multiline
  style={[
    styles.input,
    {
      height: 100,
      textAlignVertical: "top",
      paddingTop: 12,
    },
  ]}
/>

<Text
  style={{
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "900",
    color: "#111",
  }}
>
  Accessibility requests
</Text>

<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
  {[
    "♿ Wheelchairs",
    "🤟 ASL",
    "🦮 Service Animals",
    "🅿️ Accessible Parking",
    "🔇 Quiet Space",
    "🚻 Accessible Restroom",
  ].map((request) => {
    const selected = accessibilityRequests.includes(request);

    return (
      <Pressable
        key={request}
        onPress={() => toggleAccessibilityRequest(request)}
        style={{
          backgroundColor: selected ? "#EAF3FF" : "white",
          borderColor: selected ? "#357AFF" : "#E8E8E8",
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            color: selected ? "#357AFF" : "#111",
            fontWeight: "800",
          }}
        >
          {selected ? "✓ " : ""}
          {request}
        </Text>
      </Pressable>
    );
  })}
</View>
  </View>
)}

          <Pressable
            onPress={handleToggleRsvp}
disabled={rsvpLoading}
            style={[styles.primaryButton, { marginTop: 14 }]}
          >
            <Text style={styles.primaryButtonText}>
  {isRsvped ? "✓ You're Going" : "RSVP"}
</Text>
          </Pressable>
        </View>

<View
  style={{
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }}
>
  <Text
    style={{
      fontSize: 20,
      fontWeight: "900",
      color: theme.colors.text,
    }}
  >
    Attendance
  </Text>

  <Text
    style={{
      marginTop: 12,
      fontSize: 17,
      color: theme.colors.text,
    }}
  >
    👥 {event.attendee_count || 0} attending
  </Text>

  {event.capacity ? (
    <>
      <Text
        style={{
          marginTop: 6,
          color: theme.colors.secondaryText,
        }}
      >
        🎟 Capacity: {event.capacity}
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: theme.colors.primary,
          fontWeight: "900",
        }}
      >
        {Math.max(
          0,
          event.capacity - (event.attendee_count || 0)
        )} spots remaining
      </Text>
    </>
  ) : (
    <Text
      style={{
        marginTop: 6,
        color: theme.colors.secondaryText,
      }}
    >
      Unlimited capacity
    </Text>
  )}
</View>

        {organizerEmail ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Organizer</Text>

            <Text style={styles.cardText}>
              {organizerName ? `${organizerName} • ` : ""}
              {organizerEmail}
            </Text>

	    {event.organizer_uid ? (
  <Pressable
    onPress={() => router.push(`/org-public?id=${event.organizer_uid}`)}
    style={[styles.secondaryButton, { marginTop: 10 }]}
  >
    <Text style={styles.secondaryButtonText}>View Organization Page</Text>
  </Pressable>
) : null}

            <Pressable
              onPress={handleEmailOrganizer}
              style={[styles.secondaryButton, { marginTop: 14 }]}
            >
              <Mail size={18} color="#111" />
              <Text style={styles.secondaryButtonText}>Email Organizer</Text>
            </Pressable>
          </View>
        ) : null}

        {!!event.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{String(event.description)}</Text>
          </View>
        )}

        {(event.venue_name || addressLine) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Location</Text>

            {!!event.venue_name && (
              <Text style={styles.locationTitle}>{event.venue_name}</Text>
            )}

            {!!addressLine && <Text style={styles.cardText}>{addressLine}</Text>}

            {hasCoordinates && MapView && Marker ? (
  <Pressable onPress={handleOpenMaps} style={styles.mapPreview}>
    <MapView
      pointerEvents="none"
      style={{ width: "100%", height: "100%" }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{ latitude, longitude }}
        title={event.venue_name || event.title}
      />
    </MapView>
  </Pressable>
) : (
  <Pressable onPress={handleOpenMaps} style={styles.mapPreview}>
    <MapPin size={34} color="#357AFF" />
    <Text style={styles.mapPreviewTitle}>View Map & Directions</Text>
    <Text style={styles.mapPreviewSubtitle}>
      {addressLine || event.venue_name || "Open this location in your maps app"}
    </Text>
  </Pressable>
)}
          </View>
        )}

        {(accessibilityFeatures.length > 0 || event.accessibility_other) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Accessibility Features</Text>

            <View style={styles.badgeGrid}>
  		{accessibilityFeatures.map((feature: any, index: number) => (
   		 <AccessibilityBadge
      			key={`${feature.id || feature.name}-${index}`}
      			name={feature.name}
    />
  ))}
</View>

            {!!event.accessibility_other && (
              <Text style={[styles.bodyText, { marginTop: 10 }]}>
                {String(event.accessibility_other)}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
  <Pressable
    onPress={handleToggleSave}
    disabled={saveLoading}
    style={styles.bottomSecondary}
  >
    <Heart
      size={18}
      color={isSaved ? "#E0245E" : "#111"}
      fill={isSaved ? "#E0245E" : "none"}
    />
    <Text style={styles.bottomSecondaryText}>
      {isSaved ? "Saved" : "Save"}
    </Text>
  </Pressable>

  <Pressable
    onPress={handleToggleRsvp}
disabled={rsvpLoading}
          style={styles.bottomPrimary}
        >
          <Text style={styles.bottomPrimaryText}>{isRsvped
  ? accountType === "organization"
    ? `✓ Group RSVP'd`
    : "✓ You're Going"
  : "RSVP"}</Text>
        </Pressable>

        {organizerEmail ? (
          <Pressable onPress={handleEmailOrganizer} style={styles.bottomSecondary}>
            <Text style={styles.bottomSecondaryText}>Contact</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function formatStart(v: any) {
  let d: Date | null = null;

  if (typeof v === "string") d = new Date(v);
  else if (v?.toDate) d = v.toDate();
  else if (typeof v === "object" && typeof v.seconds === "number") {
    d = new Date(v.seconds * 1000);
  }

  if (!d || Number.isNaN(d.getTime())) return "";

  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles: any = {
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F8",
  },
  errorWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F7F7F8",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  muted: {
    marginTop: 10,
    opacity: 0.7,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingVertical: 8,
  },
  backText: {
    color: "#357AFF",
    fontWeight: "800",
    fontSize: 16,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E9E9EC",
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    marginBottom: 14,
    color: "#111",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  metaText: {
    color: "#555",
    fontWeight: "600",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: "#357AFF",
    fontWeight: "800",
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E9E9EC",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    color: "#111",
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#666",
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
    color: "#111",
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F0F0F2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
  },
  mapButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F3F7FF",
    borderWidth: 1,
    borderColor: "#D6E6FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 8,
  },
  mapButtonText: {
    color: "#357AFF",
    fontSize: 16,
    fontWeight: "900",
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
  },
  check: {
    color: "#357AFF",
    fontWeight: "900",
    fontSize: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: "#E9E9EC",
    flexDirection: "row",
    gap: 10,
  },
  bottomPrimary: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPrimaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
  bottomSecondary: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  bottomSecondaryText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
  },
heroImage: {
  width: "100%",
  height: 280,
  borderRadius: 24,
  marginBottom: 16,
  backgroundColor: "#EEE",
},

heroPlaceholder: {
  height: 240,
  borderRadius: 24,
  marginBottom: 16,
  backgroundColor: "#EAF3FF",
  justifyContent: "center",
  alignItems: "center",
},

badgeGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
},

mapPreview: {
  marginTop: 14,
  height: 160,
  borderRadius: 20,
  backgroundColor: "#EAF3FF",
  borderWidth: 1,
  borderColor: "#D6E6FF",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

mapPreviewTitle: {
  marginTop: 10,
  color: "#111",
  fontSize: 17,
  fontWeight: "900",
},

mapPreviewSubtitle: {
  marginTop: 4,
  color: "#666",
  fontSize: 14,
},

input: {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: "#E8E8E8",
  borderRadius: 14,
  minHeight: 48,
  paddingHorizontal: 14,
  fontSize: 16,
  marginBottom: 12,
  color: "#111",
},

groupStepper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#F7F7F8",
  borderRadius: 18,
  padding: 10,
  marginBottom: 12,
},

stepperButton: {
  width: 52,
  height: 52,
  borderRadius: 16,
  backgroundColor: "#EAF3FF",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#D6E6FF",
},

stepperButtonText: {
  fontSize: 28,
  fontWeight: "900",
  color: "#357AFF",
},

stepperCount: {
  fontSize: 24,
  fontWeight: "900",
  color: "#111",
},

};