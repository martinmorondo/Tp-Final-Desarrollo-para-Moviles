import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { obtenerPerfilPorToken } from "../services/usuarios";
import { Usuario } from "../types";

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (usuario: Usuario, token: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const token = await SecureStore.getItemAsync("sesion_token");
        if (token) {
          const res = await obtenerPerfilPorToken(token);
          if (res.datos) {
            setUsuario(res.datos);
          } else {
            await SecureStore.deleteItemAsync("sesion_token");
          }
        }
      } catch (error) {
        console.error("Error al leer sesión:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarSesion();
  }, []);

  const iniciarSesion = async (nuevoUsuario: Usuario, token: string) => {
    await SecureStore.setItemAsync("sesion_token", token);
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync("sesion_token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
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