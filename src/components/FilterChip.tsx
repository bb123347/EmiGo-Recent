import { Pressable, Text } from "react-native";
import { theme } from "./theme";

export default function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected
          ? theme.colors.primary
          : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected
          ? theme.colors.primary
          : theme.colors.border,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 18,
        marginRight: 10,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          color: selected ? "white" : theme.colors.text,
          fontSize: 15,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}