import { MOCK_RESENAS } from "../mocks/datos";
import { ApiResponse, Estrellas, Resena } from "../types";
import {
    USAR_MOCKS,
    crearRespuestaError,
    crearRespuestaExito,
    peticionApi,
    simularLatencia,
    verificarErrorRedSimulado
} from "./api";
import { actualizarEstadisticasResenasComercioEnMemoria } from "./comercios";

let resenasMemoria: Resena[] = [...MOCK_RESENAS];

function recalcularPromedioComercio(comercioId: string): void {
  const delComercio = resenasMemoria.filter((r) => r.comercioId === comercioId);
  if (delComercio.length === 0) {
    actualizarEstadisticasResenasComercioEnMemoria(comercioId, 0, 0);
    return;
  }

  const suma = delComercio.reduce((acc, item) => acc + item.estrellas, 0);
  const promedio = suma / delComercio.length;
  actualizarEstadisticasResenasComercioEnMemoria(
    comercioId,
    promedio,
    delComercio.length
  );
}

/**
 * Obtiene las reseñas de un comercio ordenadas de la más nueva a la más vieja.
 */
export async function obtenerResenasPorComercio(
  comercioId: string
): Promise<ApiResponse<Resena[]>> {
  if (!USAR_MOCKS) {
    return peticionApi<Resena[]>(`/comercios/${comercioId}/resenas`);
  }

  await simularLatencia(300);
  const errorRed = verificarErrorRedSimulado<Resena[]>();
  if (errorRed) return errorRed;

  const lista = resenasMemoria
    .filter((r) => r.comercioId === comercioId)
    .sort(
      (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime()
    );

  return crearRespuestaExito(lista, lista.length);
}

/**
 * Crea una nueva reseña para un comercio.
 */
export async function crearResena(
  datos: {
    comercioId: string;
    usuarioId: string;
    estrellas: Estrellas;
    comentario: string;
  },
  token: string | null = null
): Promise<ApiResponse<Resena>> {
  if (!USAR_MOCKS) {
    return peticionApi<Resena>(
      `/resenas`,
      { method: "POST", body: JSON.stringify(datos) },
      token
    );
  }

  await simularLatencia(400);
  const errorRed = verificarErrorRedSimulado<Resena>();
  if (errorRed) return errorRed;

  if (!datos.comentario.trim()) {
    return crearRespuestaError(
      "COMENTARIO_VACIO",
      "Por favor, escribí un comentario para tu reseña."
    );
  }

  const nuevaResena: Resena = {
    id: `res-${Date.now()}`,
    comercioId: datos.comercioId,
    usuarioId: datos.usuarioId,
    estrellas: datos.estrellas,
    comentario: datos.comentario.trim(),
    respuesta: null,
    reportada: false,
    creadaEn: new Date().toISOString(),
    sincronizada: true
  };

  resenasMemoria.unshift(nuevaResena);
  recalcularPromedioComercio(datos.comercioId);

  return crearRespuestaExito({ ...nuevaResena }, 1);
}

/**
 * Permite al autor editar su propia reseña.
 */
export async function editarResena(
  resenaId: string,
  usuarioId: string,
  cambios: { estrellas: Estrellas; comentario: string },
  token: string | null = null
): Promise<ApiResponse<Resena>> {
  if (!USAR_MOCKS) {
    return peticionApi<Resena>(
      `/resenas/${resenaId}`,
      { method: "PUT", body: JSON.stringify(cambios) },
      token
    );
  }

  await simularLatencia(350);
  const errorRed = verificarErrorRedSimulado<Resena>();
  if (errorRed) return errorRed;

  const indice = resenasMemoria.findIndex((r) => r.id === resenaId);
  if (indice === -1) {
    return crearRespuestaError("RESENA_NO_ENCONTRADA", "La reseña no existe.");
  }

  if (resenasMemoria[indice].usuarioId !== usuarioId) {
    return crearRespuestaError(
      "NO_AUTORIZADO",
      "Solo podés editar tus propias reseñas."
    );
  }

  const actualizada: Resena = {
    ...resenasMemoria[indice],
    estrellas: cambios.estrellas,
    comentario: cambios.comentario.trim()
  };

  resenasMemoria[indice] = actualizada;
  recalcularPromedioComercio(actualizada.comercioId);

  return crearRespuestaExito({ ...actualizada }, 1);
}

/**
 * Permite al autor eliminar su propia reseña.
 */
export async function eliminarResena(
  resenaId: string,
  usuarioId: string,
  token: string | null = null
): Promise<ApiResponse<{ eliminada: boolean }>> {
  if (!USAR_MOCKS) {
    return peticionApi<{ eliminada: boolean }>(
      `/resenas/${resenaId}`,
      { method: "DELETE" },
      token
    );
  }

  await simularLatencia(300);
  const errorRed = verificarErrorRedSimulado<{ eliminada: boolean }>();
  if (errorRed) return errorRed;

  const indice = resenasMemoria.findIndex((r) => r.id === resenaId);
  if (indice === -1) {
    return crearRespuestaError("RESENA_NO_ENCONTRADA", "La reseña no existe.");
  }

  if (resenasMemoria[indice].usuarioId !== usuarioId) {
    return crearRespuestaError(
      "NO_AUTORIZADO",
      "Solo podés borrar tus propias reseñas."
    );
  }

  const comercioId = resenasMemoria[indice].comercioId;
  resenasMemoria.splice(indice, 1);
  recalcularPromedioComercio(comercioId);

  return crearRespuestaExito({ eliminada: true }, 1);
}

/**
 * Permite reportar una reseña ofensiva.
 */
export async function reportarResena(
  resenaId: string,
  token: string | null = null
): Promise<ApiResponse<Resena>> {
  if (!USAR_MOCKS) {
    return peticionApi<Resena>(
      `/resenas/${resenaId}/reportar`,
      { method: "POST" },
      token
    );
  }

  await simularLatencia(250);
  const errorRed = verificarErrorRedSimulado<Resena>();
  if (errorRed) return errorRed;

  const indice = resenasMemoria.findIndex((r) => r.id === resenaId);
  if (indice === -1) {
    return crearRespuestaError("RESENA_NO_ENCONTRADA", "La reseña no existe.");
  }

  resenasMemoria[indice] = {
    ...resenasMemoria[indice],
    reportada: true
  };

  return crearRespuestaExito({ ...resenasMemoria[indice] }, 1);
}

/**
 * Permite que el comercio responda una única vez a una reseña de su local.
 */
export async function responderResenaPorComercio(
  resenaId: string,
  comercioId: string,
  respuestaTexto: string,
  token: string | null = null
): Promise<ApiResponse<Resena>> {
  if (!USAR_MOCKS) {
    return peticionApi<Resena>(
      `/resenas/${resenaId}/respuesta`,
      { method: "POST", body: JSON.stringify({ respuesta: respuestaTexto }) },
      token
    );
  }

  await simularLatencia(350);
  const errorRed = verificarErrorRedSimulado<Resena>();
  if (errorRed) return errorRed;

  const indice = resenasMemoria.findIndex((r) => r.id === resenaId);
  if (indice === -1) {
    return crearRespuestaError("RESENA_NO_ENCONTRADA", "La reseña no existe.");
  }

  const resena = resenasMemoria[indice];
  if (resena.comercioId !== comercioId) {
    return crearRespuestaError(
      "NO_AUTORIZADO",
      "Solo podés responder reseñas de tu propio comercio."
    );
  }

  if (resena.respuesta !== null) {
    return crearRespuestaError(
      "RESPUESTA_YA_EXISTE",
      "El comercio solo puede responder una vez a cada reseña."
    );
  }

  const actualizada: Resena = {
    ...resena,
    respuesta: respuestaTexto.trim()
  };

  resenasMemoria[indice] = actualizada;
  return crearRespuestaExito({ ...actualizada }, 1);
}