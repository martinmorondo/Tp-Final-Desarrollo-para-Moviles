import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';

import { useRouter } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';
import { crearPromocion } from '../../services/promociones';

function convertirFechaAISO(
  fecha: string,
  finDelDia = false
): string | null {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    fecha.trim()
  );

  if (!coincidencia) {
    return null;
  }

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);

  const fechaValidada = new Date(
    Date.UTC(anio, mes - 1, dia)
  );

  if (
    fechaValidada.getUTCFullYear() !== anio ||
    fechaValidada.getUTCMonth() !== mes - 1 ||
    fechaValidada.getUTCDate() !== dia
  ) {
    return null;
  }

  const hora = finDelDia
    ? '23:59:59'
    : '00:00:00';

  const fechaArgentina = new Date(
    `${fecha.trim()}T${hora}-03:00`
  );

  return fechaArgentina.toISOString();
}


export default function NuevaPromocionScreen() {
  const [titulo, setTitulo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [descuento, setDescuento] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [soloApp, setSoloApp] = useState(false);
  const router = useRouter();
  const [publicando, setPublicando] = useState(false);


const publicarPromocion = async () => {
  if (publicando) return;

  if (!titulo.trim() || !detalle.trim()) {
    Alert.alert(
      'Campos obligatorios',
      'Completá el título y la descripción.'
    );
    return;
  }

  if (descuento.trim()) {
    const porcentaje = Number(descuento);

    if (
      !Number.isInteger(porcentaje) ||
      porcentaje < 1 ||
      porcentaje > 100
    ) {
      Alert.alert(
        'Descuento inválido',
        'Ingresá un porcentaje entre 1 y 100.'
      );
      return;
    }
  }

  if (!fechaFin.trim()) {
    Alert.alert(
      'Fecha obligatoria',
      'Ingresá la fecha de vencimiento.'
    );
    return;
  }

  const hasta = convertirFechaAISO(fechaFin, true);

  if (!hasta) {
    Alert.alert(
      'Fecha inválida',
      'Ingresá una fecha de vencimiento válida.'
    );
    return;
  }

  const desde = fechaInicio.trim()
    ? convertirFechaAISO(fechaInicio)
    : undefined;

  if (fechaInicio.trim() && !desde) {
    Alert.alert(
      'Fecha inválida',
      'Ingresá una fecha de inicio válida.'
    );
    return;
  }

  const ahora = Date.now();
  const inicioEfectivo = desde
    ? new Date(desde).getTime()
    : ahora;

  if (new Date(hasta).getTime() <= ahora) {
    Alert.alert(
      'Vencimiento inválido',
      'La fecha de vencimiento debe ser futura.'
    );
    return;
  }

  if (new Date(hasta).getTime() <= inicioEfectivo) {
    Alert.alert(
      'Fechas inválidas',
      'El vencimiento debe ser posterior al inicio.'
    );
    return;
  }

  try {
    setPublicando(true);

    await crearPromocion({
      titulo: titulo.trim(),
      detalle: detalle.trim(),
      descuento: descuento.trim()
        ? Number(descuento)
        : null,
      ...(desde ? { desde } : {}),
      hasta,
      soloApp,
    });

    Alert.alert(
      'Promoción publicada',
      'La promoción se creó correctamente.',
      [
        {
          text: 'Aceptar',
          onPress: () => router.back(),
        },
      ]
    );
  } catch (error) {
    Alert.alert(
      'Error al publicar',
      error instanceof Error
        ? error.message
        : 'No se pudo crear la promoción.'
    );
  } finally {
    setPublicando(false);
  }
};

  return (
    <>
      <Stack.Screen
        options={{ title: 'Nueva promoción' }}
      />

      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
      >
        <Text style={styles.titulo}>
          Crear nueva promoción
        </Text>

        <Text style={styles.descripcion}>
          Completá los datos para publicar una promoción
          de tu comercio.
        </Text>

        

<View style={styles.tarjeta}>
  {/* Título */}
  <Text style={styles.etiqueta}>
    Título de la promoción *
  </Text>

  <TextInput
    style={styles.campo}
    placeholder="Ej: 20% de descuento en herramientas"
    value={titulo}
    onChangeText={setTitulo}
    maxLength={120}
  />

  {/* Descripción */}
  <Text style={styles.etiqueta}>
    Descripción de la promoción *
  </Text>

  <TextInput
    style={[styles.campo, styles.campoMultilinea]}
    placeholder="Ej: Válido en herramientas seleccionadas..."
    value={detalle}
    onChangeText={setDetalle}
    multiline
    numberOfLines={4}
    maxLength={2000}
    textAlignVertical="top"
  />

  {/* Descuento */}
  <Text style={styles.etiqueta}>
    Descuento (%) - Opcional
  </Text>

  <TextInput
    style={styles.campo}
    placeholder="Ej: 20"
    value={descuento}
    onChangeText={(texto) => {
      const soloNumeros = texto.replace(/[^0-9]/g, '');
      setDescuento(soloNumeros);
    }}
    keyboardType="number-pad"
    maxLength={3}
  />

  <Text style={styles.ayuda}>
    Ingresá un número del 1 al 100. Dejalo vacío si la
    promoción no tiene descuento porcentual.
  </Text>

  {/* Fecha de inicio */}
  <Text style={styles.etiqueta}>
    Fecha de inicio - Opcional
  </Text>

  <TextInput
    style={styles.campo}
    placeholder="AAAA-MM-DD (Ej: 2026-11-16)"
    value={fechaInicio}
    onChangeText={setFechaInicio}
    maxLength={10}
    keyboardType="numbers-and-punctuation"
    autoCapitalize="none"
  />

  <Text style={styles.ayuda}>
    Dejá este campo vacío para que la promoción comience
    inmediatamente.
  </Text>

  {/* Fecha de vencimiento */}
  <Text style={styles.etiqueta}>
    Fecha de vencimiento *
  </Text>

  <TextInput
    style={styles.campo}
    placeholder="AAAA-MM-DD (Ej: 2026-11-30)"
    value={fechaFin}
    onChangeText={setFechaFin}
    maxLength={10}
    keyboardType="numbers-and-punctuation"
    autoCapitalize="none"
  />

  <Text style={styles.ayuda}>
    Indicá el último día de vigencia de la promoción.
  </Text>


<View style={styles.contenedorSwitch}>
  <View style={styles.informacionSwitch}>
    <Text style={styles.etiquetaSwitch}>
      Solo con la app
    </Text>

    <Text style={styles.descripcionSwitch}>
      Si activás esta opción, el cliente deberá generar
      un código QR desde la aplicación para utilizar
      la promoción.
    </Text>
  </View>

  <Switch
    value={soloApp}
    onValueChange={setSoloApp}
    trackColor={{
      false: '#CBD5E1',
      true: '#86EFAC',
    }}
    thumbColor={soloApp ? '#16A34A' : '#F8FAFC'}
  />
</View>

</View>


<TouchableOpacity
  style={[
    styles.botonPublicar,
    publicando && styles.botonDeshabilitado,
  ]}
  onPress={publicarPromocion}
  disabled={publicando}
>
  <Text style={styles.textoBotonPublicar}>
    {publicando ? 'Publicando...' : 'Publicar promoción'}
  </Text>
</TouchableOpacity>



      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contenido: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  descripcion: {
    fontSize: 15,
    color: '#64748B',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  texto: {
    fontSize: 16,
    color: '#475569',
  },

etiqueta: {
  fontSize: 15,
  fontWeight: '600',
  color: '#334155',
  marginBottom: 8,
},
campo: {
  borderWidth: 1,
  borderColor: '#CBD5E1',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  color: '#0F172A',
  backgroundColor: '#FFFFFF',
  marginBottom: 18,
},
campoMultilinea: {
  minHeight: 110,
},
ayuda: {
  fontSize: 13,
  color: '#64748B',
  marginTop: -10,
  marginBottom: 18,
  lineHeight: 19,
},

contenedorSwitch: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 16,
  borderTopWidth: 1,
  borderTopColor: '#E2E8F0',
  gap: 12,
},
informacionSwitch: {
  flex: 1,
},
etiquetaSwitch: {
  fontSize: 16,
  fontWeight: '600',
  color: '#0F172A',
  marginBottom: 6,
},
descripcionSwitch: {
  fontSize: 13,
  color: '#64748B',
  lineHeight: 19,
},
botonPublicar: {
  backgroundColor: '#16A34A',
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
},
botonDeshabilitado: {
  opacity: 0.6,
},
textoBotonPublicar: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
},

});
