import { Comercio, Promocion, Rubro, Usuario } from "../types";

export const MOCK_RUBROS: Rubro[] = [
  { id: "rub-ferreteria", nombre: "Ferretería y construcción", icono: "hammer-outline", color: "#7A5C3E", orden: 1 },
  { id: "rub-gastro", nombre: "Gastronomía", icono: "restaurant-outline", color: "#EF4444", orden: 2 },
  { id: "rub-ropa", nombre: "Indumentaria", icono: "shirt-outline", color: "#3B82F6", orden: 3 }
];

export const MOCK_COMERCIOS: Comercio[] = [
  // 1. Caso Normal
  {
    id: "com-118",
    nombre: "Ferretería El Tornillo",
    rubroId: "rub-ferreteria",
    descripcion: "Ferretería de barrio con más de 40 años sobre 9 de Julio.",
    direccion: "9 de Julio 855",
    coordenadas: { latitud: -32.4835, longitud: -58.2312 }, // Corregido el signo de latitud para Entre Ríos
    telefono: "3442-425566",
    whatsapp: "5493442425566",
    instagram: "@eltornillocdelu",
    imagenes: ["https://api.ccu.org.ar/img/tornillo-1.jpg"],
    videoUrl: "https://api.ccu.org.ar/v/tornillo.mp4",
    horarios: [
      { dia: 1, abre: "08:00", cierra: "12:00" }, // Lunes mañana
      { dia: 1, abre: "16:30", cierra: "20:30" }, // Lunes tarde
      { dia: 2, abre: "08:00", cierra: "12:00" }, // Martes mañana
      { dia: 2, abre: "16:30", cierra: "20:30" }, // Martes tarde
    ],
    mediosDePago: ["efectivo", "debito", "transferencia"],
    puntaje: 4.6,
    cantidadResenas: 38,
    codigoQr: "CCU:com-118",
    activo: true
  },
  // 2. Caso Límite: Comercio sin multimedia (imágenes vacías, sin video)
  {
    id: "com-200",
    nombre: "Rotisería Lo de Marta",
    rubroId: "rub-gastro",
    descripcion: "Empanadas y comidas caseras.",
    direccion: "Suipacha 120",
    coordenadas: { latitud: -32.4850, longitud: -58.2300 },
    telefono: "3442-111111",
    whatsapp: null,
    instagram: null,
    imagenes: [], // Lista vacía
    videoUrl: null, // Sin video
    horarios: [
      { dia: 5, abre: "20:00", cierra: "23:59" }, // Viernes (horario nocturno)
      { dia: 6, abre: "20:00", cierra: "23:59" }, // Sábado
    ],
    mediosDePago: ["efectivo"],
    puntaje: 4.8,
    cantidadResenas: 12,
    codigoQr: "CCU:com-200",
    activo: true
  },
  // 3. Caso Límite: Comercio sin reseñas
  {
    id: "com-300",
    nombre: "Ropa Nueva",
    rubroId: "rub-ropa",
    descripcion: "Inauguramos hace 2 días.",
    direccion: "Galarza 50",
    coordenadas: { latitud: -32.4820, longitud: -58.2330 },
    telefono: null,
    whatsapp: "5493442222222",
    instagram: null,
    imagenes: ["https://api.ccu.org.ar/img/ropa-1.jpg"],
    videoUrl: null,
    horarios: [{ dia: 1, abre: "09:00", cierra: "17:00" }], // Horario corrido
    mediosDePago: ["efectivo", "transferencia"],
    puntaje: 0, // Sin puntaje
    cantidadResenas: 0, // Sin reseñas
    codigoQr: null,
    activo: true
  },
  // 4. Caso Límite: Cerrado por vacaciones (activo pero sin horarios cargados)
  {
    id: "com-400",
    nombre: "Heladería Polar",
    rubroId: "rub-gastro",
    descripcion: "Cerrado por temporada invernal.",
    direccion: "Urquiza 300",
    coordenadas: { latitud: -32.4810, longitud: -58.2350 },
    telefono: null,
    whatsapp: null,
    instagram: null,
    imagenes: [],
    videoUrl: null,
    horarios: [], // Lista de horarios vacía
    mediosDePago: ["efectivo"],
    puntaje: 3.5,
    cantidadResenas: 50,
    codigoQr: null,
    activo: true
  }
];

// Asumimos fechas relativas al año 2026 como indica el prompt
export const MOCK_PROMOCIONES: Promocion[] = [
  // Promoción vigente (Actual)
  {
    id: "pro-441",
    comercioId: "com-118",
    titulo: "15% en pinturas",
    detalle: "No acumulable con otras promociones. Hasta agotar stock.",
    descuento: 15,
    desde: "2026-10-01T00:00:00-03:00",
    hasta: "2026-10-31T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 27,
    activa: true
  },
  // Promoción próxima (Empieza el mes siguiente)
  {
    id: "pro-442",
    comercioId: "com-118",
    titulo: "20% en herramientas eléctricas",
    detalle: "Especial CyberMonday.",
    descuento: 20,
    desde: "2026-11-01T00:00:00-03:00",
    hasta: "2026-11-10T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 0,
    activa: true
  },
  // Promoción vencida (Terminó en septiembre)
  {
    id: "pro-443",
    comercioId: "com-200",
    titulo: "Docena de empanadas a $4000",
    detalle: "Válido solo martes.",
    descuento: null,
    desde: "2026-09-01T00:00:00-03:00",
    hasta: "2026-09-30T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 150,
    activa: true
  }
];

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: "usr-vecino",
    nombre: "Marta Giménez",
    email: "marta@mail.com",
    rol: "vecino",
    comercioId: null,
    favoritos: ["com-118"],
    rubrosDeInteres: ["rub-ferreteria", "rub-ropa"],
    avisosActivos: true
  },
  {
    id: "usr-comercio",
    nombre: "Juan Pérez",
    email: "juan@eltornillo.com",
    rol: "comercio",
    comercioId: "com-118", // Vinculado a la ferretería
    favoritos: [],
    rubrosDeInteres: [],
    avisosActivos: false
  }
];