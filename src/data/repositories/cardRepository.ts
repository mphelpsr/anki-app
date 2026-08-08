import type { Database } from '../Database';
import type { ScheduleResult } from '../../domain/scheduler';

export interface CardRow {
  id: string;
  deckId: string;
  word: string;
  sentenceBefore: string;
  sentenceAfter: string;
  translationBefore: string;
  translatedWord: string;
  translationAfter: string;
  emoji: string;
  sourceRef: string;
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
  nextDueAt: number;
  lastReviewedAt: number | null;
}

interface RawCardRow {
  id: string;
  deck_id: string;
  word: string;
  sentence_before: string;
  sentence_after: string;
  translation_before: string;
  translated_word: string;
  translation_after: string;
  emoji: string;
  source_ref: string;
  repetitions: number;
  ease_factor: number;
  interval_minutes: number;
  next_due_at: number;
  last_reviewed_at: number | null;
}

function mapRow(row: RawCardRow): CardRow {
  return {
    id: row.id,
    deckId: row.deck_id,
    word: row.word,
    sentenceBefore: row.sentence_before,
    sentenceAfter: row.sentence_after,
    translationBefore: row.translation_before,
    translatedWord: row.translated_word,
    translationAfter: row.translation_after,
    emoji: row.emoji,
    sourceRef: row.source_ref,
    repetitions: row.repetitions,
    easeFactor: row.ease_factor,
    intervalMinutes: row.interval_minutes,
    nextDueAt: row.next_due_at,
    lastReviewedAt: row.last_reviewed_at,
  };
}

/** Cartas do deck com `nextDueAt <= now`, ordenadas por vencimento. */
export async function getDueCards(db: Database, deckId: string, now: number): Promise<CardRow[]> {
  const rows = await db.getAllAsync<RawCardRow>(
    'SELECT * FROM Card WHERE deck_id = $deckId AND next_due_at <= $now ORDER BY next_due_at ASC',
    { $deckId: deckId, $now: now },
  );
  return rows.map(mapRow);
}

/** Todas as cartas do deck, devidas ou não — usadas para progresso/mastery. */
export async function getAllCards(db: Database, deckId: string): Promise<CardRow[]> {
  const rows = await db.getAllAsync<RawCardRow>('SELECT * FROM Card WHERE deck_id = $deckId', { $deckId: deckId });
  return rows.map(mapRow);
}

/** Busca uma única carta pelo id, independente do deck. */
export async function getCardById(db: Database, cardId: string): Promise<CardRow | null> {
  const rows = await db.getAllAsync<RawCardRow>('SELECT * FROM Card WHERE id = $id', { $id: cardId });
  const row = rows[0];
  return row ? mapRow(row) : null;
}

/** Aplica o resultado do agendador a uma carta, registrando o momento da revisão. */
export async function applyGrade(db: Database, cardId: string, result: ScheduleResult, now: number): Promise<void> {
  await db.runAsync(
    `UPDATE Card SET
      repetitions = $repetitions,
      ease_factor = $easeFactor,
      interval_minutes = $intervalMinutes,
      next_due_at = $nextDueAt,
      last_reviewed_at = $now
    WHERE id = $id`,
    {
      $repetitions: result.repetitions,
      $easeFactor: result.easeFactor,
      $intervalMinutes: result.intervalMinutes,
      $nextDueAt: result.nextDueAt,
      $now: now,
      $id: cardId,
    },
  );
}
