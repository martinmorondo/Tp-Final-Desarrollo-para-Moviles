import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { TarjetaComercio } from '../../components/ui/TarjetaComercio';
import { useComercios } from '../../hooks/useComercios';

export default function DirectorioScreen() {
  const { comercios, cargando, error, cargar } = useComercios();
  const [filtroAbierto, setFiltroAbierto] = useState(false);

  useEffect(() => {
    cargar({ abiertoAhora: filtroAbierto });
  }, [cargar, filtroAbierto]);

  return (
    <View style={styles.pantalla}>
      {/* Cabecera con título y filtros rápidos */}
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Directorio CCU</Text>
        <View style={styles.filaFiltros}>
          <TouchableOpacity 
            style={[styles.botonFiltro, filtroAbierto && styles.botonFiltroActivo]} 
            onPress={() => setFiltroAbierto(!filtroAbierto)}
          >
            <Ionicons name="time-outline" size={18} color={filtroAbierto ? "#FFFFFF" : "#1E3A8A"} />
            <Text style={[styles.textoFiltro, filtroAbierto && styles.textoFiltroActivo]}>
              Abierto ahora
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manejo de Estados (Cargando, Error, Vacío) */}
      {cargando ? (
        <EstadoPantalla estado="cargando" />
      ) : error ? (
        <EstadoPantalla estado="error" mensaje={error} onReintentar={() => cargar({ abiertoAhora: filtroAbierto })} />
      ) : comercios.length === 0 ? (
        <EstadoPantalla estado="vacio" mensaje="No hay comercios que coincidan con tu búsqueda." onReintentar={() => setFiltroAbierto(false)} />
      ) : (
        /* Lista de Alto Rendimiento */
        <FlatList
          data={comercios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <TarjetaComercio 
              comercio={item} 
              onPress={() => router.push(`/comercio/${item.id}`)} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC' },
  cabecera: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  filaFiltros: { flexDirection: 'row' },
  botonFiltro: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  botonFiltroActivo: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  textoFiltro: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#1E3A8A' },
  textoFiltroActivo: { color: '#FFFFFF' },
  lista: { padding: 16 }
});