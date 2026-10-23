import { Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function PerfilScreen() {
  const { usuario } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{usuario ? `Hola, ${usuario.nombre}` : "Pantalla: Mi Perfil (Invitado)"}</Text>
    </View>
  );
}