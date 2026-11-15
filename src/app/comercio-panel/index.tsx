
import Ionicons from '@react-native-vector-icons/ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  darDeBajaPromocion,
  obtenerPromocionesDelComercioPanel,
  validarCodigoPromocionPorComercio,
} from '../../services/promociones';
import { Promocion } from '../../types';

export default function ComercioDashboardScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useRouter();

  const [permisoCamara, pedirPermiso] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(false);
  const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);

  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargandoPromociones, setCargandoPromociones] = useState(false);
  const [errorPromociones, setErrorPromociones] = useState<string | null>(null);
  const [promocionDandoBaja, setPromocionDandoBaja] = useState<string | null>(null);

  // Obtener promociones del comercio
  const cargarPromociones = useCallback(async () => {
    if (!usuario?.comercioId) return;

    setCargandoPromociones(true);
    setErrorPromociones(null);

    try {
      const respuesta = await obtenerPromocionesDelComercioPanel(
        usuario.comercioId
      );

      if (respuesta.error) {
        setErrorPromociones(respuesta.error.mensaje);
        return;
      }

      setPromociones(respuesta.datos ?? []);
    } catch {
      setErrorPromociones(
        'No se pudieron cargar las promociones.'
      );
    } finally {
      setCargandoPromociones(false);
    }
  }, [usuario?.comercioId]);

  // Actualizar promociones al regresar al panel
  useFocusEffect(
    useCallback(() => {
      cargarPromociones();
    }, [cargarPromociones])
  );

  // Confirmar y realizar la baja de una promoción
  const confirmarBajaPromocion = (promo: Promocion) => {
    if (promocionDandoBaja !== null || !promo.activa) return;

    Alert.alert(
      'Dar de baja promoción',
      `¿Estás seguro de que querés dar de baja "${promo.titulo}"? La promoción dejará de estar disponible para los vecinos.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Dar de baja',
          style: 'destructive',
          onPress: async () => {
            if (promocionDandoBaja !== null) return;

            try {
              setPromocionDandoBaja(promo.id);

              const respuesta = await darDeBajaPromocion(
                promo.id
              );

              if (respuesta.error) {
                Alert.alert(
                  'No se pudo dar de baja',
                  respuesta.error.mensaje
                );
                return;
              }

              await cargarPromociones();

              Alert.alert(
                'Promoción dada de baja',
                'La promoción fue desactivada correctamente.'
              );
            } catch {
              Alert.alert(
                'Error',
                'No se pudo dar de baja la promoción. Intentá nuevamente.'
              );
            } finally {
              setPromocionDandoBaja(null);
            }
          },
        },
      ]
    );
  };

  // Escanear y validar código QR
  const procesarCodigoQR = async ({ data }: { data: string }) => {
    if (ultimoCodigo !== null) return;

    setEscaneando(false);
    setUltimoCodigo(data);

    try {
      const respuesta = await validarCodigoPromocionPorComercio(
        data,
        usuario?.comercioId ?? undefined
      );

      if (respuesta.datos) {
        Alert.alert(
          '¡Promoción validada!',
          `El código ${respuesta.datos.codigo} fue validado correctamente.`,
          [
            {
              text: 'Aceptar',
              onPress: () => {
                setUltimoCodigo(null);
                cargarPromociones();
              },
            },
          ]
        );
        return;
      }

      Alert.alert(
        'No se pudo validar',
        respuesta.error?.mensaje ??
          'Ocurrió un error al validar el código.',
        [
          {
            text: 'Aceptar',
            onPress: () => setUltimoCodigo(null),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Error',
        'No se pudo validar el código QR.',
        [
          {
            text: 'Aceptar',
            onPress: () => setUltimoCodigo(null),
          },
        ]
      );
    }
  };

  if (!permisoCamara) {
    return <View style={styles.pantalla} />;
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenidoPantalla}
      scrollEnabled={!escaneando}
    >
      {/* Bienvenida */}
      <View style={styles.tarjetaBienvenida}>
        <Ionicons
          name="storefront"
          size={40}
          color="#1E3A8A"
        />

        <Text style={styles.titulo}>
          Panel de Control
        </Text>

        <Text style={styles.subtitulo}>
          Comercio: {usuario?.nombre}
        </Text>
      </View>

      {escaneando ? (
        /* Escáner QR */
        <View style={styles.contenedorCamara}>
          <CameraView
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={
              ultimoCodigo === null
                ? procesarCodigoQR
                : undefined
            }
          />

          <View style={styles.capaSuperpuesta}>
            <View style={styles.marcoEscaneo} />

            <Text style={styles.textoCamara}>
              Apuntá al código QR del cliente
            </Text>

            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => setEscaneando(false)}
            >
              <Text style={styles.textoBotonSecundario}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.panelAcciones}>
          {/* Botón del escáner */}
          {!permisoCamara.granted ? (
            <TouchableOpacity
              style={styles.botonPrincipal}
              onPress={pedirPermiso}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color="#FFF"
              />

              <Text style={styles.textoBotonPrincipal}>
                Habilitar Cámara
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.botonPrincipal}
              onPress={() => setEscaneando(true)}
            >
              <Ionicons
                name="qr-code-outline"
                size={24}
                color="#FFF"
              />

              <Text style={styles.textoBotonPrincipal}>
                Escanear Promoción
              </Text>
            </TouchableOpacity>
          )}

          {/* Sección de promociones */}
          <View style={styles.seccionPromociones}>
            <Text style={styles.tituloSeccion}>
              Mis promociones
            </Text>

            {/* Crear promoción */}
            <TouchableOpacity
              style={styles.botonNuevaPromocion}
              onPress={() =>
                router.push(
                  '/comercio-panel/nueva-promocion'
                )
              }
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color="#FFFFFF"
              />

              <Text style={styles.textoNuevaPromocion}>
                Nueva promoción
              </Text>
            </TouchableOpacity>

            {/* Listado de promociones */}
            {cargandoPromociones ? (
              <Text style={styles.mensajePromociones}>
                Cargando promociones...
              </Text>
            ) : errorPromociones ? (
              <View>
                <Text style={styles.textoError}>
                  {errorPromociones}
                </Text>

                <TouchableOpacity
                  onPress={cargarPromociones}
                >
                  <Text style={styles.textoReintentar}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : promociones.length === 0 ? (
              <Text style={styles.mensajePromociones}>
                Todavía no tenés promociones registradas.
              </Text>
            ) : (
              promociones.map((promo) => {
                const estado = !promo.activa
                  ? 'Inactiva'
                  : new Date(promo.hasta).getTime() < Date.now()
                    ? 'Vencida'
                    : new Date(promo.desde).getTime() > Date.now()
                      ? 'Próxima'
                      : 'Vigente';

                const sePuedeEditar =
                  promo.activa &&
                  new Date(promo.hasta).getTime() > Date.now();

                const dandoBaja =
                  promocionDandoBaja === promo.id;

                return (
                  <View
                    key={promo.id}
                    style={styles.tarjetaPromocion}
                  >
                    {/* Información */}
                    <Text style={styles.tituloPromocion}>
                      {promo.titulo}
                    </Text>

                    <Text style={styles.detallePromocion}>
                      {promo.detalle}
                    </Text>

                    {/* Estado y usos */}
                    <View style={styles.filaPromocion}>
                      <Text style={styles.estadoPromocion}>
                        Estado: {estado}
                      </Text>

                      <Text style={styles.usosPromocion}>
                        Usos: {promo.usos}
                      </Text>
                    </View>

                    {/* Editar promoción */}
                    {sePuedeEditar && (
                      <TouchableOpacity
                        style={styles.botonEditarPromocion}
                        onPress={() =>
                          router.push({
                            pathname:
                              '/comercio-panel/editar-promocion',
                            params: {
                              id: promo.id,
                            },
                          })
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="#1E3A8A"
                        />

                        <Text style={styles.textoEditarPromocion}>
                          Editar promoción
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Dar de baja promoción */}
                    {promo.activa && (
                      <TouchableOpacity
                        style={[
                          styles.botonBajaPromocion,
                          promocionDandoBaja !== null &&
                            styles.botonDeshabilitado,
                        ]}
                        onPress={() =>
                          confirmarBajaPromocion(promo)
                        }
                        disabled={
                          promocionDandoBaja !== null
                        }
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={18}
                          color="#DC2626"
                        />

                        <Text style={styles.textoBajaPromocion}>
                          {dandoBaja
                            ? 'Dando de baja...'
                            : 'Dar de baja'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* Cerrar sesión */}
          <TouchableOpacity
            style={styles.botonSalir}
            onPress={cerrarSesion}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#EF4444"
            />

            <Text style={styles.textoBotonSalir}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  tarjetaBienvenida: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
  },
  subtitulo: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  panelAcciones: {
    gap: 16,
  },
  botonPrincipal: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoBotonPrincipal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonSalir: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  textoBotonSalir: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contenedorCamara: {
    height: 450,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camara: {
    flex: 1,
  },
  capaSuperpuesta: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  marcoEscaneo: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 20,
  },
  textoCamara: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 40,
  },
  botonCancelar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  textoBotonSecundario: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seccionPromociones: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  mensajePromociones: {
    fontSize: 14,
    color: '#64748B',
  },
  textoError: {
    fontSize: 14,
    color: '#DC2626',
  },
  textoReintentar: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 8,
  },
  tarjetaPromocion: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  tituloPromocion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  detallePromocion: {
    fontSize: 14,
    color: '#475569',
  },
  filaPromocion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoPromocion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  usosPromocion: {
    fontSize: 13,
    color: '#64748B',
  },
  contenidoPantalla: {
    paddingBottom: 32,
  },
  botonNuevaPromocion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 10,
  },
  textoNuevaPromocion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonEditarPromocion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 6,
  },
  textoEditarPromocion: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  botonBajaPromocion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 6,
  },
  textoBajaPromocion: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
