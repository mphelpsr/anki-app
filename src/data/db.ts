import { openDatabaseAsync } from 'expo-sqlite';
import type { Database } from './Database';
import { SCHEMA_SQL } from './schema';

const DATABASE_NAME = 'ankiapp-benchmark.db';

/**
 * Abre (criando se necessário) o banco SQLite do dispositivo e aplica o
 * schema. O objeto retornado por `expo-sqlite` satisfaz a interface
 * `Database` estruturalmente — nenhum wrapper é necessário aqui (ver
 * specs/001-flashcard-study-loop/research.md → Camada de persistência).
 */
export async function openAppDatabase(databaseName: string = DATABASE_NAME): Promise<Database> {
  const db = await openDatabaseAsync(databaseName);
  await db.execAsync(SCHEMA_SQL);
  return db;
}
