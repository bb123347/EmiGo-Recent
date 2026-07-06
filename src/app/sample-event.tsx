import { View, Text } from "react-native";

export default function SampleEvent() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Sample Event</Text>
      <Text style={{ marginTop: 12, fontSize: 16, opacity: 0.75 }}>
        If you can see this, routing + layout are working.
      </Text>
    </View>
  );
}
