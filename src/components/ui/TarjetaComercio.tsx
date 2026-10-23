import Ionicons from '@react-native-vector-icons/ionicons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Comercio } from '../../types';
import { obtenerResumenHorario } from '../../utils/horarios';

interface Props {
  comercio: Comercio;
  onPress: () => void;
}

export function TarjetaComercio({ comercio, onPress }: Props) {
  const horarioInfo = obtenerResumenHorario(comercio);

  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cabecera}>
        <Text style={styles.nombre} numberOfLines={1}>{comercio.nombre}</Text>
        {comercio.puntaje > 0 && (
          <View style={styles.cajaPuntaje}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.puntaje}>{comercio.puntaje}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoFila}>
        <Ionicons name="location-outline" size={16} color="#64748B" />
        <Text style={styles.direccion} numberOfLines={1}>{comercio.direccion}</Text>
      </View>

      <View style={styles.pie}>
        <Text style={[styles.etiquetaHorario, horarioInfo.abierto ? styles.abierto : styles.cerrado]}>
          {horarioInfo.etiqueta}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', flex: 1, marginRight: 8 },
  cajaPuntaje: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  puntaje: { fontSize: 14, fontWeight: 'bold', color: '#B45309', marginLeft: 4 },
  infoFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  direccion: { fontSize: 14, color: '#64748B', marginLeft: 6, flex: 1 },
  pie: { flexDirection: 'row', justifyContent: 'flex-start' },
  etiquetaHorario: { fontSize: 14, fontWeight: '700' },
  abierto: { color: '#15803D' },
  cerrado: { color: '#B91C1C' }
});