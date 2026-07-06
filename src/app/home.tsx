import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12 }}>
        EmiGo
      </Text>
      <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 24 }}>
        Mobile app is working ✅
      </Text>

      <Pressable
        onPress={() => router.push("/sample-event")}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 12,
          backgroundColor: "black",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Open Sample Event
        </Text>
      </Pressable>
    </View>
  );
}
