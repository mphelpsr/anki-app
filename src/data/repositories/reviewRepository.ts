import { scheduleNextReview, type Grade } from '../../domain/scheduler';
import type { Database } from '../Database';
import { generateId } from '../id';
import { applyGrade, getCardById, type CardRow } from './cardRepository';

/**
 * Avalia uma carta: calcula o próximo estado via `scheduleNextReview`,
 * persiste o novo estado no Card e insere uma linha de Review
 * append-only com `intervalBefore`/`intervalAfter` (ver
 * specs/001-flashcard-study-loop/data-model.md). Retorna o Card com seu
 * novo estado para a UI atualizar sem precisar reconsultar o banco.
 */
export async function recordReview(db: Database, cardId: string, grade: Grade, now: number): Promise<CardRow> {
  const card = await getCardById(db, cardId);
  if (!card) {
    throw new Error(`Card not found: ${cardId}`);
  }

  const result = scheduleNextReview(card, grade, now);

  await applyGrade(db, cardId, result, now);

  await db.runAsync(
    `INSERT INTO Review (id, card_id, grade, reviewed_at, interval_before, interval_after)
     VALUES ($id, $cardId, $grade, $now, $intervalBefore, $intervalAfter)`,
    {
      $id: generateId('review'),
      $cardId: cardId,
      $grade: grade,
      $now: now,
      $intervalBefore: card.intervalMinutes,
      $intervalAfter: result.intervalMinutes,
    },
  );

  return { ...card, ...result, lastReviewedAt: now };
}
