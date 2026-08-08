import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { Database, RunResult, SQLiteBindParams } from '../../src/data/Database';

/**
 * Adaptador de teste: implementa a interface `Database` sobre o
 * `node:sqlite` do Node 22 (SQLite real, `:memory:`), para que os
 * repositórios sejam testados contra SQL genuíno em vez de um mock (ver
 * specs/001-flashcard-study-loop/research.md → Estratégia de testes).
 */
export function createNodeSqliteDatabase(): Database {
  const db = new DatabaseSync(':memory:');

  // node:sqlite aceita tanto parâmetros nomeados (um único objeto) quanto
  // posicionais (spread). Convertida para `any[]` aqui porque os tipos
  // exatos de sobrecarga de node:sqlite não modelam bem essa união — este
  // arquivo é suporte de teste, não código de produção.
  function toBindArgs(params?: SQLiteBindParams): SQLInputValue[] {
    if (params === undefined) return [];
    return (Array.isArray(params) ? params : [params]) as SQLInputValue[];
  }

  return {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params) {
      const statement = db.prepare(source);
      const result = statement.run(...toBindArgs(params));
      const runResult: RunResult = {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      };
      return runResult;
    },
    async getAllAsync<T>(source: string, params?: SQLiteBindParams) {
      const statement = db.prepare(source);
      return statement.all(...toBindArgs(params)) as T[];
    },
    async getFirstAsync<T>(source: string, params?: SQLiteBindParams) {
      const statement = db.prepare(source);
      const row = statement.get(...toBindArgs(params));
      return (row ?? null) as T | null;
    },
  };
}
