import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ComercioPanelLayout() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  // Si no está logueado o no es comercio, lo enviamos al inicio público
  if (!usuario || usuario.rol !== "comercio") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: true, title: "Panel de Comercio" }} />;
}