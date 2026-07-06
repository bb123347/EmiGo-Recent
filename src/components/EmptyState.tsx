import { Text, View, Pressable } from "react-native";
import { theme } from "./theme";

export default function EmptyState({
  icon = "✨",
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 22,
        padding: 22,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 42 }}>{icon}</Text>

      <Text
        style={{
          marginTop: 12,
          fontSize: 20,
          fontWeight: "900",
          color: theme.colors.text,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: theme.colors.secondaryText,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {message}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={{
            marginTop: 16,
            backgroundColor: theme.colors.primary,
            borderRadius: 16,
            paddingHorizontal: 18,
            paddingVertical: 13,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}