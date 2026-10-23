import { useCallback, useState } from 'react';
import { FiltrosComercios, obtenerComercios } from '../services/comercios';
import { Comercio } from '../types';

export function useComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (filtros?: FiltrosComercios) => {
    setCargando(true);
    setError(null);
    const respuesta = await obtenerComercios(filtros);
    
    if (respuesta.error) {
      setError(respuesta.error.mensaje);
    } else if (respuesta.datos) {
      setComercios(respuesta.datos);
    }
    setCargando(false);
  }, []);

  return { comercios, cargando, error, cargar };
}