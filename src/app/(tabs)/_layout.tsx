import { Tabs } from "expo-router";
import { Home, Calendar, User, Heart, CalendarDays } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="events/index"
        options={{
          title: "Events",
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="saved"
        options={{
         title: "Saved",
         tabBarIcon: ({ color, size }) => (
         <Heart size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="upcoming"
  options={{
    title: "Upcoming",
    tabBarIcon: ({ color, size }) => (
      <CalendarDays size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />

      {/* Hide detail screen from tab bar */}
      <Tabs.Screen
        name="events/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}