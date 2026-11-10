import Ionicons from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { iniciarSesionServicio, registrarUsuarioServicio } from '../../services/usuarios';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();
  
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const procesarFormulario = async () => {
    // Validaciones básicas antes de tocar el servicio
    if (!email.trim() || !contrasena.trim()) {
      setErrorMensaje("Por favor, completá tu correo y contraseña.");
      return;
    }
    
    if (modo === 'registro' && !nombre.trim()) {
      setErrorMensaje("Para registrarte, ingresá tu nombre completo.");
      return;
    }

    setCargando(true);
    setErrorMensaje(null);

    const respuesta = modo === 'login' 
      ? await iniciarSesionServicio(email, contrasena)
      : await registrarUsuarioServicio(nombre, email, contrasena);

    if (respuesta.error) {
      setErrorMensaje(respuesta.error.mensaje);
      setCargando(false);
    } else if (respuesta.datos) {
      // Inyectamos el usuario y token en el contexto global
      await iniciarSesion(respuesta.datos.usuario, respuesta.datos.token);
      setCargando(false);
      
      // Si el login fue exitoso, cerramos el modal
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.pantalla}
    >
      <View style={styles.contenedorCabecera}>
        <TouchableOpacity style={styles.botonCerrar} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={28} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.cajaIcono}>
          <Ionicons name="person-circle-outline" size={80} color="#1E3A8A" />
        </View>

        <Text style={styles.titulo}>
          {modo === 'login' ? 'Iniciá Sesión' : 'Creá tu Cuenta'}
        </Text>
        
        <Text style={styles.subtitulo}>
          {modo === 'login' 
            ? 'Para usar promociones y guardar favoritos.' 
            : 'Unite para acceder a descuentos locales.'}
        </Text>

        {errorMensaje && (
          <View style={styles.cajaError}>
            <Ionicons name="warning-outline" size={20} color="#B91C1C" />
            <Text style={styles.textoError}>{errorMensaje}</Text>
          </View>
        )}

        <View style={styles.formulario}>
          {modo === 'registro' && (
            <TextInput
              style={styles.input}
              placeholder="Nombre y Apellido"
              placeholderTextColor="#94A3B8"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              editable={!cargando}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!cargando}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={contrasena}
            onChangeText={setContrasena}
            editable={!cargando}
          />

          <TouchableOpacity 
            style={[styles.botonPrincipal, cargando && styles.botonDesactivado]} 
            onPress={procesarFormulario}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotonPrincipal}>
                {modo === 'login' ? 'Ingresar' : 'Registrarme'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.botonSecundario} 
          onPress={() => {
            setModo(modo === 'login' ? 'registro' : 'login');
            setErrorMensaje(null);
          }}
          disabled={cargando}
        >
          <Text style={styles.textoBotonSecundario}>
            {modo === 'login' 
              ? '¿No tenés cuenta? Registrate acá' 
              : '¿Ya tenés cuenta? Iniciá sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#FFFFFF' },
  contenedorCabecera: { padding: 16, paddingTop: 50, alignItems: 'flex-end' },
  botonCerrar: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  cuerpo: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 60 },
  cajaIcono: { alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitulo: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  cajaError: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  textoError: { color: '#B91C1C', marginLeft: 8, flex: 1, fontSize: 14, fontWeight: '500' },
  formulario: { width: '100%' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 16, color: '#0F172A' },
  botonPrincipal: { backgroundColor: '#1E3A8A', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonDesactivado: { backgroundColor: '#94A3B8' },
  textoBotonPrincipal: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  botonSecundario: { marginTop: 24, padding: 12, alignItems: 'center' },
  textoBotonSecundario: { color: '#1E3A8A', fontSize: 16, fontWeight: '600' }
});