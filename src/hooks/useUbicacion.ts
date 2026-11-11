import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// Centro de Plaza Ramírez (Concepción del Uruguay) por defecto
const UBICACION_DEFECTO: Coordenadas = {
  latitud: -32.4816,
  longitud: -58.2366,
};

export function useUbicacion() {
  const [ubicacionUsuario, setUbicacionUsuario] = useState<Coordenadas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [permisoDenegado, setPermisoDenegado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        // 1. Pedir permisos al SO
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          // Si el usuario rechaza, usamos ubicación por defecto (Degradación elegante)
          setPermisoDenegado(true);
          setUbicacionUsuario(UBICACION_DEFECTO);
          return;
        }

        // 2. Obtener la ubicación real
        const localizacion = await Location.getCurrentPositionAsync({});
        setUbicacionUsuario({
          latitud: localizacion.coords.latitude,
          longitud: localizacion.coords.longitude,
        });

      } catch (error) {
        console.error("Error obteniendo ubicación:", error);
        setPermisoDenegado(true);
        setUbicacionUsuario(UBICACION_DEFECTO); // Fallback de seguridad
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return { ubicacionUsuario, cargando, permisoDenegado };
}