export type SQLiteBindParams = unknown[] | Record<string, unknown>;

export interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

/**
 * Subconjunto de `expo-sqlite`'s `SQLiteDatabase` que os repositórios
 * realmente usam (ver specs/001-flashcard-study-loop/research.md →
 * Camada de persistência). Em produção, o objeto retornado por
 * `expo-sqlite`'s `openDatabaseAsync` já satisfaz esta interface
 * estruturalmente — nenhum wrapper é necessário. Em teste, um adaptador
 * sobre `node:sqlite` (tests/support/nodeSqliteDatabase.ts) a implementa
 * contra um mecanismo SQLite real, diferente do de produção, mas com o
 * mesmo comportamento SQL.
 */
export interface Database {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: SQLiteBindParams): Promise<RunResult>;
  getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]>;
  getFirstAsync<T>(source: string, params?: SQLiteBindParams): Promise<T | null>;
}
