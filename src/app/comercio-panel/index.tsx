import Ionicons from '@react-native-vector-icons/ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ComercioDashboardScreen() {
  const { usuario, cerrarSesion } = useAuth();
  
  // Hook moderno de expo-camera (SDK 51+)
  const [permisoCamara, pedirPermiso] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(false);
  const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);

  // Manejador cuando la cámara detecta un QR
  const procesarCodigoQR = ({ data }: { data: string }) => {
    setEscaneando(false);
    setUltimoCodigo(data);
    
    // Aquí iría la llamada al servicio real: validarCodigoServicio(data)
    Alert.alert(
      "Código Detectado",
      `El código ${data} ha sido validado exitosamente para aplicar el descuento.`,
      [{ text: "Aceptar", onPress: () => setUltimoCodigo(null) }]
    );
  };

  if (!permisoCamara) {
    return <View style={styles.pantalla} />; // Cargando permisos
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjetaBienvenida}>
        <Ionicons name="storefront" size={40} color="#1E3A8A" />
        <Text style={styles.titulo}>Panel de Control</Text>
        <Text style={styles.subtitulo}>Comercio: {usuario?.nombre}</Text>
      </View>

      {escaneando ? (
        <View style={styles.contenedorCamara}>
          <CameraView 
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={escaneando ? procesarCodigoQR : undefined}
          />
          <View style={styles.capaSuperpuesta}>
            <View style={styles.marcoEscaneo} />
            <Text style={styles.textoCamara}>Apunta al código QR del cliente</Text>
            <TouchableOpacity style={styles.botonCancelar} onPress={() => setEscaneando(false)}>
              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.panelAcciones}>
          {!permisoCamara.granted ? (
            <TouchableOpacity style={styles.botonPrincipal} onPress={pedirPermiso}>
              <Ionicons name="camera-outline" size={24} color="#FFF" />
              <Text style={styles.textoBotonPrincipal}>Habilitar Cámara</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.botonPrincipal} onPress={() => setEscaneando(true)}>
              <Ionicons name="qr-code-outline" size={24} color="#FFF" />
              <Text style={styles.textoBotonPrincipal}>Escanear Promoción</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={styles.textoBotonSalir}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  tarjetaBienvenida: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginTop: 12 },
  subtitulo: { fontSize: 16, color: '#64748B', marginTop: 4 },
  panelAcciones: { gap: 16 },
  botonPrincipal: { flexDirection: 'row', backgroundColor: '#1E3A8A', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  textoBotonPrincipal: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botonSalir: { flexDirection: 'row', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA', gap: 8 },
  textoBotonSalir: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  contenedorCamara: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  camara: { flex: 1 },
  capaSuperpuesta: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  marcoEscaneo: { width: 250, height: 250, borderWidth: 2, borderColor: '#10B981', backgroundColor: 'transparent', borderRadius: 16, marginBottom: 20 },
  textoCamara: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 40 },
  botonCancelar: { backgroundColor: '#FFFFFF', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  textoBotonSecundario: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' }
});