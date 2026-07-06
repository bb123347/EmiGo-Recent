import { Pressable, Text } from "react-native";
import { theme } from "./theme";

export default function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.medium,
        paddingVertical: 16,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}