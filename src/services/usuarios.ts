
import { MOCK_USUARIOS } from "../mocks/datos";
import { ApiResponse, Usuario } from "../types";
import {
  USAR_MOCKS,
  crearRespuestaError,
  crearRespuestaExito,
  peticionApi,
  simularLatencia,
  verificarErrorRedSimulado
} from "./api";

let usuariosMemoria: Usuario[] = [...MOCK_USUARIOS];

export interface RespuestaAutenticacion {
  usuario: Usuario;
  token: string;
}

/**
 * Inicia sesión con las credenciales del usuario.
 */
export async function iniciarSesionServicio(
  email: string,
  contrasena: string
): Promise<ApiResponse<RespuestaAutenticacion>> {
  if (!USAR_MOCKS) {
    return peticionApi<RespuestaAutenticacion>(
    "/auth/ingreso",
    {
      method: "POST",
      body: JSON.stringify({ email, contrasena })
    },
    null
  );
  }

  await simularLatencia(1000);

  const errorRed = verificarErrorRedSimulado<RespuestaAutenticacion>();
  if (errorRed) return errorRed;

  return new Promise((resolve) => {
    resolve({
      datos: {
        token: "token-falso-mock-123",
        usuario: {
          id: "usr-123",
          nombre: "Usuario Mock",
          email,
          rol: "vecino",
          comercioId: null,
          favoritos: [],
          rubrosDeInteres: [],
          avisosActivos: true
        }
      }
    });
  });
}

/**
 * Registra un nuevo vecino.
 * La API asigna automáticamente el rol vecino.
 */
export async function registrarUsuarioServicio(
  nombre: string,
  email: string,
  contrasena: string
): Promise<ApiResponse<RespuestaAutenticacion>> {
  if (!USAR_MOCKS) {
    return peticionApi<RespuestaAutenticacion>(
      "/auth/registro",
      {
        method: "POST",
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          contrasena
        })
      },
      null
    );
  }

  await simularLatencia(500);

  const errorRed = verificarErrorRedSimulado<RespuestaAutenticacion>();
  if (errorRed) return errorRed;

  const emailLimpio = email.trim().toLowerCase();

  const existe = usuariosMemoria.some(
    (usuario) => usuario.email.toLowerCase() === emailLimpio
  );

  if (existe) {
    return crearRespuestaError(
      "EMAIL_YA_REGISTRADO",
      "Ya existe una cuenta registrada con ese correo electrónico."
    );
  }

  const nuevoUsuario: Usuario = {
    id: `usr-${Date.now()}`,
    nombre: nombre.trim(),
    email: emailLimpio,
    rol: "vecino",
    comercioId: null,
    favoritos: [],
    rubrosDeInteres: [],
    avisosActivos: true
  };

  usuariosMemoria.push(nuevoUsuario);

  const tokenSimulado = `jwt-mock-${nuevoUsuario.id}-${Date.now()}`;

  return crearRespuestaExito(
    {
      usuario: { ...nuevoUsuario },
      token: tokenSimulado
    },
    1
  );
}

/**
 * Recupera el perfil del usuario autenticado.
 * La API obtiene la identidad a partir del token Bearer.
 */
export async function obtenerPerfilPorToken(
  token: string
): Promise<ApiResponse<Usuario>> {
  if (!USAR_MOCKS) {
    return peticionApi<Usuario>("/yo", {}, token);
  }

  await simularLatencia(250);

  const errorRed = verificarErrorRedSimulado<Usuario>();
  if (errorRed) return errorRed;

  const usuarioEncontrado = usuariosMemoria.find((usuario) =>
    token.includes(usuario.id)
  );

  if (!usuarioEncontrado) {
    return crearRespuestaError(
      "SESION_EXPIRADA",
      "Tu sesión expiró. Por favor, volvé a ingresar."
    );
  }

  return crearRespuestaExito({ ...usuarioEncontrado }, 1);
}

/**
 * Actualiza las preferencias de la cuenta autenticada.
 *
 * La API identifica al usuario mediante el token.
 * Se conserva usuarioId en la firma para no romper
 * las llamadas que ya existen en la aplicación.
 */
export async function actualizarPreferenciasUsuario(
  usuarioId: string,
  cambios: Partial<
    Pick<Usuario, "favoritos" | "rubrosDeInteres" | "avisosActivos">
  >,
  token: string | null = null
): Promise<ApiResponse<Usuario>> {
  if (!USAR_MOCKS) {
    return peticionApi<Usuario>(
    "/yo",
    {
      method: "PATCH",
      body: JSON.stringify(cambios)
    },
    token
  );
  }

  await simularLatencia(250);

  const errorRed = verificarErrorRedSimulado<Usuario>();
  if (errorRed) return errorRed;

  const indice = usuariosMemoria.findIndex(
    (usuario) => usuario.id === usuarioId
  );

  if (indice === -1) {
    return crearRespuestaError(
      "USUARIO_NO_ENCONTRADO",
      "El usuario no existe."
    );
  }

  const actualizado: Usuario = {
    ...usuariosMemoria[indice],
    ...cambios
  };

  usuariosMemoria[indice] = actualizado;

  return crearRespuestaExito({ ...actualizado }, 1);
}
