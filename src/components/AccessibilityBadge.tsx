import { Text, View } from "react-native";
import { theme } from "./theme";

function getIcon(name: string) {
  const value = name.toLowerCase();

  if (value.includes("wheelchair")) return "♿";
  if (value.includes("asl") || value.includes("sign")) return "🤟";
  if (value.includes("quiet") || value.includes("sensory")) return "🔇";
  if (value.includes("restroom") || value.includes("bathroom")) return "🚻";
  if (value.includes("parking")) return "🅿️";
  if (value.includes("vision") || value.includes("blind")) return "👁️";
  if (value.includes("service animal")) return "🦮";
  if (value.includes("caption")) return "💬";
  if (value.includes("seating")) return "🪑";

  return "✓";
}

export default function AccessibilityBadge({ name }: { name: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EAF3FF",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
      }}
    >
      <Text style={{ fontSize: 14 }}>{getIcon(name)}</Text>
      <Text
        style={{
          color: theme.colors.primary,
          fontWeight: "800",
          fontSize: 12,
        }}
      >
        {name}
      </Text>
    </View>
  );
}