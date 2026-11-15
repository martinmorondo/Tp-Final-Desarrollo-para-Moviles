
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { TarjetaComercio } from '../../components/ui/TarjetaComercio';
import {
    obtenerComercioPorId,
} from '../../services/comercios';
import {
    alternarFavoritoLocal,
    obtenerFavoritosLocales,
} from '../../storage/favoritos';
import { Comercio } from '../../types';

export default function FavoritosScreen() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarFavoritos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const ids = await obtenerFavoritosLocales();
      const resultados = await Promise.all(
        ids.map((id) => obtenerComercioPorId(id))
      );

      const favoritos = resultados
        .filter((respuesta) => respuesta.datos !== null)
        .map((respuesta) => respuesta.datos as Comercio);

      setComercios(favoritos);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      setError('No pudimos cargar tus comercios favoritos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [cargarFavoritos])
  );

  const quitarFavorito = async (comercioId: string) => {
    await alternarFavoritoLocal(comercioId);
    setComercios((actuales) =>
      actuales.filter((comercio) => comercio.id !== comercioId)
    );
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Mis favoritos</Text>
        <Text style={styles.subtitulo}>
          Tus comercios guardados en un solo lugar
        </Text>
      </View>

      {cargando ? (
        <EstadoPantalla estado="cargando" />
      ) : error ? (
        <EstadoPantalla
          estado="error"
          mensaje={error}
          onReintentar={cargarFavoritos}
        />
      ) : comercios.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons
            name="heart-outline"
            size={54}
            color="#94A3B8"
          />
          <Text style={styles.tituloVacio}>
            Todavía no tenés favoritos
          </Text>
          <Text style={styles.textoVacio}>
            Guardá los comercios que más te interesen y aparecerán acá.
          </Text>
          <TouchableOpacity
            style={styles.boton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.textoBoton}>Explorar comercios</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={comercios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.contenedorTarjeta}>
              <View style={styles.tarjeta}>
                <TarjetaComercio
                  comercio={item}
                  onPress={() => router.push(`/comercio/${item.id}`)}
                />
              </View>

              <TouchableOpacity
                style={styles.botonQuitar}
                onPress={() => quitarFavorito(item.id)}
                accessibilityLabel={`Quitar ${item.nombre} de favoritos`}
              >
                <Ionicons
                  name="heart"
                  size={22}
                  color="#DC2626"
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cabecera: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  lista: {
    padding: 16,
  },
  contenedorTarjeta: {
    position: 'relative',
  },
  tarjeta: {
    paddingRight: 52,
  },
  botonQuitar: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
    zIndex: 1,
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  tituloVacio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    textAlign: 'center',
  },
  textoVacio: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  boton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
