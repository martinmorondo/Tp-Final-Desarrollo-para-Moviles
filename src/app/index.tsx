import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Comercio, Promocion } from "../../src/types";
import { configurarSimulacionErrorRed, estaSimulandoErrorRed } from "../services/api";
import { obtenerComercios } from "../services/comercios";
import { obtenerPromociones, obtenerPromocionPorId } from "../services/promociones";
import { obtenerResumenHorario } from "../utils/horarios";

export default function PantallaVerificacionServicios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [mensajeErrorPromoVencida, setMensajeErrorPromoVencida] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [soloAbiertos, setSoloAbiertos] = useState<boolean>(false);

  const cargarDatos = async (filtrarAbiertos: boolean) => {
    setCargando(true);
    setErrorGeneral(null);

    const [resComercios, resPromos, resPromoVencida] = await Promise.all([
      obtenerComercios({ abiertoAhora: filtrarAbiertos }),
      obtenerPromociones(),
      obtenerPromocionPorId("pro-444") // ID de la promo vencida de invierno
    ]);

    if (resComercios.error) {
      setErrorGeneral(resComercios.error.mensaje);
    } else if (resComercios.datos) {
      setComercios(resComercios.datos);
    }

    if (resPromos.datos) {
      setPromos(resPromos.datos);
    }

    if (resPromoVencida.error) {
      setMensajeErrorPromoVencida(
        `${resPromoVencida.error.codigo}: ${resPromoVencida.error.mensaje}`
      );
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos(soloAbiertos);
  }, [soloAbiertos]);

  const alternarSimulacionError = () => {
    const nuevoEstado = !estaSimulandoErrorRed();
    configurarSimulacionErrorRed(nuevoEstado);
    cargarDatos(soloAbiertos);
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Verificación Fase 6 — Servicios</Text>

      <View style={styles.filaBotones}>
        <TouchableOpacity
          style={[styles.boton, soloAbiertos && styles.botonActivo]}
          onPress={() => setSoloAbiertos(!soloAbiertos)}
        >
          <Text style={styles.textoBoton}>
            {soloAbiertos ? "Mostrando: Abiertos ahora" : "Filtrar: Abierto ahora"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonError]}
          onPress={alternarSimulacionError}
        >
          <Text style={styles.textoBoton}>Simular Error Red</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.cajaEstado}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.textoEstado}>Cargando desde capa de servicios...</Text>
        </View>
      ) : errorGeneral ? (
        <View style={styles.cajaError}>
          <Text style={styles.textoError}>{errorGeneral}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitulo}>
            Comercios ({comercios.length})
          </Text>
          {comercios.map((c) => {
            const horarioInfo = obtenerResumenHorario(c);
            return (
              <View key={c.id} style={styles.tarjeta}>
                <Text style={styles.nombre}>{c.nombre}</Text>
                <Text
                  style={[
                    styles.etiquetaHorario,
                    horarioInfo.abierto ? styles.abierto : styles.cerrado
                  ]}
                >
                  {horarioInfo.etiqueta}
                </Text>
              </View>
            );
          })}

          <Text style={styles.subtitulo}>
            Promociones No Vencidas ({promos.length} de 4 en Mock)
          </Text>
          {promos.map((p) => (
            <View key={p.id} style={styles.tarjeta}>
              <Text style={styles.nombre}>{p.titulo}</Text>
              <Text style={styles.detalle}>Vence: {p.hasta.slice(0, 10)}</Text>
            </View>
          ))}

          <Text style={styles.subtitulo}>Prueba Control Promo Vencida (pro-444):</Text>
          <View style={styles.cajaError}>
            <Text style={styles.textoError}>{mensajeErrorPromoVencida}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 20, paddingTop: 50, backgroundColor: "#F8FAFC", flexGrow: 1 },
  titulo: { fontSize: 20, fontWeight: "bold", color: "#1E3A8A", marginBottom: 16 },
  subtitulo: { fontSize: 16, fontWeight: "bold", color: "#334155", marginTop: 18, marginBottom: 8 },
  filaBotones: { flexDirection: "row", gap: 10, marginBottom: 16 },
  boton: { flex: 1, backgroundColor: "#334155", padding: 12, borderRadius: 8, alignItems: "center" },
  botonActivo: { backgroundColor: "#16A34A" },
  botonError: { backgroundColor: "#DC2626" },
  textoBoton: { color: "#FFFFFF", fontWeight: "600", fontSize: 13, textAlign: "center" },
  tarjeta: { backgroundColor: "#FFFFFF", padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  nombre: { fontSize: 16, fontWeight: "bold", color: "#0F172A" },
  detalle: { fontSize: 13, color: "#64748B", marginTop: 4 },
  etiquetaHorario: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  abierto: { color: "#15803D" },
  cerrado: { color: "#B91C1C" },
  cajaEstado: { padding: 30, alignItems: "center" },
  textoEstado: { marginTop: 10, color: "#475569" },
  cajaError: { backgroundColor: "#FEE2E2", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#FCA5A5" },
  textoError: { color: "#991B1B", fontWeight: "600" }
});