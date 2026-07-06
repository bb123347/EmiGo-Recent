import { Pressable, Text, View, Image } from "react-native";
import { Calendar, MapPin, Image as ImageIcon } from "lucide-react-native";
import { theme } from "./theme";
import AccessibilityBadge from "./AccessibilityBadge";

export default function EventCard({ event, onPress }: any) {
  const features = Array.isArray(event.accessibility_features)
    ? event.accessibility_features.slice(0, 3)
    : [];

  const imageUrl = String(event.image_url || "").trim();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.md,
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: 170,
            backgroundColor: "#EEF2F7",
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            height: 170,
            backgroundColor: "#EAF3FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon size={38} color={theme.colors.primary} />
          <Text
            style={{
              marginTop: 8,
              color: theme.colors.primary,
              fontWeight: "800",
            }}
          >
            EmiGo Event
          </Text>
        </View>
      )}

      <View style={{ padding: theme.spacing.md }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {event.title}
        </Text>

        {!!event.start_datetime && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <Calendar size={16} color={theme.colors.secondaryText} />
            <Text style={{ color: theme.colors.secondaryText, flex: 1 }}>
              {formatStart(event.start_datetime)}
            </Text>
          </View>
        )}

        {!!event.venue_name && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <MapPin size={16} color={theme.colors.secondaryText} />
            <Text style={{ color: theme.colors.secondaryText, flex: 1 }}>
              {event.venue_name}
              {event.city ? ` • ${event.city}` : ""}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 14,
          }}
        >
         {features.map((feature: any, index: number) => (
  <AccessibilityBadge
    key={`${feature.name}-${index}`}
    name={feature.name}
  />
))}

          {!!event.price_type && (
            <View
              style={{
                backgroundColor: "#F0F0F2",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {String(event.price_type).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function formatStart(v: any) {
  let d: Date | null = null;

  if (typeof v === "string") d = new Date(v);
  else if (v?.toDate) d = v.toDate();
  else if (typeof v?.seconds === "number") d = new Date(v.seconds * 1000);

  if (!d || Number.isNaN(d.getTime())) return "";

  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}