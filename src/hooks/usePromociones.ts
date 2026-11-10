import { useCallback, useState } from 'react';
import { FiltrosPromociones, obtenerPromociones } from '../services/promociones';
import { Promocion } from '../types';

export function usePromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (filtros?: FiltrosPromociones) => {
    setCargando(true);
    setError(null);
    const respuesta = await obtenerPromociones(filtros);
    
    if (respuesta.error) {
      setError(respuesta.error.mensaje);
    } else if (respuesta.datos) {
      setPromociones(respuesta.datos);
    }
    setCargando(false);
  }, []);

  return { promociones, cargando, error, cargar };
}