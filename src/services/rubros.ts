import { MOCK_RUBROS } from "../mocks/datos";
import { ApiResponse, Rubro } from "../types";
import {
    USAR_MOCKS,
    crearRespuestaError,
    crearRespuestaExito,
    peticionApi,
    simularLatencia,
    verificarErrorRedSimulado
} from "./api";

const rubrosMemoria: Rubro[] = [...MOCK_RUBROS];

/**
 * Obtiene el listado completo de rubros ordenados según la propiedad 'orden'.
 */
export async function obtenerRubros(): Promise<ApiResponse<Rubro[]>> {
  if (!USAR_MOCKS) {
    return peticionApi<Rubro[]>("/rubros");
  }

  await simularLatencia(200);
  const errorRed = verificarErrorRedSimulado<Rubro[]>();
  if (errorRed) return errorRed;

  const ordenados = [...rubrosMemoria].sort((a, b) => a.orden - b.orden);
  return crearRespuestaExito(ordenados, ordenados.length);
}

/**
 * Busca un rubro puntual por su identificador.
 */
export async function obtenerRubroPorId(id: string): Promise<ApiResponse<Rubro>> {
  if (!USAR_MOCKS) {
    return peticionApi<Rubro>(`/rubros/${id}`);
  }

  await simularLatencia(150);
  const errorRed = verificarErrorRedSimulado<Rubro>();
  if (errorRed) return errorRed;

  const rubro = rubrosMemoria.find((r) => r.id === id);
  if (!rubro) {
    return crearRespuestaError("RUBRO_NO_ENCONTRADO", "El rubro solicitado no existe.");
  }

  return crearRespuestaExito(rubro, 1);
}