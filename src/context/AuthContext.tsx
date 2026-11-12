
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { obtenerPerfilPorToken } from "../services/usuarios";
import { Usuario } from "../types";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (usuario: Usuario, token: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const CLAVE_TOKEN = "sesion_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Recupera la sesión cuando se inicia la aplicación.
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const token = await SecureStore.getItemAsync(CLAVE_TOKEN);

        if (!token) {
          setUsuario(null);
          return;
        }

        const respuesta = await obtenerPerfilPorToken(token);

        if (respuesta.datos) {
          setUsuario(respuesta.datos);
          return;
        }

        // Si el servidor confirma que la sesión no es válida,
        // eliminamos el token guardado.
        if (respuesta.error?.codigo === "NO_AUTENTICADO") {
          await SecureStore.deleteItemAsync(CLAVE_TOKEN);
          setUsuario(null);
        }
      } catch (error) {
        console.error("Error al recuperar la sesión:", error);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
  }, []);

  // Guarda el token y actualiza el usuario autenticado.
  const iniciarSesion = async (
    nuevoUsuario: Usuario,
    token: string
  ) => {
    await SecureStore.setItemAsync(CLAVE_TOKEN, token);
    setUsuario(nuevoUsuario);
  };

  // Elimina la sesión del dispositivo.
  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        cerrarSesion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}
