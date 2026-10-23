import Ionicons from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { ReproductorVideo } from '../../components/ui/ReproductorVideo';
import { useComercio } from '../../hooks/useComercio';
import { obtenerResumenHorario } from '../../utils/horarios';

export default function FichaComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { comercio, cargando, error, cargar } = useComercio(id as string);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) return <EstadoPantalla estado="cargando" />;
  if (error) return <EstadoPantalla estado="error" mensaje={error} onReintentar={cargar} />;
  if (!comercio) return <EstadoPantalla estado="vacio" mensaje="Comercio no encontrado" />;

  const horarioInfo = obtenerResumenHorario(comercio);

  return (
    <View style={styles.pantalla}>
      {/* Cabecera con botón de retroceso */}
      <View style={styles.cabecera}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloCabecera} numberOfLines={1}>{comercio.nombre}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Lógica de Multimedia: Video -> Fotos -> Mensaje Vacío */}
        {comercio.videoUrl ? (
          <ReproductorVideo url={comercio.videoUrl} />
        ) : comercio.imagenes && comercio.imagenes.length > 0 ? (
          <Image source={{ uri: comercio.imagenes[0] }} style={styles.imagenPrincipal} />
        ) : (
          <View style={styles.cajaSinMultimedia}>
            <Ionicons name="image-outline" size={32} color="#94A3B8" />
            <Text style={styles.textoSinMultimedia}>No hay video ni fotos disponibles.</Text>
          </View>
        )}

        {/* Información Básica */}
        <View style={styles.seccion}>
          <Text style={styles.nombre}>{comercio.nombre}</Text>
          
          <Text style={[styles.etiquetaHorario, horarioInfo.abierto ? styles.abierto : styles.cerrado]}>
            {horarioInfo.etiqueta}
          </Text>
          
          <View style={styles.filaPuntaje}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.puntaje}>
              {comercio.puntaje > 0 ? `${comercio.puntaje} (${comercio.cantidadResenas} reseñas)` : "Nuevo (Sin reseñas)"}
            </Text>
          </View>
        </View>

        <Text style={styles.descripcion}>{comercio.descripcion}</Text>

        {/* Tarjeta de Contacto */}
        <View style={styles.tarjetaContacto}>
          <View style={styles.filaContacto}>
            <Ionicons name="location-outline" size={20} color="#1E3A8A" />
            <Text style={styles.textoContacto}>{comercio.direccion}</Text>
          </View>
          
          {comercio.telefono && (
            <View style={styles.filaContacto}>
              <Ionicons name="call-outline" size={20} color="#1E3A8A" />
              <Text style={styles.textoContacto}>{comercio.telefono}</Text>
            </View>
          )}

          {comercio.whatsapp && (
            <View style={styles.filaContacto}>
              <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
              <Text style={styles.textoContacto}>{comercio.whatsapp}</Text>
            </View>
          )}

          {comercio.instagram && (
            <View style={styles.filaContacto}>
              <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              <Text style={styles.textoContacto}>{comercio.instagram}</Text>
            </View>
          )}
        </View>

        {/* Medios de Pago */}
        {comercio.mediosDePago && comercio.mediosDePago.length > 0 && (
          <View style={styles.seccionMediosPago}>
            <Text style={styles.subtitulo}>Medios de pago</Text>
            <View style={styles.cajaChips}>
              {comercio.mediosDePago.map((medio) => (
                <View key={medio} style={styles.chip}>
                  <Text style={styles.textoChip}>{medio}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#FFFFFF' },
  cabecera: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  botonVolver: { padding: 4, marginRight: 12 },
  tituloCabecera: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  imagenPrincipal: { width: '100%', height: 220, borderRadius: 12, marginVertical: 16, backgroundColor: '#E2E8F0' },
  cajaSinMultimedia: { width: '100%', height: 150, borderRadius: 12, marginVertical: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  textoSinMultimedia: { marginTop: 8, color: '#64748B', fontSize: 14 },
  seccion: { marginBottom: 16 },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  etiquetaHorario: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  abierto: { color: '#15803D' },
  cerrado: { color: '#B91C1C' },
  filaPuntaje: { flexDirection: 'row', alignItems: 'center' },
  puntaje: { fontSize: 14, color: '#334155', marginLeft: 4, fontWeight: '500' },
  descripcion: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 20 },
  tarjetaContacto: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  filaContacto: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  textoContacto: { marginLeft: 12, fontSize: 15, color: '#334155', flex: 1 },
  seccionMediosPago: { marginBottom: 20 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  cajaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  textoChip: { fontSize: 13, color: '#475569', fontWeight: '500', textTransform: 'capitalize' }
});