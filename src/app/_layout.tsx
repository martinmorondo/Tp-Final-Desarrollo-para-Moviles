import { Stack } from "expo-router";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { inicializarBaseDeDatos } from "../db/sqlite";

export default function RootLayout() {
  
  useEffect(() => {
    inicializarBaseDeDatos();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
        <Stack.Screen name="comercio-panel" />
      </Stack>
    </AuthProvider>
  );
}