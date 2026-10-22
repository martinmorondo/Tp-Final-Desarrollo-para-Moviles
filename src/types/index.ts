// -----------------------------------------
// TIPOS DE DOMINIO 
// -----------------------------------------

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// días de 0 (domingo) a 6 (sábado)
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Horario {
  dia: DiaSemana;
  abre: string; // formato "HH:MM"
  cierra: string; // formato "HH:MM"
}

export interface Comercio {
  id: string;
  nombre: string;
  rubroId: string;
  descripcion: string;
  direccion: string;
  coordenadas: Coordenadas;
  telefono: string | null;
  whatsapp: string | null;
  instagram: string | null;
  imagenes: string[];
  videoUrl: string | null;
  horarios: Horario[];
  mediosDePago: string[];
  puntaje: number;
  cantidadResenas: number;
  codigoQr: string | null;
  activo: boolean;
}

export interface Rubro {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
}

export interface Promocion {
  id: string;
  comercioId: string; 
  titulo: string;
  detalle: string;
  descuento: number | null;
  desde: string; 
  hasta: string; 
  imagenUrl: string | null;
  soloApp: boolean;
  usos: number;
  activa: boolean;
}

export type Estrellas = 1 | 2 | 3 | 4 | 5;

export interface Resena {
  id: string;
  comercioId: string;
  usuarioId: string;
  estrellas: Estrellas;
  comentario: string;
  respuesta: string | null;
  reportada: boolean;
  creadaEn: string; 
  sincronizada: boolean;
}

export interface UsoDePromocion {
  id: string;
  promocionId: string;
  usuarioId: string;
  codigo: string;
  validadoEn: string | null;
}

export type Rol = "vecino" | "comercio";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  comercioId: string | null;
  favoritos: string[];
  rubrosDeInteres: string[];
  avisosActivos: boolean;
}

// -----------------------------------------
// TIPOS DE LA API DE LA CÁTEDRA
// -----------------------------------------

export interface MetaData {
  total: number;
  pagina: number;
  porPagina: number;
}

export interface ApiError {
  codigo: string;
  mensaje: string;
}

// Interfaz genérica para tipar las respuestas
export interface ApiResponse<T> {
  datos?: T;
  meta?: MetaData;
  error?: ApiError;
}