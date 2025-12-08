import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Layout() {
  return (
		<Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="beaches"
        options={{
          title: "Playas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="beach"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
	);
}