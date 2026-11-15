
import Ionicons from '@react-native-vector-icons/ionicons';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { reportarResena } from '../../services/resenas';
import { Resena } from '../../types';

interface ReportarResenaProps {
  resena: Resena;
  alReportar: () => void | Promise<void>;
}

export function ReportarResena({
  resena,
  alReportar,
}: ReportarResenaProps) {
  const { usuario } = useAuth();
  const [procesando, setProcesando] = useState(false);

  // Solo usuarios autenticados, excepto el autor.
  if (!usuario || usuario.id === resena.usuarioId) {
    return null;
  }

  // Evitamos mostrar el botón si ya fue reportada.
  if (resena.reportada) {
    return null;
  }

  const ejecutarReporte = async () => {
    if (procesando) return;

    setProcesando(true);

    try {
      const token = await SecureStore.getItemAsync('sesion_token');

      if (!token) {
        Alert.alert(
          'Sesión requerida',
          'Iniciá sesión nuevamente para reportar.'
        );
        return;
      }

      const resultado = await reportarResena(resena.id, token);

      if (resultado.error) {
        Alert.alert(
          'No se pudo reportar',
          resultado.error.mensaje
        );
        return;
      }

      if (!resultado.datos) {
        Alert.alert(
          'No se pudo confirmar',
          'El servidor no confirmó el reporte.'
        );
        return;
      }

      Alert.alert(
        'Reporte enviado',
        'Gracias por ayudarnos a mantener un espacio respetuoso.'
      );

      await alReportar();
    } catch {
      Alert.alert(
        'Error',
        'Ocurrió un problema al reportar la reseña.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarReporte = () => {
    Alert.alert(
      'Reportar reseña',
      '¿Querés reportar esta reseña por contenido inapropiado?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: () => {
            void ejecutarReporte();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity
        style={styles.boton}
        onPress={confirmarReporte}
        disabled={procesando}
        accessibilityRole="button"
        accessibilityLabel="Reportar reseña"
      >
        {procesando ? (
          <ActivityIndicator size="small" color="#64748B" />
        ) : (
          <Ionicons
            name="flag-outline"
            size={16}
            color="#64748B"
          />
        )}

        <Text style={styles.texto}>Reportar reseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  texto: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
