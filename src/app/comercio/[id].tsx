import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { AccionesResena } from '../../components/resenas/AccionesResena';
import { FormularioResena } from '../../components/resenas/FormularioResena';
import { ReportarResena } from '../../components/resenas/ReportarResena';
import { ResponderResena } from '../../components/resenas/ResponderResena';
import { ReproductorVideo } from '../../components/ui/ReproductorVideo';
import { useComercio } from '../../hooks/useComercio';
import { enviarNotificacionLocal } from '../../services/notificaciones';
import { obtenerResenasPorComercio } from '../../services/resenas';
import { alternarFavoritoLocal, obtenerFavoritosLocales } from '../../storage/favoritos';
import { Resena } from '../../types';
import { obtenerResumenHorario } from '../../utils/horarios';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return '';
  }

  return valor.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function EstrellasResena({ cantidad }: { cantidad: number }) {
  return (
    <View style={styles.filaEstrellas}>
      {Array.from({ length: 5 }, (_, indice) => (
        <Ionicons
          key={indice}
          name={indice < cantidad ? 'star' : 'star-outline'}
          size={16}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function TarjetaResena({
  resena,
  alActualizar,
}: {
  resena: Resena;
  alActualizar: () => void | Promise<void>;
}) {
  return (
    <View style={styles.tarjetaResena}>
      <View style={styles.cabeceraResena}>
        <View style={styles.avatarResena}>
          <Ionicons name="person-outline" size={20} color="#1E3A8A" />
        </View>

        <View style={styles.informacionAutor}>
          <Text style={styles.autorResena}>
            Usuario {resena.usuarioId}
          </Text>

          <Text style={styles.fechaResena}>
            {formatearFecha(resena.creadaEn)}
          </Text>
        </View>
      </View>

      <View style={styles.calificacionResena}>
        <EstrellasResena cantidad={resena.estrellas} />

        <Text style={styles.numeroEstrellas}>
          {resena.estrellas}/5
        </Text>
      </View>

      <Text style={styles.comentarioResena}>
  {resena.comentario}
</Text>

<AccionesResena
  resena={resena}
  alActualizar={alActualizar}
/>

<ResponderResena
  resena={resena}
  alResponder={alActualizar}
/>

<ReportarResena
  resena={resena}
  alReportar={alActualizar}
/>

{resena.respuesta && (
        <View style={styles.cajaRespuesta}>
          <View style={styles.cabeceraRespuesta}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#1E3A8A"
            />

            <Text style={styles.tituloRespuesta}>
              Respuesta del comercio
            </Text>
          </View>

          <Text style={styles.textoRespuesta}>
            {resena.respuesta}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function FichaComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { comercio, cargando, error, cargar } = useComercio(id as string);

  const [esFavorito, setEsFavorito] = useState(false);

  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [errorResenas, setErrorResenas] = useState<string | null>(null);

  const cargarResenas = useCallback(async () => {
    if (!id) {
      setResenas([]);
      setCargandoResenas(false);
      return;
    }

    setCargandoResenas(true);
    setErrorResenas(null);

    try {
      const respuesta = await obtenerResenasPorComercio(id);

      if (Array.isArray(respuesta.datos)) {
        setResenas(respuesta.datos);
      } else {
        setResenas([]);
        setErrorResenas('No se pudieron obtener las reseñas.');
      }
    } catch {
      setResenas([]);
      setErrorResenas('Ocurrió un problema al cargar las reseñas.');
    } finally {
      setCargandoResenas(false);
    }
  }, [id]);

  // Verificar favoritos al entrar al comercio.
  useEffect(() => {
    let activo = true;

    async function verificarFavorito() {
      const favoritosGuardados = await obtenerFavoritosLocales();

      if (activo) {
        setEsFavorito(favoritosGuardados.includes(id as string));
      }
    }

    verificarFavorito();

    return () => {
      activo = false;
    };
  }, [id]);

  // Cargar información del comercio.
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Cargar reseñas desde la API.
  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  const manejarBotonFavorito = async () => {
    // Vibración háptica.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Persistencia local.
    const nuevaLista = await alternarFavoritoLocal(id as string);
    const ahoraEsFavorito = nuevaLista.includes(id as string);

    setEsFavorito(ahoraEsFavorito);

    // Notificación local.
    if (ahoraEsFavorito && comercio) {
      enviarNotificacionLocal(
        '¡Nuevo Favorito Guardado!',
        `Agregaste a ${comercio.nombre}. Te avisaremos cuando tengan nuevas promociones.`
      );
    }
  };

  if (cargando) {
    return <EstadoPantalla estado="cargando" />;
  }

  if (error) {
    return (
      <EstadoPantalla
        estado="error"
        mensaje={error}
        onReintentar={cargar}
      />
    );
  }

  if (!comercio) {
    return (
      <EstadoPantalla
        estado="vacio"
        mensaje="Comercio no encontrado"
      />
    );
  }

  const horarioInfo = obtenerResumenHorario(comercio);

  return (
    <View style={styles.pantalla}>
      {/* Cabecera */}
      <View style={styles.cabecera}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botonVolver}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#0F172A"
          />
        </TouchableOpacity>

        <Text
          style={styles.tituloCabecera}
          numberOfLines={1}
        >
          {comercio.nombre}
        </Text>

        <TouchableOpacity
          onPress={manejarBotonFavorito}
          style={styles.botonFavorito}
        >
          <Ionicons
            name={esFavorito ? 'star' : 'star-outline'}
            size={28}
            color={esFavorito ? '#F59E0B' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Multimedia */}
        {comercio.videoUrl ? (
          <ReproductorVideo url={comercio.videoUrl} />
        ) : comercio.imagenes && comercio.imagenes.length > 0 ? (
          <Image
            source={{ uri: comercio.imagenes[0] }}
            style={styles.imagenPrincipal}
          />
        ) : (
          <View style={styles.cajaSinMultimedia}>
            <Ionicons
              name="image-outline"
              size={32}
              color="#94A3B8"
            />

            <Text style={styles.textoSinMultimedia}>
              No hay video ni fotos disponibles.
            </Text>
          </View>
        )}

        {/* Información básica */}
        <View style={styles.seccion}>
          <Text style={styles.nombre}>
            {comercio.nombre}
          </Text>

          <Text
            style={[
              styles.etiquetaHorario,
              horarioInfo.abierto ? styles.abierto : styles.cerrado,
            ]}
          >
            {horarioInfo.etiqueta}
          </Text>

          <View style={styles.filaPuntaje}>
            <Ionicons
              name="star"
              size={16}
              color="#F59E0B"
            />

            <Text style={styles.puntaje}>
              {comercio.puntaje > 0
                ? `${comercio.puntaje} (${comercio.cantidadResenas} reseñas)`
                : 'Nuevo (Sin reseñas)'}
            </Text>
          </View>
        </View>

        <Text style={styles.descripcion}>
          {comercio.descripcion}
        </Text>

        {/* Contacto */}
        <View style={styles.tarjetaContacto}>
          <View style={styles.filaContacto}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#1E3A8A"
            />

            <Text style={styles.textoContacto}>
              {comercio.direccion}
            </Text>
          </View>

          {comercio.telefono && (
            <View style={styles.filaContacto}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#1E3A8A"
              />

              <Text style={styles.textoContacto}>
                {comercio.telefono}
              </Text>
            </View>
          )}

          {comercio.whatsapp && (
            <View style={styles.filaContacto}>
              <Ionicons
                name="logo-whatsapp"
                size={20}
                color="#16A34A"
              />

              <Text style={styles.textoContacto}>
                {comercio.whatsapp}
              </Text>
            </View>
          )}

          {comercio.instagram && (
            <View style={styles.filaContacto}>
              <Ionicons
                name="logo-instagram"
                size={20}
                color="#E1306C"
              />

              <Text style={styles.textoContacto}>
                {comercio.instagram}
              </Text>
            </View>
          )}
        </View>

        {/* Horarios de atención */}
        <View style={styles.tarjetaHorarios}>
          <View style={styles.cabeceraHorarios}>
            <Ionicons name="time-outline" size={22} color="#1E3A8A" />
            <Text style={styles.subtituloHorarios}>Horarios de atención</Text>
          </View>

          {DIAS_SEMANA.map((nombreDia, dia) => {
            const tramos = (comercio.horarios ?? [])
              .filter((horario) => horario.dia === dia)
              .sort((a, b) => a.abre.localeCompare(b.abre));

            return (
              <View key={dia} style={styles.filaHorario}>
                <Text style={styles.diaHorario}>{nombreDia}</Text>
                <Text style={styles.horasHorario}>
                  {tramos.length > 0
                    ? tramos.map((tramo) => `${tramo.abre} - ${tramo.cierra}`).join(' / ')
                    : 'Cerrado'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Medios de pago */}
        {comercio.mediosDePago &&
          comercio.mediosDePago.length > 0 && (
            <View style={styles.seccionMediosPago}>
              <Text style={styles.subtitulo}>
                Medios de pago
              </Text>

              <View style={styles.cajaChips}>
                {comercio.mediosDePago.map((medio) => (
                  <View key={medio} style={styles.chip}>
                    <Text style={styles.textoChip}>
                      {medio}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Reseñas */}
        <View style={styles.seccionResenas}>
          <View style={styles.cabeceraSeccionResenas}>
            <View style={styles.tituloResenasFila}>
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color="#1E3A8A"
              />

              <Text style={styles.tituloResenas}>
                Reseñas y opiniones
              </Text>
            </View>

            <TouchableOpacity
              onPress={cargarResenas}
              disabled={cargandoResenas}
              style={styles.botonActualizar}
            >
              <Ionicons
                name="refresh-outline"
                size={21}
                color="#1E3A8A"
              />
            </TouchableOpacity>
          </View>

          {/* Formulario para publicar una reseña */}
        <FormularioResena
          comercioId={comercio.id}
          alPublicar={cargarResenas}
        />

          {/* Resumen de puntuación */}
          {comercio.cantidadResenas > 0 && (
            <View style={styles.resumenResenas}>
              <View style={styles.resumenPuntaje}>
                <Ionicons
                  name="star"
                  size={28}
                  color="#F59E0B"
                />

                <Text style={styles.promedioGrande}>
                  {comercio.puntaje}
                </Text>
              </View>

              <View>
                <Text style={styles.descripcionPromedio}>
                  Calificación del comercio
                </Text>

                <Text style={styles.cantidadOpiniones}>
                  {comercio.cantidadResenas} opiniones
                </Text>
              </View>
            </View>
          )}

          {/* Cargando */}
          {cargandoResenas && (
            <View style={styles.estadoResenas}>
              <ActivityIndicator
                size="small"
                color="#1E3A8A"
              />

              <Text style={styles.textoEstadoResenas}>
                Cargando reseñas...
              </Text>
            </View>
          )}

          {/* Error */}
          {!cargandoResenas && errorResenas && (
            <View style={styles.estadoResenas}>
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color="#DC2626"
              />

              <Text style={styles.textoEstadoResenas}>
                {errorResenas}
              </Text>

              <TouchableOpacity
                onPress={cargarResenas}
                style={styles.botonReintentar}
              >
                <Text style={styles.textoBotonReintentar}>
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sin reseñas */}
          {!cargandoResenas &&
            !errorResenas &&
            resenas.length === 0 && (
              <View style={styles.estadoResenas}>
                <Ionicons
                  name="chatbubble-outline"
                  size={32}
                  color="#94A3B8"
                />

                <Text style={styles.textoEstadoResenas}>
                  Este comercio todavía no tiene reseñas.
                </Text>

                <Text style={styles.textoSecundario}>
                  ¡Sé el primero en compartir tu opinión!
                </Text>
              </View>
            )}

          {/* Listado */}
          {!cargandoResenas &&
            !errorResenas &&
            resenas.length > 0 && (
              <View>
                <Text style={styles.contadorResenas}>
                  Mostrando {resenas.length} reseñas
                </Text>

                {resenas.map((resena) => (
  <TarjetaResena
    key={resena.id}
    resena={resena}
    alActualizar={cargarResenas}
  />
))}

                {resenas.length >= 20 && (
                  <Text style={styles.avisoPaginacion}>
                    Se muestran las primeras 20 reseñas.
                    Próximamente podrás consultar las demás.
                  </Text>
                )}
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  cabecera: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botonVolver: {
    padding: 4,
    marginRight: 12,
  },

  tituloCabecera: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },

  botonFavorito: {
    padding: 4,
    minWidth: 44,
    alignItems: 'center',
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  imagenPrincipal: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
  },

  cajaSinMultimedia: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginVertical: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  textoSinMultimedia: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
  },

  seccion: {
    marginBottom: 16,
  },

  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },

  etiquetaHorario: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },

  abierto: {
    color: '#15803D',
  },

  cerrado: {
    color: '#B91C1C',
  },

  filaPuntaje: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  puntaje: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 4,
    fontWeight: '500',
  },

  descripcion: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },

  tarjetaContacto: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filaContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  textoContacto: {
    marginLeft: 12,
    fontSize: 15,
    color: '#334155',
    flex: 1,
  },

  tarjetaHorarios: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cabeceraHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  subtituloHorarios: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  filaHorario: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },

  diaHorario: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    width: 78,
  },

  horasHorario: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    textAlign: 'right',
  },

  seccionMediosPago: {
    marginBottom: 20,
  },

  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },

  cajaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  textoChip: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  seccionResenas: {
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  cabeceraSeccionResenas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  tituloResenasFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  tituloResenas: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  botonActualizar: {
    padding: 8,
  },

  resumenResenas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },

  resumenPuntaje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  promedioGrande: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  descripcionPromedio: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  cantidadOpiniones: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  estadoResenas: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },

  textoEstadoResenas: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },

  textoSecundario: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  botonReintentar: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },

  textoBotonReintentar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  contadorResenas: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },

  tarjetaResena: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },

  cabeceraResena: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarResena: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  informacionAutor: {
    flex: 1,
  },

  autorResena: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  fechaResena: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
  },

  calificacionResena: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  filaEstrellas: {
    flexDirection: 'row',
    gap: 3,
  },

  numeroEstrellas: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  comentarioResena: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },

  cajaRespuesta: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1E3A8A',
  },

  cabeceraRespuesta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  tituloRespuesta: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },

  textoRespuesta: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },

  avisoPaginacion: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});