
import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "../types";

// Cuando se habilite la API real, solo cambiamos USAR_MOCKS a false.
export const USAR_MOCKS = false;

// URL base del backend.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.244:3000"
).replace(/\/$/, "");

// Permite simular un fallo de red.
let simularFalloDeRed = false;

export function configurarSimulacionErrorRed(activar: boolean): void {
  simularFalloDeRed = activar;
}

export function estaSimulandoErrorRed(): boolean {
  return simularFalloDeRed;
}

/**
 * Simula el tiempo de respuesta de un servidor real.
 */
export async function simularLatencia(ms: number = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Construye una respuesta exitosa.
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
 * Construye una respuesta de error.
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
 * Verifica si se activó la simulación de error de red.
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
 * Cliente HTTP centralizado.
 *
 * Si no se especifica un token, lo recupera automáticamente
 * desde SecureStore y lo envía como Bearer.
 *
 * Si se pasa null, no envía token (por ejemplo, login y registro).
 */
export async function peticionApi<T>(
  endpoint: string,
  opciones: RequestInit = {},
  token?: string | null
): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(opciones.headers);

    headers.set("Accept", "application/json");

    const esFormData =
      typeof FormData !== "undefined" &&
      opciones.body instanceof FormData;

    // No establecer Content-Type manualmente para FormData:
    // fetch debe generar automáticamente el boundary multipart.
    if (
      opciones.body &&
      !esFormData &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    // Si token es undefined, recuperamos la sesión guardada.
    // Si es null, respetamos la decisión de no enviar token.
    const tokenAutenticacion =
      token === undefined
        ? await SecureStore.getItemAsync("sesion_token")
        : token;

    if (tokenAutenticacion) {
      headers.set("Authorization", `Bearer ${tokenAutenticacion}`);
    }

    const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...opciones,
      headers
    });

    // Algunas operaciones, como DELETE, responden con HTTP 204
    // y no incluyen contenido.
    const texto = await respuesta.text();

    if (!texto.trim()) {
      if (!respuesta.ok) {
        return crearRespuestaError<T>(
          `HTTP_${respuesta.status}`,
          "Ocurrió un error al comunicarse con el servidor."
        );
      }

      return {} as ApiResponse<T>;
    }

    let json: ApiResponse<T>;

    try {
      json = JSON.parse(texto) as ApiResponse<T>;
    } catch {
      return crearRespuestaError<T>(
        "RESPUESTA_INVALIDA",
        "El servidor devolvió una respuesta que no pudimos interpretar."
      );
    }

    if (!respuesta.ok && !json.error) {
      return crearRespuestaError<T>(
        `HTTP_${respuesta.status}`,
        "Ocurrió un error al comunicarse con el servidor."
      );
    }

    return json;
  } catch (error) {
    console.error("Error en petición API:", error);

    return crearRespuestaError<T>(
      "ERROR_RED",
      "No pudimos conectarnos con el servidor. Verificá tu conexión a internet."
    );
  }
}
