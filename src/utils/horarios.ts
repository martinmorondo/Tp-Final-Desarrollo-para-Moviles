import { Comercio, DiaSemana, Horario } from "../types";

/**
 * Convierte un horario en formato "HH:MM" a la cantidad total de minutos desde las 00:00.
 * Ejemplo: "08:30" -> 8 * 60 + 30 = 510 minutos.
 * Devuelve null si el formato es inválido.
 */
export function convertirHoraAMinutos(horaTexto: string): number | null {
  const partes = horaTexto.trim().split(":");
  if (partes.length !== 2) return null;

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  return horas * 60 + minutos;
}

/**
 * Determina si un comercio se encuentra abierto en una fecha y hora determinadas.
 * Contempla horarios partidos (mañana y tarde), días sin atención, domingos (0) y sábados (6).
 */
export function estaAbiertoAhora(
  comercio: Comercio,
  fechaHora: Date = new Date()
): boolean {
  if (!comercio.activo || !comercio.horarios || comercio.horarios.length === 0) {
    return false;
  }

  const diaActual = fechaHora.getDay() as DiaSemana; // 0 = Domingo ... 6 = Sábado
  const minutosActuales = fechaHora.getHours() * 60 + fechaHora.getMinutes();

  const tramosDeHoy = comercio.horarios.filter((h) => h.dia === diaActual);
  if (tramosDeHoy.length === 0) {
    return false;
  }

  for (const tramo of tramosDeHoy) {
    const minAbre = convertirHoraAMinutos(tramo.abre);
    const minCierra = convertirHoraAMinutos(tramo.cierra);

    if (minAbre === null || minCierra === null) continue;

    // Tramo normal dentro del mismo día (ej. 08:00 a 12:00 o 16:30 a 20:30)
    if (minCierra >= minAbre) {
      if (minutosActuales >= minAbre && minutosActuales < minCierra) {
        return true;
      }
    } else {
      // Tramo nocturno que cruza la medianoche (ej. 20:00 a 02:00)
      if (minutosActuales >= minAbre || minutosActuales < minCierra) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Devuelve un resumen legible para la UI (ej. "Abierto · cierra 12:00" o "Cerrado · abre 16:30")
 * respetando el diseño de las tarjetas del PRD.
 */
export function obtenerResumenHorario(
  comercio: Comercio,
  fechaHora: Date = new Date()
): { abierto: boolean; etiqueta: string } {
  if (!comercio.activo) {
    return { abierto: false, etiqueta: "Comercio inactivo" };
  }

  if (!comercio.horarios || comercio.horarios.length === 0) {
    return { abierto: false, etiqueta: "Cerrado temporalmente" };
  }

  const diaActual = fechaHora.getDay() as DiaSemana;
  const minutosActuales = fechaHora.getHours() * 60 + fechaHora.getMinutes();

  const tramosDeHoy: Horario[] = comercio.horarios
    .filter((h) => h.dia === diaActual)
    .sort((a, b) => (convertirHoraAMinutos(a.abre) ?? 0) - (convertirHoraAMinutos(b.abre) ?? 0));

  for (const tramo of tramosDeHoy) {
    const minAbre = convertirHoraAMinutos(tramo.abre);
    const minCierra = convertirHoraAMinutos(tramo.cierra);
    if (minAbre === null || minCierra === null) continue;

    if (minutosActuales >= minAbre && minutosActuales < minCierra) {
      return {
        abierto: true,
        etiqueta: `Abierto · cierra ${tramo.cierra}`
      };
    }
  }

  // Si está cerrado ahora, buscamos si abre más tarde hoy (ej. al mediodía esperando turno tarde)
  for (const tramo of tramosDeHoy) {
    const minAbre = convertirHoraAMinutos(tramo.abre);
    if (minAbre !== null && minutosActuales < minAbre) {
      return {
        abierto: false,
        etiqueta: `Cerrado · abre hoy ${tramo.abre}`
      };
    }
  }

  return { abierto: false, etiqueta: "Cerrado ahora" };
}