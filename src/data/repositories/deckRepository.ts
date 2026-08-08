import type { CefrLevel, MasteryCard } from '../../domain/mastery';
import type { Database } from '../Database';

export interface DeckRow {
  id: string;
  name: string;
  sourceLevel: CefrLevel;
}

/** Busca um deck pelo id (usado pela tela de estudo, escopada a `deckId`). */
export async function getDeckById(db: Database, deckId: string): Promise<DeckRow | null> {
  const row = await db.getFirstAsync<{ id: string; name: string; source_level: string }>(
    'SELECT id, name, source_level FROM Deck WHERE id = $id',
    { $id: deckId },
  );
  if (!row) return null;
  return { id: row.id, name: row.name, sourceLevel: row.source_level as CefrLevel };
}

export interface DeckWithDueCount {
  id: string;
  name: string;
  sourceLevel: CefrLevel;
  totalCount: number;
  dueCount: number;
}

/**
 * Lista todos os decks com a contagem de cards devidos recalculada na
 * hora (FR-008) e a contagem total, que distingue "deck sem nenhum
 * card" de "deck em dia" (FR-010) — `LEFT JOIN` para que um deck sem
 * cards ainda apareça na lista.
 */
export async function listWithDueCounts(db: Database, now: number): Promise<DeckWithDueCount[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    source_level: string;
    total_count: number;
    due_count: number;
  }>(
    `SELECT d.id, d.name, d.source_level,
            COUNT(c.id) AS total_count,
            COALESCE(SUM(CASE WHEN c.next_due_at <= $now THEN 1 ELSE 0 END), 0) AS due_count
     FROM Deck d
     LEFT JOIN Card c ON c.deck_id = d.id
     GROUP BY d.id
     ORDER BY d.created_at`,
    { $now: now },
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sourceLevel: row.source_level as CefrLevel,
    totalCount: row.total_count,
    dueCount: row.due_count,
  }));
}

/**
 * Cartas do deck no formato que `src/domain/mastery.ts` espera —
 * `cefrLevel` vem do Deck (join), não do Card (ver nota em
 * specs/001-flashcard-study-loop/data-model.md).
 */
export async function getCardsForMastery(db: Database, deckId: string): Promise<MasteryCard[]> {
  const rows = await db.getAllAsync<{
    repetitions: number;
    interval_minutes: number;
    next_due_at: number;
    source_level: string;
  }>(
    `SELECT c.repetitions, c.interval_minutes, c.next_due_at, d.source_level
     FROM Card c JOIN Deck d ON d.id = c.deck_id
     WHERE c.deck_id = $deckId`,
    { $deckId: deckId },
  );

  return rows.map((row) => ({
    cefrLevel: row.source_level as CefrLevel,
    repetitions: row.repetitions,
    intervalMinutes: row.interval_minutes,
    nextDueAt: row.next_due_at,
  }));
}
