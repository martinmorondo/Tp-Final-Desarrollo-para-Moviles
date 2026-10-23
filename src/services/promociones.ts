import { MOCK_COMERCIOS, MOCK_PROMOCIONES, MOCK_USOS_PROMOCION } from "../mocks/datos";
import { ApiResponse, Promocion, UsoDePromocion } from "../types";
import {
    USAR_MOCKS,
    crearRespuestaError,
    crearRespuestaExito,
    peticionApi,
    simularLatencia,
    verificarErrorRedSimulado
} from "./api";

let promocionesMemoria: Promocion[] = [...MOCK_PROMOCIONES];
let usosMemoria: UsoDePromocion[] = [...MOCK_USOS_PROMOCION];

export type EstadoTemporalPromocion =
  | "vigente"
  | "por_vencer"
  | "proxima"
  | "vencida"
  | "inactiva";

export interface FiltrosPromociones {
  rubroId?: string | null;
  comercioId?: string;
  estado?: "todas_no_vencidas" | "vigentes" | "por_vencer" | "proximas";
  fechaReferencia?: Date;
}

const DIAS_POR_VENCER = 7;

/**
 * Clasifica el estado de una promoción cruzando sus fechas 'desde' y 'hasta' (ISO 8601)
 * con la fecha actual.
 */
export function obtenerEstadoPromocion(
  promocion: Promocion,
  ahora: Date = new Date()
): EstadoTemporalPromocion {
  if (!promocion.activa) {
    return "inactiva";
  }

  const msAhora = ahora.getTime();
  const msDesde = new Date(promocion.desde).getTime();
  const msHasta = new Date(promocion.hasta).getTime();

  if (msAhora > msHasta) {
    return "vencida";
  }

  if (msAhora < msDesde) {
    return "proxima";
  }

  const msParaVencer = msHasta - msAhora;
  const msUmbralPorVencer = DIAS_POR_VENCER * 24 * 60 * 60 * 1000;

  if (msParaVencer <= msUmbralPorVencer) {
    return "por_vencer";
  }

  return "vigente";
}

/**
 * Obtiene las promociones para los vecinos.
 * Regla estricta del PRD: "Una promo que ya venció no se muestra más."
 */
export async function obtenerPromociones(
  filtros: FiltrosPromociones = {}
): Promise<ApiResponse<Promocion[]>> {
  if (!USAR_MOCKS) {
    const params = new URLSearchParams();
    if (filtros.rubroId) params.append("rubroId", filtros.rubroId);
    if (filtros.comercioId) params.append("comercioId", filtros.comercioId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return peticionApi<Promocion[]>(`/promociones${query}`);
  }

  await simularLatencia(350);
  const errorRed = verificarErrorRedSimulado<Promocion[]>();
  if (errorRed) return errorRed;

  const ahora = filtros.fechaReferencia ?? new Date();
  const estadoBuscado = filtros.estado ?? "todas_no_vencidas";

  let resultado = promocionesMemoria.filter((promo) => {
    const estado = obtenerEstadoPromocion(promo, ahora);

    // Jamás devolver vencidas ni inactivas en el listado público
    if (estado === "vencida" || estado === "inactiva") {
      return false;
    }

    if (estadoBuscado === "vigentes") {
      return estado === "vigente" || estado === "por_vencer";
    }
    if (estadoBuscado === "por_vencer") {
      return estado === "por_vencer";
    }
    if (estadoBuscado === "proximas") {
      return estado === "proxima";
    }

    return true;
  });

  if (filtros.comercioId) {
    resultado = resultado.filter((p) => p.comercioId === filtros.comercioId);
  }

  if (filtros.rubroId) {
    const comerciosDelRubro = new Set(
      MOCK_COMERCIOS.filter((c) => c.rubroId === filtros.rubroId).map((c) => c.id)
    );
    resultado = resultado.filter((p) => comerciosDelRubro.has(p.comercioId));
  }

  return crearRespuestaExito(resultado, resultado.length);
}

/**
 * Obtiene el detalle de una promoción puntual.
 * Si está vencida o inactiva, devuelve el error exacto especificado en el PRD: PROMO_VENCIDA.
 */
export async function obtenerPromocionPorId(
  id: string,
  fechaReferencia: Date = new Date()
): Promise<ApiResponse<Promocion>> {
  if (!USAR_MOCKS) {
    return peticionApi<Promocion>(`/promociones/${id}`);
  }

  await simularLatencia(250);
  const errorRed = verificarErrorRedSimulado<Promocion>();
  if (errorRed) return errorRed;

  const promo = promocionesMemoria.find((p) => p.id === id);
  if (!promo) {
    return crearRespuestaError(
      "PROMO_NO_ENCONTRADA",
      "La promoción buscada no existe."
    );
  }

  const estado = obtenerEstadoPromocion(promo, fechaReferencia);
  if (estado === "vencida" || estado === "inactiva") {
    return crearRespuestaError(
      "PROMO_VENCIDA",
      "Esa promoción ya no está vigente."
    );
  }

  return crearRespuestaExito({ ...promo }, 1);
}

/**
 * Genera o recupera el código exclusivo de la app para que el vecino lo muestre en el mostrador.
 */
export async function obtenerCodigoDeUsoPromocion(
  promocionId: string,
  usuarioId: string,
  token: string | null = null
): Promise<ApiResponse<UsoDePromocion>> {
  if (!USAR_MOCKS) {
    return peticionApi<UsoDePromocion>(
      `/promociones/${promocionId}/codigo`,
      { method: "POST" },
      token
    );
  }

  await simularLatencia(300);
  const errorRed = verificarErrorRedSimulado<UsoDePromocion>();
  if (errorRed) return errorRed;

  const promo = promocionesMemoria.find((p) => p.id === promocionId);
  if (!promo) {
    return crearRespuestaError("PROMO_NO_ENCONTRADA", "La promoción no existe.");
  }

  const estado = obtenerEstadoPromocion(promo);
  if (estado === "vencida" || estado === "inactiva") {
    return crearRespuestaError("PROMO_VENCIDA", "Esa promoción ya no está vigente.");
  }
  if (estado === "proxima") {
    return crearRespuestaError(
      "PROMO_NO_INICIADA",
      "Esta promoción todavía no comenzó."
    );
  }

  // Si el usuario ya tiene un código sin usar para esta promo, se lo devolvemos
  const existenteSinUsar = usosMemoria.find(
    (u) => u.promocionId === promocionId && u.usuarioId === usuarioId && u.validadoEn === null
  );

  if (existenteSinUsar) {
    return crearRespuestaExito({ ...existenteSinUsar }, 1);
  }

  // Generamos un nuevo código con el formato del PRD: "CCU-441-512-8842"
  const sufijoPromo = promocionId.replace("pro-", "");
  const sufijoUsuario = usuarioId.replace("usr-", "");
  const aleatorio = Math.floor(1000 + Math.random() * 9000);

  const nuevoUso: UsoDePromocion = {
    id: `uso-${Date.now()}`,
    promocionId,
    usuarioId,
    codigo: `CCU-${sufijoPromo}-${sufijoUsuario}-${aleatorio}`,
    validadoEn: null
  };

  usosMemoria.push(nuevoUso);
  return crearRespuestaExito({ ...nuevoUso }, 1);
}

/**
 * Permite al comercio escanear y validar el código QR del cliente en el mostrador,
 * registrando la fecha de validación e incrementando el contador de usos.
 */
export async function validarCodigoPromocionPorComercio(
  codigoEscaneado: string,
  comercioId: string,
  token: string | null = null
): Promise<ApiResponse<{ uso: UsoDePromocion; promocion: Promocion }>> {
  if (!USAR_MOCKS) {
    return peticionApi<{ uso: UsoDePromocion; promocion: Promocion }>(
      `/promociones/validar-codigo`,
      {
        method: "POST",
        body: JSON.stringify({ codigo: codigoEscaneado, comercioId })
      },
      token
    );
  }

  await simularLatencia(400);
  const errorRed = verificarErrorRedSimulado<{ uso: UsoDePromocion; promocion: Promocion }>();
  if (errorRed) return errorRed;

  const codigoLimpio = codigoEscaneado.trim().toUpperCase();
  const indiceUso = usosMemoria.findIndex((u) => u.codigo.toUpperCase() === codigoLimpio);

  if (indiceUso === -1) {
    return crearRespuestaError(
      "CODIGO_INVALIDO",
      "El código escaneado no existe o no es válido."
    );
  }

  const uso = usosMemoria[indiceUso];

  if (uso.validadoEn !== null) {
    return crearRespuestaError(
      "CODIGO_YA_UTILIZADO",
      "Este código promocional ya fue utilizado anteriormente."
    );
  }

  const indicePromo = promocionesMemoria.findIndex((p) => p.id === uso.promocionId);
  if (indicePromo === -1) {
    return crearRespuestaError(
      "PROMO_NO_ENCONTRADA",
      "La promoción asociada al código no existe."
    );
  }

  const promo = promocionesMemoria[indicePromo];

  if (promo.comercioId !== comercioId) {
    return crearRespuestaError(
      "COMERCIO_INCORRECTO",
      "Este código pertenece a otro comercio."
    );
  }

  const estado = obtenerEstadoPromocion(promo);
  if (estado === "vencida" || estado === "inactiva") {
    return crearRespuestaError("PROMO_VENCIDA", "Esa promoción ya no está vigente.");
  }

  // Registramos el uso y sumamos 1 al contador de la promoción
  const usoActualizado: UsoDePromocion = {
    ...uso,
    validadoEn: new Date().toISOString()
  };

  const promoActualizada: Promocion = {
    ...promo,
    usos: promo.usos + 1
  };

  usosMemoria[indiceUso] = usoActualizado;
  promocionesMemoria[indicePromo] = promoActualizada;

  return crearRespuestaExito(
    { uso: { ...usoActualizado }, promocion: { ...promoActualizada } },
    1
  );
}

/**
 * Panel de Comercio: Obtiene todas las promociones de un comercio (incluyendo estadísticas de uso).
 */
export async function obtenerPromocionesDelComercioPanel(
  comercioId: string,
  token: string | null = null
): Promise<ApiResponse<Promocion[]>> {
  if (!USAR_MOCKS) {
    return peticionApi<Promocion[]>(`/comercios/${comercioId}/promociones`, {}, token);
  }

  await simularLatencia(300);
  const errorRed = verificarErrorRedSimulado<Promocion[]>();
  if (errorRed) return errorRed;

  const propias = promocionesMemoria.filter((p) => p.comercioId === comercioId);
  return crearRespuestaExito(propias, propias.length);
}

/**
 * Panel de Comercio: Crea una nueva promoción.
 */
export async function crearPromocion(
  nueva: Omit<Promocion, "id" | "usos" | "activa">,
  token: string | null = null
): Promise<ApiResponse<Promocion>> {
  if (!USAR_MOCKS) {
    return peticionApi<Promocion>(
      `/promociones`,
      { method: "POST", body: JSON.stringify(nueva) },
      token
    );
  }

  await simularLatencia(400);
  const errorRed = verificarErrorRedSimulado<Promocion>();
  if (errorRed) return errorRed;

  const promocionCreada: Promocion = {
    ...nueva,
    id: `pro-${Date.now()}`,
    usos: 0,
    activa: true
  };

  promocionesMemoria.unshift(promocionCreada);
  return crearRespuestaExito({ ...promocionCreada }, 1);
}

/**
 * Panel de Comercio: Edita o da de baja una promoción existente.
 */
export async function actualizarPromocion(
  id: string,
  cambios: Partial<Omit<Promocion, "id" | "comercioId" | "usos">>,
  token: string | null = null
): Promise<ApiResponse<Promocion>> {
  if (!USAR_MOCKS) {
    return peticionApi<Promocion>(
      `/promociones/${id}`,
      { method: "PUT", body: JSON.stringify(cambios) },
      token
    );
  }

  await simularLatencia(350);
  const errorRed = verificarErrorRedSimulado<Promocion>();
  if (errorRed) return errorRed;

  const indice = promocionesMemoria.findIndex((p) => p.id === id);
  if (indice === -1) {
    return crearRespuestaError("PROMO_NO_ENCONTRADA", "La promoción no existe.");
  }

  const actualizada: Promocion = {
    ...promocionesMemoria[indice],
    ...cambios
  };

  promocionesMemoria[indice] = actualizada;
  return crearRespuestaExito({ ...actualizada }, 1);
}