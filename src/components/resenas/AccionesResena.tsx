
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
import {
    editarResena,
    eliminarResena,
} from '../../services/resenas';
import { Estrellas, Resena } from '../../types';

interface AccionesResenaProps {
  resena: Resena;
  alActualizar: () => void | Promise<void>;
}

export function AccionesResena({
  resena,
  alActualizar,
}: AccionesResenaProps) {
  const { usuario } = useAuth();

  const [editando, setEditando] = useState(false);
  const [estrellas, setEstrellas] = useState<Estrellas>(resena.estrellas);
  const [comentario, setComentario] = useState(resena.comentario);
  const [procesando, setProcesando] = useState(false);

  // Solo el autor puede modificar o eliminar su reseña.
  if (!usuario || usuario.id !== resena.usuarioId) {
    return null;
  }

  const iniciarEdicion = () => {
    setEstrellas(resena.estrellas);
    setComentario(resena.comentario);
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setEstrellas(resena.estrellas);
    setComentario(resena.comentario);
  };

  const guardarCambios = async () => {
    if (procesando) return;

    if (!comentario.trim()) {
      Alert.alert(
        'Comentario obligatorio',
        'Escribí un comentario antes de guardar.'
      );
      return;
    }

    setProcesando(true);

    try {
      const token = await SecureStore.getItemAsync('sesion_token');

      if (!token) {
        Alert.alert(
          'Sesión requerida',
          'Iniciá sesión nuevamente para editar tu reseña.'
        );
        return;
      }

      const respuesta = await editarResena(
        resena.id,
        usuario.id,
        {
          estrellas,
          comentario: comentario.trim(),
        },
        token
      );

      if (respuesta.error) {
        Alert.alert(
          'No se pudo editar',
          respuesta.error.mensaje
        );
        return;
      }

      if (!respuesta.datos) {
        Alert.alert(
          'Error',
          'El servidor no confirmó la modificación.'
        );
        return;
      }

      setEditando(false);

      Alert.alert(
        'Reseña actualizada',
        'Los cambios se guardaron correctamente.'
      );

      await alActualizar();
    } catch {
      Alert.alert(
        'Error',
        'No se pudo completar la operación.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (procesando) return;

    setProcesando(true);

    try {
      const token = await SecureStore.getItemAsync('sesion_token');

      if (!token) {
        Alert.alert(
          'Sesión requerida',
          'Iniciá sesión nuevamente para eliminar tu reseña.'
        );
        return;
      }

      const respuesta = await eliminarResena(
        resena.id,
        usuario.id,
        token
      );

      if (respuesta.error) {
        Alert.alert(
          'No se pudo eliminar',
          respuesta.error.mensaje
        );
        return;
      }

      // Una eliminación puede responder sin cuerpo (HTTP 204).
      // Por eso verificamos la ausencia de error.
      setEditando(false);

      Alert.alert(
        'Reseña eliminada',
        'Tu reseña fue eliminada correctamente.'
      );

      await alActualizar();
    } catch {
      Alert.alert(
        'Error',
        'No se pudo eliminar la reseña.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminacion = () => {
    Alert.alert(
      'Eliminar reseña',
      '¿Estás seguro de que querés eliminar tu reseña? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void ejecutarEliminacion();
          },
        },
      ]
    );
  };

  if (editando) {
    return (
      <View style={styles.formularioEdicion}>
        <Text style={styles.titulo}>
          Editar tu reseña
        </Text>

        <Text style={styles.etiqueta}>
          Calificación
        </Text>

        <View style={styles.filaEstrellas}>
          {([1, 2, 3, 4, 5] as Estrellas[]).map((valor) => (
            <TouchableOpacity
              key={valor}
              onPress={() => setEstrellas(valor)}
              disabled={procesando}
              accessibilityRole="button"
              accessibilityLabel={`${valor} estrellas`}
            >
              <Ionicons
                name={valor <= estrellas ? 'star' : 'star-outline'}
                size={30}
                color="#F59E0B"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiqueta}>
          Comentario
        </Text>

        <TextInput
          style={styles.campoComentario}
          value={comentario}
          onChangeText={setComentario}
          multiline
          maxLength={500}
          editable={!procesando}
          textAlignVertical="top"
        />

        <Text style={styles.contador}>
          {comentario.length}/500 caracteres
        </Text>

        <View style={styles.filaAcciones}>
          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={cancelarEdicion}
            disabled={procesando}
          >
            <Text style={styles.textoCancelar}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botonGuardar,
              (procesando || !comentario.trim()) &&
                styles.botonDeshabilitado,
            ]}
            onPress={guardarCambios}
            disabled={procesando || !comentario.trim()}
          >
            {procesando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.textoGuardar}>
                  Guardar cambios
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.acciones}>
      <TouchableOpacity
        style={styles.botonEditar}
        onPress={iniciarEdicion}
        disabled={procesando}
      >
        <Ionicons
          name="create-outline"
          size={17}
          color="#1E3A8A"
        />

        <Text style={styles.textoEditar}>
          Editar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonEliminar}
        onPress={confirmarEliminacion}
        disabled={procesando}
      >
        {procesando ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <Ionicons
            name="trash-outline"
            size={17}
            color="#DC2626"
          />
        )}

        <Text style={styles.textoEliminar}>
          Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  botonEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },

  textoEditar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
  },

  botonEliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },

  textoEliminar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },

  formularioEdicion: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  titulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },

  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },

  filaEstrellas: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  campoComentario: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: 14,
  },

  contador: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 14,
  },

  filaAcciones: {
    flexDirection: 'row',
    gap: 10,
  },

  botonCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoCancelar: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },

  botonGuardar: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },

  textoGuardar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
