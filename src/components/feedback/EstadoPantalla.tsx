import Ionicons from '@react-native-vector-icons/ionicons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  estado: 'cargando' | 'error' | 'vacio';
  mensaje?: string;
  onReintentar?: () => void;
}

export function EstadoPantalla({ estado, mensaje, onReintentar }: Props) {
  if (estado === 'cargando') {
    return (
      <View style={styles.contenedor}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.texto}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Ionicons 
        name={estado === 'error' ? "warning-outline" : "search-outline"} 
        size={64} 
        color="#94A3B8" 
      />
      <Text style={styles.textoDestacado}>
        {estado === 'error' ? 'Ocurrió un problema' : 'No hay resultados'}
      </Text>
      <Text style={styles.texto}>{mensaje}</Text>
      
      {onReintentar && (
        <TouchableOpacity style={styles.boton} onPress={onReintentar}>
          <Text style={styles.textoBoton}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  textoDestacado: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  texto: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8 },
  boton: { marginTop: 24, backgroundColor: '#1E3A8A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  textoBoton: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});