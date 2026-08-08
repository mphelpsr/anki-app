import type { CefrLevel, MasteryCard } from '../../domain/mastery';
import type { Database } from '../Database';

export interface DeckRow {
  id: string;
  name: string;
  sourceLevel: CefrLevel;
}

/**
 * Retorna o primeiro (único, nesta etapa — ver plan.md) deck semeado.
 * A lista de decks (US2) ainda não existe; esta função dá à tela de
 * estudo o deck a carregar sem precisar de uma tela de seleção.
 */
export async function getFirstDeck(db: Database): Promise<DeckRow | null> {
  const row = await db.getFirstAsync<{ id: string; name: string; source_level: string }>(
    'SELECT id, name, source_level FROM Deck ORDER BY created_at LIMIT 1',
  );
  if (!row) return null;
  return { id: row.id, name: row.name, sourceLevel: row.source_level as CefrLevel };
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
