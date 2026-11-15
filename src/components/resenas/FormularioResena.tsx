
import Ionicons from '@react-native-vector-icons/ionicons';
import * as SecureStore from 'expo-secure-store';
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

import { useAuth } from '../../context/AuthContext';
import { crearResena } from '../../services/resenas';
import { Estrellas } from '../../types';

interface FormularioResenaProps {
  comercioId: string;
  alPublicar: () => void | Promise<void>;
}

export function FormularioResena({
  comercioId,
  alPublicar,
}: FormularioResenaProps) {
  const { usuario } = useAuth();

  const [estrellas, setEstrellas] = useState<Estrellas>(5);
  const [comentario, setComentario] = useState('');
  const [publicando, setPublicando] = useState(false);

  const publicar = async () => {
    if (!usuario || publicando) return;

    if (!comentario.trim()) {
      Alert.alert(
        'Comentario obligatorio',
        'Escribí tu opinión antes de publicar.'
      );
      return;
    }

    setPublicando(true);

    try {
      const token = await SecureStore.getItemAsync('sesion_token');

      if (!token) {
        Alert.alert(
          'Sesión requerida',
          'Iniciá sesión nuevamente para publicar tu reseña.'
        );
        return;
      }

      const respuesta = await crearResena(
        {
          comercioId,
          usuarioId: usuario.id,
          estrellas,
          comentario: comentario.trim(),
        },
        token
      );

      if (respuesta.error) {
        Alert.alert(
          'No se pudo publicar',
          respuesta.error.mensaje
        );
        return;
      }

      if (!respuesta.datos) {
        Alert.alert(
          'No se pudo confirmar',
          'El servidor no confirmó la publicación de la reseña.'
        );
        return;
      }

      setComentario('');
      setEstrellas(5);

      Alert.alert(
        '¡Reseña publicada!',
        'Gracias por compartir tu opinión.'
      );

      try {
        await alPublicar();
      } catch {
        // La reseña ya fue publicada.
        // El listado puede actualizarse manualmente.
      }
    } catch {
      Alert.alert(
        'Error',
        'Ocurrió un problema al publicar la reseña.'
      );
    } finally {
      setPublicando(false);
    }
  };

  if (!usuario) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Compartí tu experiencia</Text>

        <Text style={styles.descripcion}>
          Iniciá sesión para dejar tu calificación y comentario.
        </Text>
      </View>
    );
  }

  if (usuario.rol !== 'vecino') {
    return null;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Escribir una reseña</Text>

      <Text style={styles.descripcion}>
        Contanos cómo fue tu experiencia en este comercio.
      </Text>

      <Text style={styles.etiqueta}>Tu calificación</Text>

      <View style={styles.estrellas}>
        {([1, 2, 3, 4, 5] as Estrellas[]).map((valor) => (
          <TouchableOpacity
            key={valor}
            onPress={() => setEstrellas(valor)}
            disabled={publicando}
            accessibilityRole="button"
            accessibilityLabel={`Calificar con ${valor} estrellas`}
          >
            <Ionicons
              name={valor <= estrellas ? 'star' : 'star-outline'}
              size={34}
              color="#F59E0B"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.etiqueta}>Tu comentario</Text>

      <TextInput
        style={styles.campoComentario}
        value={comentario}
        onChangeText={setComentario}
        placeholder="Escribí tu experiencia..."
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={500}
        editable={!publicando}
        textAlignVertical="top"
      />

      <Text style={styles.contador}>
        {comentario.length}/500 caracteres
      </Text>

      <TouchableOpacity
        style={[
          styles.botonPublicar,
          (publicando || !comentario.trim()) && styles.botonDeshabilitado,
        ]}
        onPress={publicar}
        disabled={publicando || !comentario.trim()}
      >
        {publicando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="send-outline" size={18} color="#FFFFFF" />
            <Text style={styles.textoBoton}>Publicar reseña</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },
  estrellas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  campoComentario: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    fontSize: 14,
    color: '#0F172A',
  },
  contador: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 16,
  },
  botonPublicar: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
