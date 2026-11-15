
import Ionicons from '@react-native-vector-icons/ionicons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import { responderResenaPorComercio } from '../../services/resenas';
import { Resena } from '../../types';

interface ResponderResenaProps {
  resena: Resena;
  alResponder: () => void | Promise<void>;
}

export function ResponderResena({
  resena,
  alResponder,
}: ResponderResenaProps) {
  const { usuario } = useAuth();

  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);

  const puedeResponder =
    usuario?.rol === 'comercio' &&
    usuario.comercioId === resena.comercioId &&
    !resena.respuesta;

  if (!puedeResponder) return null;

  const enviarRespuesta = async () => {
    const texto = respuesta.trim();

    if (!texto || enviando) return;

    setEnviando(true);

    try {
      const token = await SecureStore.getItemAsync('sesion_token');

if (!token) {
  Alert.alert(
    'Sesión requerida',
    'Iniciá sesión nuevamente para responder la reseña.'
  );
  return;
}

const resultado = await responderResenaPorComercio(
  resena.id,
  resena.comercioId,
  texto,
  token
);

      if (resultado.error) {
        Alert.alert('No se pudo responder', resultado.error.mensaje);
        return;
      }

      if (!resultado.datos) {
        Alert.alert(
          'Error',
          'El servidor no confirmó la respuesta.'
        );
        return;
      }

      setRespuesta('');
      setMostrandoFormulario(false);

      Alert.alert(
        'Respuesta enviada',
        'Tu respuesta se publicó correctamente.'
      );

      await alResponder();
    } catch {
      Alert.alert(
        'Error',
        'Ocurrió un problema al enviar la respuesta.'
      );
    } finally {
      setEnviando(false);
    }
  };

  if (!mostrandoFormulario) {
    return (
      <TouchableOpacity
        style={styles.botonResponder}
        onPress={() => setMostrandoFormulario(true)}
      >
        <Ionicons
          name="chatbubble-outline"
          size={18}
          color="#1E3A8A"
        />
        <Text style={styles.textoBoton}>Responder reseña</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Respuesta del comercio</Text>

      <TextInput
        style={styles.campo}
        value={respuesta}
        onChangeText={setRespuesta}
        placeholder="Escribí una respuesta al cliente..."
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={500}
        editable={!enviando}
        textAlignVertical="top"
      />

      <Text style={styles.contador}>
        {respuesta.length}/500
      </Text>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.cancelar}
          disabled={enviando}
          onPress={() => {
            setMostrandoFormulario(false);
            setRespuesta('');
          }}
        >
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enviar,
            (!respuesta.trim() || enviando) && styles.deshabilitado,
          ]}
          disabled={!respuesta.trim() || enviando}
          onPress={enviarRespuesta}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoEnviar}>Publicar respuesta</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  botonResponder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  textoBoton: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 14,
  },
  contenedor: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
  },
  campo: {
    minHeight: 90,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    fontSize: 14,
    color: '#334155',
  },
  contador: {
    textAlign: 'right',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelar: {
    padding: 10,
    justifyContent: 'center',
  },
  textoCancelar: {
    color: '#64748B',
    fontWeight: '600',
  },
  enviar: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textoEnviar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deshabilitado: {
    opacity: 0.5,
  },
});
