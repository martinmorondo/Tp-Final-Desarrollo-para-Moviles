import { MOCK_COMERCIOS } from "../mocks/datos";
import { ApiResponse, Comercio } from "../types";
import { estaAbiertoAhora } from "../utils/horarios";
import {
    USAR_MOCKS,
    crearRespuestaError,
    crearRespuestaExito,
    peticionApi,
    simularLatencia,
    verificarErrorRedSimulado
} from "./api";

// Copia en memoria para que las ediciones del rol comercio persistan durante la sesión
let comerciosMemoria: Comercio[] = [...MOCK_COMERCIOS];

export interface FiltrosComercios {
  busqueda?: string;
  rubroId?: string | null;
  abiertoAhora?: boolean;
  fechaReferencia?: Date;
}

/**
 * Normaliza un texto sacando tildes y pasándolo a minúsculas
 * para que buscar "ferreteria" encuentre "Ferretería".
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Obtiene el listado de comercios aplicando filtros de búsqueda (nombre o lo que venden),
 * rubro y cálculo de "abierto ahora" en el dispositivo.
 */
export async function obtenerComercios(
  filtros: FiltrosComercios = {}
): Promise<ApiResponse<Comercio[]>> {
  if (!USAR_MOCKS) {
    const params = new URLSearchParams();
    if (filtros.busqueda) params.append("q", filtros.busqueda);
    if (filtros.rubroId) params.append("rubroId", filtros.rubroId);
    const query = params.toString() ? `?${params.toString()}` : "";
    const respuesta = await peticionApi<Comercio[]>(`/comercios${query}`);

    if (respuesta.datos && filtros.abiertoAhora) {
      const fecha = filtros.fechaReferencia ?? new Date();
      const filtrados = respuesta.datos.filter((c) => estaAbiertoAhora(c, fecha));
      return crearRespuestaExito(filtrados, filtrados.length);
    }
    return respuesta;
  }

  await simularLatencia(350);
  const errorRed = verificarErrorRedSimulado<Comercio[]>();
  if (errorRed) return errorRed;

  let resultado = comerciosMemoria.filter((c) => c.activo);

  // 1. Filtro por rubro
  if (filtros.rubroId) {
    resultado = resultado.filter((c) => c.rubroId === filtros.rubroId);
  }

  // 2. Búsqueda por nombre o por lo que venden (descripción / dirección)
  if (filtros.busqueda && filtros.busqueda.trim().length > 0) {
    const termino = normalizarTexto(filtros.busqueda);
    resultado = resultado.filter((c) => {
      const coincideNombre = normalizarTexto(c.nombre).includes(termino);
      const coincideDescripcion = normalizarTexto(c.descripcion).includes(termino);
      const coincideDireccion = normalizarTexto(c.direccion).includes(termino);
      return coincideNombre || coincideDescripcion || coincideDireccion;
    });
  }

  // 3. Filtro por "Abierto ahora" calculado en el dispositivo
  if (filtros.abiertoAhora) {
    const fecha = filtros.fechaReferencia ?? new Date();
    resultado = resultado.filter((c) => estaAbiertoAhora(c, fecha));
  }

  return crearRespuestaExito(resultado, resultado.length);
}

/**
 * Obtiene la ficha completa de un comercio por su ID.
 */
export async function obtenerComercioPorId(
  id: string
): Promise<ApiResponse<Comercio>> {
  if (!USAR_MOCKS) {
    return peticionApi<Comercio>(`/comercios/${id}`);
  }

  await simularLatencia(250);
  const errorRed = verificarErrorRedSimulado<Comercio>();
  if (errorRed) return errorRed;

  const comercio = comerciosMemoria.find((c) => c.id === id);
  if (!comercio) {
    return crearRespuestaError(
      "COMERCIO_NO_ENCONTRADO",
      "No encontramos el comercio solicitado."
    );
  }

  return crearRespuestaExito({ ...comercio }, 1);
}

/**
 * Permite al usuario con rol "comercio" editar sus datos, horarios, fotos y video.
 */
export async function actualizarComercio(
  id: string,
  cambios: Partial<Omit<Comercio, "id" | "puntaje" | "cantidadResenas">>,
  token: string | null = null
): Promise<ApiResponse<Comercio>> {
  if (!USAR_MOCKS) {
    return peticionApi<Comercio>(
      `/comercios/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(cambios)
      },
      token
    );
  }

  await simularLatencia(400);
  const errorRed = verificarErrorRedSimulado<Comercio>();
  if (errorRed) return errorRed;

  const indice = comerciosMemoria.findIndex((c) => c.id === id);
  if (indice === -1) {
    return crearRespuestaError(
      "COMERCIO_NO_ENCONTRADO",
      "No se encontró el comercio que intentás editar."
    );
  }

  const comercioActualizado: Comercio = {
    ...comerciosMemoria[indice],
    ...cambios
  };

  comerciosMemoria[indice] = comercioActualizado;
  return crearRespuestaExito({ ...comercioActualizado }, 1);
}

/**
 * Función interna para que el servicio de reseñas mantenga actualizado
 * el promedio y la cantidad de reseñas del comercio en memoria.
 */
export function actualizarEstadisticasResenasComercioEnMemoria(
  comercioId: string,
  nuevoPuntaje: number,
  nuevaCantidad: number
): void {
  const indice = comerciosMemoria.findIndex((c) => c.id === comercioId);
  if (indice !== -1) {
    comerciosMemoria[indice] = {
      ...comerciosMemoria[indice],
      puntaje: Number(nuevoPuntaje.toFixed(1)),
      cantidadResenas: nuevaCantidad
    };
  }
}