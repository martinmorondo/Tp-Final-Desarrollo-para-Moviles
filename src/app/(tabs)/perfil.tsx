import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function PerfilScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.pantalla}>
      <Text style={styles.titulo}>Mi Perfil</Text>
      
      {usuario ? (
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <Text style={styles.rol}>Rol: {usuario.rol}</Text>

          {/* NUEVO BOTÓN EXCLUSIVO PARA COMERCIOS */}
          {usuario.rol === 'comercio' && (
            <TouchableOpacity 
              style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' }} 
              onPress={() => router.push('/comercio-panel')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Ir a mi Panel de Comercio</Text>
            </TouchableOpacity>
          )}
                    
          <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
            <Text style={styles.textoBoton}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tarjetaCentrada}>
          <Text style={styles.mensaje}>Estás navegando como invitado.</Text>
          <TouchableOpacity style={styles.botonEntrar} onPress={() => router.push('/auth/login')}>
            <Text style={styles.textoBoton}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, paddingTop: 60 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  tarjeta: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tarjetaCentrada: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  nombre: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  email: { fontSize: 16, color: '#64748B', marginTop: 4 },
  rol: { fontSize: 14, color: '#1E3A8A', fontWeight: 'bold', marginTop: 12, backgroundColor: '#DBEAFE', alignSelf: 'flex-start', padding: 6, borderRadius: 6 },
  mensaje: { fontSize: 16, color: '#475569', marginBottom: 20, textAlign: 'center' },
  botonEntrar: { backgroundColor: '#1E3A8A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  botonSalir: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  textoBoton: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});