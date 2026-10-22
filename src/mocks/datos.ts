import { Comercio, Promocion, Resena, Rubro, UsoDePromocion, Usuario } from "../types";

export const MOCK_RUBROS: Rubro[] = [
  { id: "rub-gastro", nombre: "Gastronomía", icono: "restaurant-outline", color: "#EF4444", orden: 1 },
  { id: "rub-ropa", nombre: "Indumentaria", icono: "shirt-outline", color: "#3B82F6", orden: 2 },
  { id: "rub-hogar", nombre: "Hogar", icono: "home-outline", color: "#10B981", orden: 3 },
  { id: "rub-ferreteria", nombre: "Ferretería y construcción", icono: "hammer-outline", color: "#7A5C3E", orden: 4 },
  { id: "rub-salud", nombre: "Salud y farmacia", icono: "medkit-outline", color: "#06B6D4", orden: 5 },
  { id: "rub-servicios", nombre: "Servicios", icono: "construct-outline", color: "#8B5CF6", orden: 6 },
  { id: "rub-tecno", nombre: "Tecnología", icono: "laptop-outline", color: "#6366F1", orden: 7 },
  { id: "rub-libreria", nombre: "Librería", icono: "book-outline", color: "#F59E0B", orden: 8 },
  { id: "rub-otros", nombre: "Otros", icono: "grid-outline", color: "#6B7280", orden: 9 }
];

export const MOCK_COMERCIOS: Comercio[] = [
  // 1. Caso Normal Completo
  {
    id: "com-118",
    nombre: "Ferretería El Tornillo",
    rubroId: "rub-ferreteria",
    descripcion: "Ferretería de barrio con más de 40 años sobre 9 de Julio. Venta de herramientas, pinturas, tornillería y electricidad.",
    direccion: "9 de Julio 855",
    coordenadas: { latitud: -32.4835, longitud: -58.2312 },
    telefono: "3442-425566",
    whatsapp: "5493442425566",
    instagram: "@eltornillocdelu",
    imagenes: [
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800",
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    horarios: [
      { dia: 1, abre: "08:00", cierra: "12:00" },
      { dia: 1, abre: "16:30", cierra: "20:30" },
      { dia: 2, abre: "08:00", cierra: "12:00" },
      { dia: 2, abre: "16:30", cierra: "20:30" },
      { dia: 3, abre: "08:00", cierra: "12:00" },
      { dia: 3, abre: "16:30", cierra: "20:30" },
      { dia: 4, abre: "08:00", cierra: "12:00" },
      { dia: 4, abre: "16:30", cierra: "20:30" },
      { dia: 5, abre: "08:00", cierra: "12:00" },
      { dia: 5, abre: "16:30", cierra: "20:30" },
      { dia: 6, abre: "08:30", cierra: "13:00" }
    ],
    mediosDePago: ["efectivo", "debito", "transferencia"],
    puntaje: 4.6,
    cantidadResenas: 2,
    codigoQr: "CCU:com-118",
    activo: true
  },
  // 2. Caso Límite: Sin fotos ni video, horario corrido amplio todos los días (incluido domingo)
  {
    id: "com-200",
    nombre: "Panadería La Unión",
    rubroId: "rub-gastro",
    descripcion: "Facturas calentitas, pan casero, tortas y sándwiches de miga todo el día.",
    direccion: "Suipacha 120",
    coordenadas: { latitud: -32.4850, longitud: -58.2300 },
    telefono: "3442-431111",
    whatsapp: null,
    instagram: "@panaderialaunion",
    imagenes: [],
    videoUrl: null,
    horarios: [
      { dia: 0, abre: "07:00", cierra: "13:00" },
      { dia: 1, abre: "07:00", cierra: "21:00" },
      { dia: 2, abre: "07:00", cierra: "21:00" },
      { dia: 3, abre: "07:00", cierra: "21:00" },
      { dia: 4, abre: "07:00", cierra: "21:00" },
      { dia: 5, abre: "07:00", cierra: "21:00" },
      { dia: 6, abre: "07:00", cierra: "21:00" }
    ],
    mediosDePago: ["efectivo", "debito", "transferencia"],
    puntaje: 5.0,
    cantidadResenas: 1,
    codigoQr: "CCU:com-200",
    activo: true
  },
  // 3. Caso Límite: Comercio recién inaugurado sin reseñas
  {
    id: "com-300",
    nombre: "Gurises Ropa Infantil",
    rubroId: "rub-ropa",
    descripcion: "Indumentaria para bebés y niños de 0 a 12 años en pleno centro.",
    direccion: "9 de Julio 720",
    coordenadas: { latitud: -32.4820, longitud: -58.2330 },
    telefono: null,
    whatsapp: "5493442222222",
    instagram: "@gurisescdelu",
    imagenes: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800"],
    videoUrl: null,
    horarios: [
      { dia: 1, abre: "09:00", cierra: "12:30" },
      { dia: 1, abre: "17:00", cierra: "20:30" },
      { dia: 2, abre: "09:00", cierra: "12:30" },
      { dia: 2, abre: "17:00", cierra: "20:30" },
      { dia: 3, abre: "09:00", cierra: "12:30" },
      { dia: 3, abre: "17:00", cierra: "20:30" },
      { dia: 4, abre: "09:00", cierra: "12:30" },
      { dia: 4, abre: "17:00", cierra: "20:30" },
      { dia: 5, abre: "09:00", cierra: "12:30" },
      { dia: 5, abre: "17:00", cierra: "20:30" },
      { dia: 6, abre: "09:00", cierra: "13:00" }
    ],
    mediosDePago: ["efectivo", "transferencia", "credito"],
    puntaje: 0,
    cantidadResenas: 0,
    codigoQr: "CCU:com-300",
    activo: true
  },
  // 4. Caso Límite: Cerrado por vacaciones (sin horarios activos)
  {
    id: "com-400",
    nombre: "Heladería Polar",
    rubroId: "rub-gastro",
    descripcion: "Helados artesanales. Cerrado por reformas y vacaciones anuales.",
    direccion: "Urquiza 300",
    coordenadas: { latitud: -32.4810, longitud: -58.2350 },
    telefono: null,
    whatsapp: null,
    instagram: null,
    imagenes: [],
    videoUrl: null,
    horarios: [],
    mediosDePago: ["efectivo"],
    puntaje: 3.5,
    cantidadResenas: 0,
    codigoQr: null,
    activo: true
  }
];

export const MOCK_PROMOCIONES: Promocion[] = [
  // 1. Promoción vigente todo el año 2026
  {
    id: "pro-441",
    comercioId: "com-118",
    titulo: "15% en pinturas",
    detalle: "No acumulable con otras promociones. Hasta agotar stock pagando en efectivo o transferencia.",
    descuento: 15,
    desde: "2026-01-01T00:00:00-03:00",
    hasta: "2026-12-31T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 27,
    activa: true
  },
  // 2. Promoción próxima a vencer (vence dentro de pocos días desde octubre 2026)
  {
    id: "pro-442",
    comercioId: "com-200",
    titulo: "20% en docena de facturas",
    detalle: "Presentando el código de la app en mostrador de lunes a viernes.",
    descuento: 20,
    desde: "2026-10-01T00:00:00-03:00",
    hasta: "2026-10-26T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 14,
    activa: true
  },
  // 3. Promoción próxima (arranca en noviembre 2026)
  {
    id: "pro-443",
    comercioId: "com-300",
    titulo: "30% en remeras de verano",
    detalle: "Adelanto de temporada verano. Válido para todos los talles.",
    descuento: 30,
    desde: "2026-11-05T00:00:00-03:00",
    hasta: "2026-11-30T23:59:00-03:00",
    imagenUrl: null,
    soloApp: false,
    usos: 0,
    activa: true
  },
  // 4. Promoción VENCIDA (No debe mostrarse en listados vigentes, sirve para probar error PROMO_VENCIDA)
  {
    id: "pro-444",
    comercioId: "com-118",
    titulo: "10% en estufas y calefactores",
    detalle: "Promoción exclusiva de invierno.",
    descuento: 10,
    desde: "2026-06-01T00:00:00-03:00",
    hasta: "2026-08-31T23:59:00-03:00",
    imagenUrl: null,
    soloApp: true,
    usos: 85,
    activa: true
  }
];

export const MOCK_RESENAS: Resena[] = [
  {
    id: "res-2210",
    comercioId: "com-118",
    usuarioId: "usr-512",
    estrellas: 5,
    comentario: "Tenían el tornillo raro que no conseguía en ningún lado.",
    respuesta: "¡Gracias Marta! Siempre a las órdenes.",
    reportada: false,
    creadaEn: "2026-09-10T17:05:00-03:00",
    sincronizada: true
  },
  {
    id: "res-2211",
    comercioId: "com-118",
    usuarioId: "usr-513",
    estrellas: 4,
    comentario: "Muy buena atención y buenos precios en pinturas, aunque había un poco de fila.",
    respuesta: null,
    reportada: false,
    creadaEn: "2026-10-15T10:30:00-03:00",
    sincronizada: true
  },
  {
    id: "res-2212",
    comercioId: "com-200",
    usuarioId: "usr-512",
    estrellas: 5,
    comentario: "Las mejores medialunas de Concepción del Uruguay.",
    respuesta: "¡Muchas gracias por visitarnos!",
    reportada: false,
    creadaEn: "2026-10-18T09:15:00-03:00",
    sincronizada: true
  }
];

export const MOCK_USOS_PROMOCION: UsoDePromocion[] = [
  // Código ya validado en el pasado
  {
    id: "uso-7781",
    promocionId: "pro-441",
    usuarioId: "usr-512",
    codigo: "CCU-441-512-8842",
    validadoEn: "2026-09-12T11:20:00-03:00"
  },
  // Código pendiente de escanear en mostrador (para probar escáner del comercio)
  {
    id: "uso-7782",
    promocionId: "pro-441",
    usuarioId: "usr-512",
    codigo: "CCU-441-512-9901",
    validadoEn: null
  }
];

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: "usr-512",
    nombre: "Marta Giménez",
    email: "marta@mail.com",
    rol: "vecino",
    comercioId: null,
    favoritos: ["com-118"],
    rubrosDeInteres: ["rub-ferreteria"],
    avisosActivos: true
  },
  {
    id: "usr-comercio",
    nombre: "Roberto Gómez (Ferretería El Tornillo)",
    email: "roberto@eltornillo.com",
    rol: "comercio",
    comercioId: "com-118",
    favoritos: [],
    rubrosDeInteres: [],
    avisosActivos: false
  }
];