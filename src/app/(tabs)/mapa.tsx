import Ionicons from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { useComercios } from '../../hooks/useComercios';
import { useUbicacion } from '../../hooks/useUbicacion';
import { Comercio } from '../../types';

// Importación condicional (Require) para que no explote en la Web.
// Solo cargamos los motores de mapas si estamos en iOS o Android.
let MapView: any, Marker: any, Callout: any, PROVIDER_DEFAULT: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
  PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
}

export default function MapaScreen() {
  const router = useRouter();

  // 1. Blindaje Web: Si el profesor abre la app en Chrome, ve esto en lugar de un error.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.pantallaWeb}>
        <Ionicons name="phone-portrait-outline" size={64} color="#94A3B8" />
        <Text style={styles.textoWeb}>El mapa interactivo con GPS solo está disponible escaneando el código QR en la aplicación móvil de Expo Go.</Text>
      </View>
    );
  }

  // 2. Ejecución Móvil Normal
  const { comercios, cargando: cargandoComercios, cargar: cargarComercios } = useComercios();
  const { ubicacionUsuario, cargando: cargandoGPS, permisoDenegado } = useUbicacion();

  useEffect(() => {
    cargarComercios();
  }, [cargarComercios]);

  if (cargandoGPS || cargandoComercios) {
    return <EstadoPantalla estado="cargando" />;
  }

  if (!ubicacionUsuario) {
    return <EstadoPantalla estado="error" mensaje="No se pudo cargar el mapa." />;
  }

  return (
    <View style={styles.pantalla}>
      {/* Cabecera Flotante */}
      <View style={styles.cabeceraAbsoluta}>
        <Text style={styles.tituloCabecera}>Comercios Cercanos</Text>
        {permisoDenegado && (
          <View style={styles.alertaGPS}>
            <Ionicons name="information-circle" size={16} color="#B45309" />
            <Text style={styles.textoAlertaGPS}>
              Ubicación denegada. Mostrando el centro de la ciudad.
            </Text>
          </View>
        )}
      </View>

      <MapView
        style={styles.mapa}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: ubicacionUsuario.latitud,
          longitude: ubicacionUsuario.longitud,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={!permisoDenegado}
        showsMyLocationButton={!permisoDenegado}
      >
        {!permisoDenegado && (
          <Marker
            coordinate={{ latitude: ubicacionUsuario.latitud, longitude: ubicacionUsuario.longitud }}
            title="Tu ubicación"
            pinColor="#3B82F6"
          />
        )}

        {comercios.map((comercio: Comercio) => (
          comercio.latitud && comercio.longitud ? (
            <Marker
              key={comercio.id}
              coordinate={{ latitude: comercio.latitud, longitude: comercio.longitud }}
              pinColor="#E11D48"
            >
              <Callout 
                tooltip 
                onPress={() => router.push(`/comercio/${comercio.id}`)}
              >
                <View style={styles.globoMarcador}>
                  <Text style={styles.globoTitulo} numberOfLines={1}>{comercio.nombre}</Text>
                  <Text style={styles.globoDireccion} numberOfLines={1}>{comercio.direccion}</Text>
                  <Text style={styles.globoBoton}>Ver detalle ➔</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC' },
  pantallaWeb: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 32 },
  textoWeb: { fontSize: 16, color: '#475569', textAlign: 'center', marginTop: 16, lineHeight: 24 },
  mapa: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  cabeceraAbsoluta: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  tituloCabecera: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  alertaGPS: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 8, borderRadius: 6, marginTop: 8 },
  textoAlertaGPS: { color: '#B45309', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  globoMarcador: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, minWidth: 150, borderWidth: 1, borderColor: '#E2E8F0' },
  globoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  globoDireccion: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  globoBoton: { fontSize: 14, fontWeight: '600', color: '#1E3A8A' }
});