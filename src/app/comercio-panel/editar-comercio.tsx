import Ionicons from '@react-native-vector-icons/ionicons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  actualizarComercio,
  obtenerComercioPorId,
} from '../../services/comercios';
import { Comercio, DiaSemana, Horario } from '../../types';

const DIAS: { numero: DiaSemana; nombre: string }[] = [
  { numero: 1, nombre: 'Lunes' },
  { numero: 2, nombre: 'Martes' },
  { numero: 3, nombre: 'Miércoles' },
  { numero: 4, nombre: 'Jueves' },
  { numero: 5, nombre: 'Viernes' },
  { numero: 6, nombre: 'Sábado' },
  { numero: 0, nombre: 'Domingo' },
];

// Ejemplo de edición: "08:00-12:00, 16:00-20:00".
function mostrarHorarios(horarios: Horario[], dia: DiaSemana): string {
  return horarios
    .filter((horario) => horario.dia === dia)
    .map((horario) => `${horario.abre}-${horario.cierra}`)
    .join(', ');
}

function convertirHorarios(entradas: Record<number, string>): Horario[] {
  const resultado: Horario[] = [];
  const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

  for (const { numero, nombre } of DIAS) {
    const texto = entradas[numero].trim();
    if (!texto) continue; // Sin tramos = cerrado ese día.

    for (const tramoSinLimpiar of texto.split(',')) {
      const tramo = tramoSinLimpiar.trim();
      const partes = tramo.split('-').map((parte) => parte.trim());

      if (
        partes.length !== 2 ||
        !formatoHora.test(partes[0]) ||
        !formatoHora.test(partes[1]) ||
        partes[0] >= partes[1]
      ) {
        throw new Error(
          `Revisá el horario de ${nombre}. Usá 08:00-12:00, 16:00-20:00.`,
        );
      }

      resultado.push({ dia: numero, abre: partes[0], cierra: partes[1] });
    }
  }

  return resultado;
}

export default function EditarComercioScreen() {
  const { usuario } = useAuth();
  const router = useRouter();

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [horarios, setHorarios] = useState<Record<number, string>>({});

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!usuario?.comercioId) {
        setError('Esta cuenta no tiene un comercio asociado.');
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        const respuesta = await obtenerComercioPorId(usuario.comercioId);
        if (!activo) return;

        if (!respuesta.datos) {
          setError(respuesta.error?.mensaje ?? 'No se pudo cargar el comercio.');
          return;
        }

        const datos = respuesta.datos;
        setComercio(datos);
        setNombre(datos.nombre);
        setDescripcion(datos.descripcion);
        setDireccion(datos.direccion);
        setTelefono(datos.telefono ?? '');
        setWhatsapp(datos.whatsapp ?? '');
        setInstagram(datos.instagram ?? '');

        const horariosIniciales: Record<number, string> = {};
        for (const { numero } of DIAS) {
          horariosIniciales[numero] = mostrarHorarios(datos.horarios ?? [], numero);
        }
        setHorarios(horariosIniciales);
      } catch {
        if (activo) setError('No se pudo conectar con el servidor.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, [usuario?.comercioId]);

  async function guardarCambios() {
    if (!comercio || guardando) return;

    if (!nombre.trim() || !descripcion.trim() || !direccion.trim()) {
      Alert.alert('Datos incompletos', 'Completá nombre, descripción y dirección.');
      return;
    }

    const whatsappLimpio = whatsapp.trim();
    if (whatsappLimpio && !/^\d+$/.test(whatsappLimpio)) {
      Alert.alert('WhatsApp inválido', 'Ingresá solamente números, con código de país.');
      return;
    }

    const instagramLimpio = instagram.trim();
    if (instagramLimpio && !instagramLimpio.startsWith('@')) {
      Alert.alert('Instagram inválido', 'El usuario de Instagram debe empezar con @.');
      return;
    }

    let nuevosHorarios: Horario[];
    try {
      nuevosHorarios = convertirHorarios(horarios);
    } catch (errorHorario) {
      Alert.alert(
        'Horario inválido',
        errorHorario instanceof Error ? errorHorario.message : 'Revisá los horarios.',
      );
      return;
    }

    setGuardando(true);
    try {
      const token = await SecureStore.getItemAsync('sesion_token');
      if (!token) {
        Alert.alert('Sesión vencida', 'Volvé a iniciar sesión para guardar los cambios.');
        return;
      }

      // Enviamos exclusivamente los campos admitidos por ActualizarComercioDto.
      // El backend identifica el comercio a partir del token autenticado.
      const respuesta = await actualizarComercio(
        comercio.id,
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim() || null,
          whatsapp: whatsappLimpio || null,
          instagram: instagramLimpio || null,
          horarios: nuevosHorarios,
        },
        token,
      );

      if (respuesta.error) {
        Alert.alert('No se pudo guardar', respuesta.error.mensaje);
        return;
      }

      Alert.alert('Cambios guardados', 'Los datos del comercio se actualizaron.', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios. Intentá nuevamente.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.ayuda}>Cargando datos del comercio...</Text>
      </View>
    );
  }

  if (error || !comercio) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error ?? 'No se encontró el comercio.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.botonGuardar}>
          <Text style={styles.botonGuardarTexto}>Volver al panel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.encabezado}>
        <Ionicons name="storefront-outline" size={30} color="#1E3A8A" />
        <Text style={styles.titulo}>Editar mi comercio</Text>
        <Text style={styles.ayuda}>Actualizá la información que ven los vecinos.</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Información general</Text>
        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput style={styles.campo} value={nombre} onChangeText={setNombre} />

        <Text style={styles.etiqueta}>Descripción</Text>
        <TextInput
          style={[styles.campo, styles.multilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.etiqueta}>Dirección</Text>
        <TextInput style={styles.campo} value={direccion} onChangeText={setDireccion} />

        <Text style={styles.etiqueta}>Teléfono</Text>
        <TextInput
          style={styles.campo}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          placeholder="Opcional"
        />

        <Text style={styles.etiqueta}>WhatsApp</Text>
        <TextInput
          style={styles.campo}
          value={whatsapp}
          onChangeText={setWhatsapp}
          keyboardType="phone-pad"
          placeholder="5493442421000"
        />

        <Text style={styles.etiqueta}>Instagram</Text>
        <TextInput
          style={styles.campo}
          value={instagram}
          onChangeText={setInstagram}
          autoCapitalize="none"
          placeholder="@micomercio"
        />
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Horarios de atención</Text>
        <Text style={styles.ayuda}>
          Escribí los tramos con formato 08:00-12:00, 16:00-20:00.
          Dejá el campo vacío si el comercio cierra ese día.
        </Text>

        {DIAS.map(({ numero, nombre: nombreDia }) => (
          <View key={numero}>
            <Text style={styles.etiqueta}>{nombreDia}</Text>
            <TextInput
              style={styles.campo}
              value={horarios[numero] ?? ''}
              onChangeText={(texto) =>
                setHorarios((anteriores) => ({ ...anteriores, [numero]: texto }))
              }
              placeholder="Cerrado"
              autoCapitalize="none"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.botonGuardar, guardando && styles.deshabilitado]}
        onPress={guardarCambios}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()} disabled={guardando}>
        <Text style={styles.botonVolverTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F8FAFC' },
  contenido: { padding: 16, paddingBottom: 36, gap: 16 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  encabezado: { alignItems: 'center', gap: 8, marginVertical: 10 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 19, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  ayuda: { fontSize: 14, color: '#64748B', lineHeight: 21 },
  error: { fontSize: 15, color: '#DC2626', textAlign: 'center' },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 16, gap: 8,
  },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 8 },
  campo: {
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15,
    backgroundColor: '#FFFFFF', color: '#0F172A',
  },
  multilinea: { minHeight: 100 },
  botonGuardar: {
    backgroundColor: '#1E3A8A', borderRadius: 11, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  botonGuardarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  deshabilitado: { opacity: 0.6 },
  botonVolver: { alignItems: 'center', paddingVertical: 12 },
  botonVolverTexto: { color: '#475569', fontSize: 16, fontWeight: '600' },
});
