import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#1E3A8A" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Directorio",
          tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="promociones"
        options={{
          title: "Promos",
          tabBarIcon: ({ color }) => <Ionicons name="pricetag-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}