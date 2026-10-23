import { useCallback, useState } from 'react';
import { obtenerComercioPorId } from '../services/comercios';
import { Comercio } from '../types';

export function useComercio(id: string) {
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError(null);
    const respuesta = await obtenerComercioPorId(id);
    
    if (respuesta.error) {
      setError(respuesta.error.mensaje);
    } else if (respuesta.datos) {
      setComercio(respuesta.datos);
    }
    setCargando(false);
  }, [id]);

  return { comercio, cargando, error, cargar };
}