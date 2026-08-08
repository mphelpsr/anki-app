import { SCHEMA_SQL } from '../../src/data/schema';
import { getFirstDeck, getCardsForMastery } from '../../src/data/repositories/deckRepository';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function createDbWithDeck() {
  const db = createNodeSqliteDatabase();
  await db.execAsync(SCHEMA_SQL);
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $now)', {
    $id: 'deck-1',
    $name: 'Oxford 3000 — A2',
    $level: 'A2',
    $now: Date.now(),
  });
  await db.runAsync(
    `INSERT INTO Card (
      id, deck_id, word, sentence_before, sentence_after,
      translation_before, translated_word, translation_after, emoji,
      source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
    ) VALUES ('card-1', 'deck-1', 'w', 'b', 'a', 'b', 'w', 'a', '📘', 'ref', 3, 2.5, $mastered, $now, $now)`,
    { $mastered: 21 * 24 * 60, $now: Date.now() },
  );
  await db.runAsync(
    `INSERT INTO Card (
      id, deck_id, word, sentence_before, sentence_after,
      translation_before, translated_word, translation_after, emoji,
      source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
    ) VALUES ('card-2', 'deck-1', 'w2', 'b', 'a', 'b', 'w2', 'a', '📘', 'ref2', 0, 2.5, 0, $now, NULL)`,
    { $now: Date.now() },
  );
  return db;
}

describe('getFirstDeck', () => {
  test('retorna o único deck semeado', async () => {
    const db = await createDbWithDeck();
    const deck = await getFirstDeck(db);
    expect(deck).toMatchObject({ id: 'deck-1', name: 'Oxford 3000 — A2', sourceLevel: 'A2' });
  });

  test('retorna null quando não há deck', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);
    expect(await getFirstDeck(db)).toBeNull();
  });
});

describe('getCardsForMastery', () => {
  test('retorna as cartas do deck com cefrLevel derivado de Deck.source_level', async () => {
    const db = await createDbWithDeck();
    const cards = await getCardsForMastery(db, 'deck-1');

    expect(cards).toHaveLength(2);
    expect(cards.every((c) => c.cefrLevel === 'A2')).toBe(true);
    expect(cards.map((c) => c.repetitions).sort()).toEqual([0, 3]);
  });
});
