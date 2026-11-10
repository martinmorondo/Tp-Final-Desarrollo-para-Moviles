import { kv } from 'expo-sqlite/kv-store';

const CLAVE_FAVORITOS = 'app_favoritos';

/**
 * Obtiene la lista de IDs de comercios guardados como favoritos.
 * Retorna un arreglo vacío si no hay nada guardado.
 */
export async function obtenerFavoritosLocales(): Promise<string[]> {
  try {
    const datos = kv.getItemSync(CLAVE_FAVORITOS);
    if (datos) {
      return JSON.parse(datos);
    }
  } catch (error) {
    console.error("Error al leer favoritos de KV-Store:", error);
  }
  return [];
}

/**
 * Agrega o elimina un comercio de la lista de favoritos local.
 * Retorna la nueva lista actualizada.
 */
export async function alternarFavoritoLocal(comercioId: string): Promise<string[]> {
  try {
    const actuales = await obtenerFavoritosLocales();
    const existe = actuales.includes(comercioId);
    
    let nuevosFavoritos;
    if (existe) {
      nuevosFavoritos = actuales.filter(id => id !== comercioId);
    } else {
      nuevosFavoritos = [...actuales, comercioId];
    }
    
    kv.setItemSync(CLAVE_FAVORITOS, JSON.stringify(nuevosFavoritos));
    return nuevosFavoritos;
  } catch (error) {
    console.error("Error al guardar favorito en KV-Store:", error);
    return [];
  }
}