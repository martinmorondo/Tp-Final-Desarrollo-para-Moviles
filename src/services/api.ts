import { ApiResponse } from "../types";

// Cuando se habilite la API real, solo cambiamos USAR_MOCKS a false
export const USAR_MOCKS = true;
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.ccu.org.ar";

// Permite simular un fallo de red para probar los estados de error en pantalla
let simularFalloDeRed = false;

export function configurarSimulacionErrorRed(activar: boolean): void {
  simularFalloDeRed = activar;
}

export function estaSimulandoErrorRed(): boolean {
  return simularFalloDeRed;
}

/**
 * Simula el tiempo de respuesta de un servidor real (por defecto 350ms).
 */
export async function simularLatencia(ms: number = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Construye una respuesta exitosa respetando el contrato de la cátedra:
 * { datos: T, meta: { total, pagina, porPagina } }
 */
export function crearRespuestaExito<T>(
  datos: T,
  total: number = Array.isArray(datos) ? datos.length : 1,
  pagina: number = 1,
  porPagina: number = 20
): ApiResponse<T> {
  return {
    datos,
    meta: {
      total,
      pagina,
      porPagina
    }
  };
}

/**
 * Construye una respuesta de error respetando el contrato de la cátedra:
 * { error: { codigo, mensaje } }
 */
export function crearRespuestaError<T>(
  codigo: string,
  mensaje: string
): ApiResponse<T> {
  return {
    error: {
      codigo,
      mensaje
    }
  };
}

/**
 * Verifica si se activó la simulación de error de red en modo Mock.
 */
export function verificarErrorRedSimulado<T>(): ApiResponse<T> | null {
  if (simularFalloDeRed) {
    return crearRespuestaError<T>(
      "ERROR_RED",
      "No pudimos conectarnos con el servidor. Verificá tu conexión a internet."
    );
  }
  return null;
}

/**
 * Cliente HTTP preparado para cuando la API de la cátedra esté disponible.
 * Envía automáticamente Authorization: Bearer <token> si recibe un token.
 */
export async function peticionApi<T>(
  endpoint: string,
  opciones: RequestInit = {},
  token: string | null = null
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opciones.headers as Record<string, string>)
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opciones,
      headers
    });

    const json = (await respuesta.json()) as ApiResponse<T>;

    if (!respuesta.ok && !json.error) {
      return crearRespuestaError<T>(
        `HTTP_${respuesta.status}`,
        "Ocurrió un error al comunicarse con el servidor."
      );
    }

    return json;
  } catch {
    return crearRespuestaError<T>(
      "ERROR_RED",
      "No pudimos conectarnos con el servidor. Verificá tu conexión a internet."
    );
  }
}