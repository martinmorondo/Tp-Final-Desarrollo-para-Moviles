import Ionicons from '@react-native-vector-icons/ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { useAuth } from '../../context/AuthContext';
import { obtenerCodigoDeUsoPromocion, obtenerPromocionPorId } from '../../services/promociones';
import { Promocion, UsoDePromocion } from '../../types';

export default function DetallePromocionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  
  const [promocion, setPromocion] = useState<Promocion | null>(null);
  const [codigoUso, setCodigoUso] = useState<UsoDePromocion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargandoCodigo, setCargandoCodigo] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    const res = await obtenerPromocionPorId(id as string);
    if (res.error) {
      setError(res.error.mensaje);
    } else if (res.datos) {
      setPromocion(res.datos);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const generarCodigoQR = async () => {
    if (!usuario) {
      alert("Iniciá sesión para usar esta promoción."); // Temporal hasta hacer la pantalla de login
      return;
    }
    setCargandoCodigo(true);
    const res = await obtenerCodigoDeUsoPromocion(id as string, usuario.id);
    if (res.error) {
      alert(res.error.mensaje);
    } else if (res.datos) {
      setCodigoUso(res.datos);
    }
    setCargandoCodigo(false);
  };

  if (cargando) return <EstadoPantalla estado="cargando" />;
  if (error) return <EstadoPantalla estado="error" mensaje={error} onReintentar={cargarDatos} />;
  if (!promocion) return <EstadoPantalla estado="vacio" mensaje="Promoción no encontrada" />;

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloCabecera}>Detalle de Promoción</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.tarjetaInfo}>
          <Text style={styles.titulo}>{promocion.titulo}</Text>
          <Text style={styles.detalle}>{promocion.detalle}</Text>
          
          <View style={styles.filaInfo}>
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
            <Text style={styles.textoInfo}>Válida hasta el {new Date(promocion.hasta).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.tarjetaQR}>
          {!usuario ? (
            <View style={styles.cajaMensaje}>
              <Ionicons name="lock-closed-outline" size={40} color="#94A3B8" />
              <Text style={styles.textoMensaje}>Iniciá sesión o registrate para poder utilizar esta promoción en el local.</Text>
            </View>
          ) : !codigoUso ? (
            <TouchableOpacity style={styles.botonGenerar} onPress={generarCodigoQR} disabled={cargandoCodigo}>
              {cargandoCodigo ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.textoBotonGenerar}>Mostrar mi código QR</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.cajaQRVisible}>
              <Text style={styles.instruccionQR}>Mostrá este código en el mostrador</Text>
              <View style={styles.marcoQR}>
                <QRCode 
                  value={codigoUso.codigo} 
                  size={200} 
                  color="#0F172A" 
                  backgroundColor="#FFFFFF" 
                />
              </View>
              <Text style={styles.codigoTexto}>{codigoUso.codigo}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC' },
  cabecera: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  botonVolver: { padding: 4, marginRight: 12 },
  tituloCabecera: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  scroll: { padding: 16 },
  tarjetaInfo: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 12 },
  detalle: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 16 },
  filaInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8 },
  textoInfo: { fontSize: 14, color: '#475569', marginLeft: 8, fontWeight: '500' },
  tarjetaQR: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  cajaMensaje: { alignItems: 'center', padding: 10 },
  textoMensaje: { textAlign: 'center', color: '#64748B', marginTop: 12, fontSize: 15, lineHeight: 22 },
  botonGenerar: { backgroundColor: '#16A34A', width: '100%', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  textoBotonGenerar: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cajaQRVisible: { alignItems: 'center', width: '100%' },
  instruccionQR: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 20 },
  marcoQR: { padding: 16, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12 },
  codigoTexto: { marginTop: 16, fontSize: 18, fontWeight: 'bold', letterSpacing: 2, color: '#334155' }
});