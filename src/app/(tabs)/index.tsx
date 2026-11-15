
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { EstadoPantalla } from '../../components/feedback/EstadoPantalla';
import { TarjetaComercio } from '../../components/ui/TarjetaComercio';
import { useComercios } from '../../hooks/useComercios';
import { obtenerRubros } from '../../services/rubros';
import { Rubro } from '../../types';

export default function DirectorioScreen() {
  const { comercios, cargando, error, cargar } = useComercios();

  const [busqueda, setBusqueda] = useState('');
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(null);
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [rubros, setRubros] = useState<Rubro[]>([]);

  // Obtener los rubros disponibles.
  useEffect(() => {
    async function cargarRubros() {
      const respuesta = await obtenerRubros();

      if (respuesta.datos) {
        setRubros(respuesta.datos);
      }
    }

    cargarRubros();
  }, []);

  // Aplicar los filtros combinados con una pequeña demora
  // para evitar realizar una petición por cada tecla escrita.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargar({
        busqueda,
        rubroId: rubroSeleccionado,
        abiertoAhora: filtroAbierto,
      });
    }, 300);

    return () => clearTimeout(temporizador);
  }, [cargar, busqueda, rubroSeleccionado, filtroAbierto]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setRubroSeleccionado(null);
    setFiltroAbierto(false);
  };

  const hayFiltrosActivos =
    busqueda.trim().length > 0 ||
    rubroSeleccionado !== null ||
    filtroAbierto;

  return (
    <View style={styles.pantalla}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Directorio CCU</Text>

        <Text style={styles.subtitulo}>
          Encontrá los comercios que necesitás
        </Text>

        {/* Búsqueda */}
        <View style={styles.contenedorBusqueda}>
          <Ionicons name="search-outline" size={20} color="#64748B" />

          <TextInput
            style={styles.inputBusqueda}
            placeholder="Buscar comercios o productos..."
            placeholderTextColor="#94A3B8"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro de apertura */}
        <View style={styles.filaFiltros}>
          <TouchableOpacity
            style={[
              styles.botonFiltro,
              filtroAbierto && styles.botonFiltroActivo,
            ]}
            onPress={() => setFiltroAbierto(!filtroAbierto)}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={filtroAbierto ? '#FFFFFF' : '#1E3A8A'}
            />

            <Text
              style={[
                styles.textoFiltro,
                filtroAbierto && styles.textoFiltroActivo,
              ]}
            >
              Abierto ahora
            </Text>
          </TouchableOpacity>

          {hayFiltrosActivos && (
            <TouchableOpacity
              style={styles.botonLimpiar}
              onPress={limpiarFiltros}
            >
              <Text style={styles.textoLimpiar}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro por rubro */}
        <Text style={styles.tituloRubros}>Explorar por rubro</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaRubros}
        >
          <TouchableOpacity
            style={[
              styles.chipRubro,
              rubroSeleccionado === null && styles.chipRubroActivo,
            ]}
            onPress={() => setRubroSeleccionado(null)}
          >
            <Text
              style={[
                styles.textoRubro,
                rubroSeleccionado === null && styles.textoRubroActivo,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {rubros.map((rubro) => {
            const seleccionado = rubroSeleccionado === rubro.id;

            return (
              <TouchableOpacity
                key={rubro.id}
                style={[
                  styles.chipRubro,
                  seleccionado && styles.chipRubroActivo,
                ]}
                onPress={() =>
                  setRubroSeleccionado(seleccionado ? null : rubro.id)
                }
              >
                <Text
                  style={[
                    styles.textoRubro,
                    seleccionado && styles.textoRubroActivo,
                  ]}
                >
                  {rubro.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Estados y listado de comercios */}
      {cargando ? (
        <EstadoPantalla estado="cargando" />
      ) : error ? (
        <EstadoPantalla
          estado="error"
          mensaje={error}
          onReintentar={() =>
            cargar({
              busqueda,
              rubroId: rubroSeleccionado,
              abiertoAhora: filtroAbierto,
            })
          }
        />
      ) : comercios.length === 0 ? (
        <EstadoPantalla
          estado="vacio"
          mensaje="No encontramos comercios con esos filtros."
          onReintentar={limpiarFiltros}
        />
      ) : (
        <FlatList
          data={comercios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TarjetaComercio
              comercio={item}
              onPress={() => router.push(`/comercio/${item.id}`)}
            />
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
    paddingBottom: 16,
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
    marginBottom: 16,
  },
  contenedorBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputBusqueda: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  filaFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },
  botonFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  botonFiltroActivo: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  textoFiltro: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  textoFiltroActivo: {
    color: '#FFFFFF',
  },
  botonLimpiar: {
    paddingVertical: 8,
  },
  textoLimpiar: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  tituloRubros: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  listaRubros: {
    gap: 8,
    paddingRight: 10,
  },
  chipRubro: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipRubroActivo: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  textoRubro: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  textoRubroActivo: {
    color: '#FFFFFF',
  },
  lista: {
    padding: 16,
  },
});
