import { Text } from "react-native";

export default function SectionHeader({
  title,
}: {
  title: string;
}) {
  return (
    <Text
      style={{
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 12,
      }}
    >
      {title}
    </Text>
  );
}