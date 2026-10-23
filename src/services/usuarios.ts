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
 * Inicia sesión validando email y contraseña.
 * Para pruebas con Mocks:
 * - Vecino: marta@mail.com (cualquier contraseña de 4+ caracteres)
 * - Comercio: roberto@eltornillo.com (cualquier contraseña de 4+ caracteres)
 */
export async function iniciarSesionServicio(
  email: string,
  contrasena: string
): Promise<ApiResponse<RespuestaAutenticacion>> {
  if (!USAR_MOCKS) {
    return peticionApi<RespuestaAutenticacion>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, contrasena })
    });
  }

  await simularLatencia(450);
  const errorRed = verificarErrorRedSimulado<RespuestaAutenticacion>();
  if (errorRed) return errorRed;

  const emailLimpio = email.trim().toLowerCase();
  const usuario = usuariosMemoria.find(
    (u) => u.email.toLowerCase() === emailLimpio
  );

  if (!usuario || contrasena.trim().length < 4) {
    return crearRespuestaError(
      "CREDENCIALES_INVALIDAS",
      "El correo o la contraseña ingresados no son correctos."
    );
  }

  const tokenSimulado = `jwt-mock-${usuario.id}-${Date.now()}`;

  return crearRespuestaExito(
    {
      usuario: { ...usuario },
      token: tokenSimulado
    },
    1
  );
}

/**
 * Registra un nuevo vecino en la plataforma.
 */
export async function registrarUsuarioServicio(
  nombre: string,
  email: string,
  contrasena: string
): Promise<ApiResponse<RespuestaAutenticacion>> {
  if (!USAR_MOCKS) {
    return peticionApi<RespuestaAutenticacion>("/auth/registro", {
      method: "POST",
      body: JSON.stringify({ nombre, email, contrasena })
    });
  }

  await simularLatencia(500);
  const errorRed = verificarErrorRedSimulado<RespuestaAutenticacion>();
  if (errorRed) return errorRed;

  const emailLimpio = email.trim().toLowerCase();
  const existe = usuariosMemoria.some(
    (u) => u.email.toLowerCase() === emailLimpio
  );

  if (existe) {
    return crearRespuestaError(
      "EMAIL_EN_USO",
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
 * Recupera la sesión del usuario a partir del token guardado en SecureStore.
 */
export async function obtenerPerfilPorToken(
  token: string
): Promise<ApiResponse<Usuario>> {
  if (!USAR_MOCKS) {
    return peticionApi<Usuario>("/auth/perfil", {}, token);
  }

  await simularLatencia(250);
  const errorRed = verificarErrorRedSimulado<Usuario>();
  if (errorRed) return errorRed;

  const usuarioEncontrado = usuariosMemoria.find((u) =>
    token.includes(u.id)
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
 * Actualiza favoritos, rubros de interés o el interruptor general de avisos.
 */
export async function actualizarPreferenciasUsuario(
  usuarioId: string,
  cambios: Partial<Pick<Usuario, "favoritos" | "rubrosDeInteres" | "avisosActivos">>,
  token: string | null = null
): Promise<ApiResponse<Usuario>> {
  if (!USAR_MOCKS) {
    return peticionApi<Usuario>(
      `/usuarios/${usuarioId}/preferencias`,
      { method: "PATCH", body: JSON.stringify(cambios) },
      token
    );
  }

  await simularLatencia(250);
  const errorRed = verificarErrorRedSimulado<Usuario>();
  if (errorRed) return errorRed;

  const indice = usuariosMemoria.findIndex((u) => u.id === usuarioId);
  if (indice === -1) {
    return crearRespuestaError("USUARIO_NO_ENCONTRADO", "El usuario no existe.");
  }

  const actualizado: Usuario = {
    ...usuariosMemoria[indice],
    ...cambios
  };

  usuariosMemoria[indice] = actualizado;
  return crearRespuestaExito({ ...actualizado }, 1);
}