import { SCHEMA_SQL } from '../../src/data/schema';
import { getAllCards, getDueCards, applyGrade } from '../../src/data/repositories/cardRepository';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function createDbWithDeckAndCards(cardsDue: { id: string; nextDueAt: number }[]) {
  const db = createNodeSqliteDatabase();
  await db.execAsync(SCHEMA_SQL);
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $now)', {
    $id: 'deck-1',
    $name: 'Test Deck',
    $level: 'A2',
    $now: Date.now(),
  });

  for (const card of cardsDue) {
    await db.runAsync(
      `INSERT INTO Card (
        id, deck_id, word, sentence_before, sentence_after,
        translation_before, translated_word, translation_after, emoji,
        source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
      ) VALUES (
        $id, 'deck-1', $word, 'before ', ' after',
        'antes ', $word, ' depois', '📘',
        $sourceRef, 0, 2.5, 0, $nextDueAt, NULL
      )`,
      { $id: card.id, $word: card.id, $sourceRef: `test#${card.id}`, $nextDueAt: card.nextDueAt },
    );
  }

  return db;
}

describe('getDueCards', () => {
  test('retorna apenas cartas com next_due_at <= now, ordenadas', async () => {
    const now = Date.parse('2026-08-08T12:00:00Z');
    const db = await createDbWithDeckAndCards([
      { id: 'past', nextDueAt: now - 1000 },
      { id: 'future', nextDueAt: now + 1000 },
      { id: 'exact', nextDueAt: now },
    ]);

    const due = await getDueCards(db, 'deck-1', now);

    expect(due.map((c) => c.id)).toEqual(['past', 'exact']);
  });

  test('mapeia os campos para camelCase', async () => {
    const now = Date.parse('2026-08-08T12:00:00Z');
    const db = await createDbWithDeckAndCards([{ id: 'card-a', nextDueAt: now - 1000 }]);

    const [card] = await getDueCards(db, 'deck-1', now);

    expect(card).toMatchObject({
      id: 'card-a',
      deckId: 'deck-1',
      word: 'card-a',
      sentenceBefore: 'before ',
      sentenceAfter: ' after',
      translationBefore: 'antes ',
      translatedWord: 'card-a',
      translationAfter: ' depois',
      emoji: '📘',
      repetitions: 0,
      easeFactor: 2.5,
      intervalMinutes: 0,
    });
  });
});

describe('getAllCards', () => {
  test('retorna todas as cartas do deck, devidas ou não', async () => {
    const now = Date.parse('2026-08-08T12:00:00Z');
    const db = await createDbWithDeckAndCards([
      { id: 'past', nextDueAt: now - 1000 },
      { id: 'future', nextDueAt: now + 1000 },
    ]);

    const all = await getAllCards(db, 'deck-1');

    expect(all.map((c) => c.id).sort()).toEqual(['future', 'past']);
  });
});

describe('applyGrade', () => {
  test('atualiza repetitions/ease/interval/nextDueAt/lastReviewedAt da carta', async () => {
    const now = Date.parse('2026-08-08T12:00:00Z');
    const db = await createDbWithDeckAndCards([{ id: 'card-a', nextDueAt: now - 1000 }]);

    await applyGrade(
      db,
      'card-a',
      {
        repetitions: 2,
        easeFactor: 2.6,
        intervalMinutes: 4320,
        nextDueAt: now + 4320 * 60_000,
      },
      now,
    );

    const [updated] = await getAllCards(db, 'deck-1');
    expect(updated.repetitions).toBe(2);
    expect(updated.easeFactor).toBeCloseTo(2.6);
    expect(updated.intervalMinutes).toBe(4320);
    expect(updated.nextDueAt).toBe(now + 4320 * 60_000);
    expect(updated.lastReviewedAt).not.toBeNull();
  });
});
