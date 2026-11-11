import * as SQLite from 'expo-sqlite';
import { Comercio } from '../types';

// En Expo SDK 50+, se usa openDatabaseSync
export const db = SQLite.openDatabaseSync('directorio.db');

/**
 * Inicializa las tablas necesarias para guardar los comercios y sus horarios
 * de forma local. Permite el funcionamiento offline exigido.
 */
export function inicializarBaseDeDatos() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS comercios (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      rubroId TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      whatsapp TEXT,
      activo INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comercioId TEXT NOT NULL,
      dia INTEGER NOT NULL,
      abre TEXT NOT NULL,
      cierra TEXT NOT NULL,
      FOREIGN KEY (comercioId) REFERENCES comercios (id) ON DELETE CASCADE
    );
  `);
  console.log("Base de datos SQLite inicializada correctamente.");
}

/**
 * Guarda una lista de comercios en el dispositivo. 
 * Primero borra los anteriores para mantener la caché fresca.
 */
export function guardarComerciosLocal(comercios: Comercio[]) {
  try {
    db.withTransactionSync(() => {
      // Limpiar caché vieja
      db.execSync('DELETE FROM horarios;');
      db.execSync('DELETE FROM comercios;');

      const insertComercio = db.prepareSync(
        'INSERT INTO comercios (id, nombre, rubroId, direccion, telefono, whatsapp, activo) VALUES ($id, $nombre, $rubroId, $direccion, $telefono, $whatsapp, $activo)'
      );
      
      const insertHorario = db.prepareSync(
        'INSERT INTO horarios (comercioId, dia, abre, cierra) VALUES ($comercioId, $dia, $abre, $cierra)'
      );

      for (const comercio of comercios) {
        insertComercio.executeSync({
          $id: comercio.id,
          $nombre: comercio.nombre,
          $rubroId: comercio.rubroId,
          $direccion: comercio.direccion || "",
          $telefono: comercio.telefono || null,
          $whatsapp: comercio.whatsapp || null,
          $activo: comercio.activo ? 1 : 0
        });

        if (comercio.horarios) {
          for (const horario of comercio.horarios) {
            insertHorario.executeSync({
              $comercioId: comercio.id,
              $dia: horario.dia,
              $abre: horario.abre,
              $cierra: horario.cierra
            });
          }
        }
      }
      insertComercio.finalizeSync();
      insertHorario.finalizeSync();
    });
    console.log(`Se guardaron ${comercios.length} comercios offline.`);
  } catch (error) {
    console.error("Error guardando en SQLite:", error);
  }
}