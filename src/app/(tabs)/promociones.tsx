import Ionicons from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { usePromociones } from '../../hooks/usePromociones';
import { Promocion } from '../../types';

export default function PromocionesScreen() {
  const { promociones, cargando, error, cargar } = usePromociones();
  const router = useRouter();

  useEffect(() => {
    cargar(); // Trae todas las no vencidas por defecto
  }, [cargar]);

  const renderItem = ({ item }: { item: Promocion }) => (
    <TouchableOpacity 
      style={styles.tarjeta} 
      onPress={() => router.push(`/promocion/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.contenidoTarjeta}>
        <View style={styles.etiquetaApp}>
          <Ionicons name="phone-portrait-outline" size={14} color="#1E3A8A" />
          <Text style={styles.textoEtiquetaApp}>{item.soloApp ? "Exclusivo App" : "Promoción"}</Text>
        </View>
        <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.vencimiento}>Vence el: {new Date(item.hasta).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cajaDescuento}>
        <Text style={styles.numeroDescuento}>{item.descuento ? `${item.descuento}%` : "OFF"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <Text style={styles.tituloCabecera}>Beneficios</Text>
      </View>

      {cargando ? (
        <EstadoPantalla estado="cargando" />
      ) : error ? (
        <EstadoPantalla estado="error" mensaje={error} onReintentar={() => cargar()} />
      ) : promociones.length === 0 ? (
        <EstadoPantalla estado="vacio" mensaje="No hay promociones vigentes en este momento." onReintentar={() => cargar()} />
      ) : (
        <FlatList
          data={promociones}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC' },
  cabecera: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tituloCabecera: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  lista: { padding: 16 },
  tarjeta: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  contenidoTarjeta: { flex: 1, padding: 16, justifyContent: 'center' },
  etiquetaApp: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  textoEtiquetaApp: { color: '#1E3A8A', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  vencimiento: { fontSize: 13, color: '#64748B' },
  cajaDescuento: { backgroundColor: '#1E3A8A', width: 80, justifyContent: 'center', alignItems: 'center' },
  numeroDescuento: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }
});