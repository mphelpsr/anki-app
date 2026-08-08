import { SCHEMA_SQL } from '../../src/data/schema';
import { getDeckById, getCardsForMastery, listWithDueCounts } from '../../src/data/repositories/deckRepository';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';
import type { Database } from '../../src/data/Database';

async function insertDeck(db: Database, id: string, name: string, sourceLevel: string, createdAt: number) {
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $createdAt)', {
    $id: id,
    $name: name,
    $level: sourceLevel,
    $createdAt: createdAt,
  });
}

async function insertCard(
  db: Database,
  id: string,
  deckId: string,
  opts: { repetitions?: number; nextDueAt: number },
) {
  await db.runAsync(
    `INSERT INTO Card (
      id, deck_id, word, sentence_before, sentence_after,
      translation_before, translated_word, translation_after, emoji,
      source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
    ) VALUES ($id, $deckId, 'w', 'b', 'a', 'b', 'w', 'a', '📘', 'ref', $repetitions, 2.5, 0, $nextDueAt, NULL)`,
    {
      $id: id,
      $deckId: deckId,
      $repetitions: opts.repetitions ?? 0,
      $nextDueAt: opts.nextDueAt,
    },
  );
}

async function createDbWithDeck() {
  const db = createNodeSqliteDatabase();
  await db.execAsync(SCHEMA_SQL);
  const now = Date.now();
  await insertDeck(db, 'deck-1', 'Oxford 3000 — A2', 'A2', now);
  await insertCard(db, 'card-1', 'deck-1', { repetitions: 3, nextDueAt: now });
  await insertCard(db, 'card-2', 'deck-1', { repetitions: 0, nextDueAt: now });
  return db;
}

describe('getDeckById', () => {
  test('retorna o deck pelo id', async () => {
    const db = await createDbWithDeck();
    const deck = await getDeckById(db, 'deck-1');
    expect(deck).toMatchObject({ id: 'deck-1', name: 'Oxford 3000 — A2', sourceLevel: 'A2' });
  });

  test('retorna null para um id desconhecido', async () => {
    const db = await createDbWithDeck();
    expect(await getDeckById(db, 'deck-inexistente')).toBeNull();
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

describe('listWithDueCounts', () => {
  test('conta devidos e total separadamente para um único deck', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);
    const now = Date.now();
    await insertDeck(db, 'deck-1', 'Oxford 3000 — A2', 'A2', now);
    await insertCard(db, 'card-due', 'deck-1', { nextDueAt: now - 1000 });
    await insertCard(db, 'card-not-due', 'deck-1', { nextDueAt: now + 24 * 60 * 60 * 1000 });

    const decks = await listWithDueCounts(db, now);

    expect(decks).toEqual([expect.objectContaining({ id: 'deck-1', totalCount: 2, dueCount: 1 })]);
  });

  test('um deck sem nenhum card aparece com total e devidos zerados (FR-010)', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);
    const now = Date.now();
    await insertDeck(db, 'deck-vazio', 'Deck vazio', 'B1', now);

    const decks = await listWithDueCounts(db, now);

    expect(decks).toEqual([expect.objectContaining({ id: 'deck-vazio', totalCount: 0, dueCount: 0 })]);
  });

  test('múltiplos decks têm contagens independentes, ordenados por criação', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);
    const now = Date.now();
    await insertDeck(db, 'deck-a', 'Deck A', 'A1', now);
    await insertDeck(db, 'deck-b', 'Deck B', 'A2', now + 1000);
    await insertCard(db, 'card-a1', 'deck-a', { nextDueAt: now - 1000 });
    await insertCard(db, 'card-b1', 'deck-b', { nextDueAt: now - 1000 });
    await insertCard(db, 'card-b2', 'deck-b', { nextDueAt: now + 24 * 60 * 60 * 1000 });

    const decks = await listWithDueCounts(db, now);

    expect(decks.map((d) => d.id)).toEqual(['deck-a', 'deck-b']);
    expect(decks[0]).toMatchObject({ totalCount: 1, dueCount: 1 });
    expect(decks[1]).toMatchObject({ totalCount: 2, dueCount: 1 });
  });
});
