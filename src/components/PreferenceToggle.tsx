import { Pressable, Text, View } from "react-native";
import { theme } from "./theme";

export default function PreferenceToggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: theme.colors.text,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: enabled
            ? theme.colors.primary
            : "#DDD",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {enabled && (
          <Text
            style={{
              color: "white",
              fontWeight: "900",
            }}
          >
            ✓
          </Text>
        )}
      </View>
    </Pressable>
  );
}