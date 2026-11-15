
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
    actualizarPromocion,
    obtenerPromocionesDelComercioPanel,
} from '../../services/promociones';
import { Promocion } from '../../types';

export default function EditarPromocionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

const { usuario } = useAuth();

const [promocion, setPromocion] = useState<Promocion | null>(null);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState<string | null>(null);
const [titulo, setTitulo] = useState('');
const [detalle, setDetalle] = useState('');
const [descuento, setDescuento] = useState('');
const [fechaInicio, setFechaInicio] = useState('');
const [fechaFin, setFechaFin] = useState('');
const [soloApp, setSoloApp] = useState(false);
const [guardando, setGuardando] = useState(false);

useEffect(() => {
  let activo = true;

  const cargarPromocion = async () => {
    if (!id || !usuario?.comercioId) {
      setError('No se pudo identificar la promoción.');
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const respuesta =
        await obtenerPromocionesDelComercioPanel(
          usuario.comercioId
        );

      if (!activo) return;

      if (respuesta.error) {
        setError(respuesta.error.mensaje);
        return;
      }

      const encontrada = respuesta.datos?.find(
        (promo) => promo.id === id
      );

      if (!encontrada) {
        setError('La promoción no fue encontrada.');
        return;
      }

      setPromocion(encontrada);
      setTitulo(encontrada.titulo);
        setDetalle(encontrada.detalle);
        setDescuento(
            encontrada.descuento != null
                ? String(encontrada.descuento)
                : ''
            );
           
const fechaArgentina = (valor: string) => {
  const fecha = new Date(valor);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha);
};

setFechaInicio(fechaArgentina(encontrada.desde));
setFechaFin(fechaArgentina(encontrada.hasta));

    } catch {
      if (activo) {
        setError('No se pudo cargar la promoción.');
      }
    } finally {
      if (activo) {
        setCargando(false);
      }
    }
  };

  cargarPromocion();

  return () => {
    activo = false;
  };
}, [id, usuario?.comercioId]);


const guardarCambios = async () => {
  if (!id || !promocion || guardando) return;

  const tituloLimpio = titulo.trim();
  const detalleLimpio = detalle.trim();

  if (!tituloLimpio || !detalleLimpio) {
    Alert.alert(
      'Campos obligatorios',
      'Completá el título y la descripción.'
    );
    return;
  }

  const descuentoLimpio = descuento.trim();
  const numeroDescuento =
    descuentoLimpio === '' ? null : Number(descuentoLimpio);

  if (
    numeroDescuento !== null &&
    (!Number.isInteger(numeroDescuento) ||
      numeroDescuento < 1 ||
      numeroDescuento > 100)
  ) {
    Alert.alert(
      'Descuento inválido',
      'Ingresá un porcentaje entre 1 y 100.'
    );
    return;
  }

  const convertirFechaAISO = (
    fecha: string,
    finDelDia = false
  ): string | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return null;
    }

    const hora = finDelDia ? '23:59:59' : '00:00:00';
    const fechaISO = `${fecha}T${hora}-03:00`;
    const fechaConvertida = new Date(fechaISO);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return null;
    }

    const fechaComprobacion = new Date(
      fechaConvertida.getTime() - 3 * 60 * 60 * 1000
    ).toISOString().slice(0, 10);

    return fechaComprobacion === fecha
      ? fechaConvertida.toISOString()
      : null;
  };

  const desde = convertirFechaAISO(fechaInicio.trim());
  const hasta = convertirFechaAISO(fechaFin.trim(), true);

  if (!desde || !hasta) {
    Alert.alert(
      'Fechas inválidas',
      'Ingresá fechas válidas con formato AAAA-MM-DD.'
    );
    return;
  }

  if (new Date(desde).getTime() > new Date(hasta).getTime()) {
    Alert.alert(
      'Fechas incorrectas',
      'La fecha de inicio no puede ser posterior al vencimiento.'
    );
    return;
  }

  try {
    setGuardando(true);

    const respuesta = await actualizarPromocion(id, {
      titulo: tituloLimpio,
      detalle: detalleLimpio,
      descuento: numeroDescuento,
      desde,
      hasta,
      soloApp,
    });

    if (respuesta.error) {
      Alert.alert(
        'No se pudo actualizar',
        respuesta.error.mensaje
      );
      return;
    }

    Alert.alert(
      'Promoción actualizada',
      'Los cambios se guardaron correctamente.',
      [
        {
          text: 'Aceptar',
          onPress: () => router.back(),
        },
      ]
    );
  } catch {
    Alert.alert(
      'Error',
      'No se pudieron guardar los cambios. Intentá nuevamente.'
    );
  } finally {
    setGuardando(false);
  }
};

  
return (
  <>
    <Stack.Screen options={{ title: 'Editar promoción' }} />

    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <Text style={styles.titulo}>
        Editar promoción
      </Text>

      <Text style={styles.descripcion}>
        Modificá los datos de la promoción de tu comercio.
      </Text>

      <View style={styles.tarjeta}>
        {cargando ? (
          <Text style={styles.texto}>
            Cargando promoción...
          </Text>
        ) : error ? (
          <Text style={styles.texto}>
            {error}
          </Text>
        ) : promocion ? (
          <>
            <Text style={styles.etiqueta}>
              Título de la promoción *
            </Text>

            <TextInput
              style={styles.campo}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Título de la promoción"
              maxLength={120}
            />

            <Text style={styles.etiqueta}>
              Descripción de la promoción *
            </Text>

            <TextInput
              style={[styles.campo, styles.campoMultilinea]}
              value={detalle}
              onChangeText={setDetalle}
              placeholder="Descripción de la promoción"
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
            />

            <Text style={styles.etiqueta}>
              Descuento (%) - Opcional
            </Text>

            <TextInput
              style={styles.campo}
              value={descuento}
              onChangeText={(texto) => {
                const soloNumeros = texto.replace(/[^0-9]/g, '');
                setDescuento(soloNumeros);
              }}
              placeholder="Ej: 15"
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.ayuda}>
              Ingresá un número del 1 al 100. Dejalo vacío
              si la promoción no tiene descuento porcentual.
            </Text>

            <Text style={styles.etiqueta}>
              Fecha de inicio *
            </Text>

            <TextInput
              style={styles.campo}
              value={fechaInicio}
              onChangeText={setFechaInicio}
              placeholder="AAAA-MM-DD"
              maxLength={10}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.etiqueta}>
              Fecha de vencimiento *
            </Text>

            <TextInput
              style={styles.campo}
              value={fechaFin}
              onChangeText={setFechaFin}
              placeholder="AAAA-MM-DD"
              maxLength={10}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.ayuda}>
              Ingresá las fechas con el formato AAAA-MM-DD.
              Por ejemplo: 2026-11-30.
            </Text>

            
<View style={styles.filaSwitch}>
  <View style={styles.contenedorSwitch}>
    <Text style={styles.etiqueta}>
      Solo con la app
    </Text>

    <Text style={styles.ayuda}>
      La promoción requiere utilizar la aplicación.
    </Text>
  </View>

  <Switch
    value={soloApp}
    onValueChange={setSoloApp}
    trackColor={{
      false: '#CBD5E1',
      true: '#93C5FD',
    }}
    thumbColor={soloApp ? '#2563EB' : '#F1F5F9'}
  />
</View>


<TouchableOpacity
  style={[
    styles.botonGuardar,
    guardando && styles.botonDeshabilitado,
  ]}
  onPress={guardarCambios}
  disabled={guardando}
>
  <Text style={styles.textoBotonGuardar}>
    {guardando ? 'Guardando...' : 'Guardar cambios'}
  </Text>
</TouchableOpacity>


          </>
        ) : null}
      </View>
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
    gap: 12,
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  ayuda: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

etiqueta: {
  fontSize: 15,
  fontWeight: '600',
  color: '#334155',
  marginBottom: 4,
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
},
campoMultilinea: {
  minHeight: 110,
},
filaSwitch: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  paddingVertical: 8,
},
contenedorSwitch: {
  flex: 1,
  gap: 4,
},
botonGuardar: {
  backgroundColor: '#2563EB',
  borderRadius: 10,
  paddingVertical: 15,
  alignItems: 'center',
  marginTop: 12,
},
botonDeshabilitado: {
  opacity: 0.6,
},
textoBotonGuardar: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
},
});
