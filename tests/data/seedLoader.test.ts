import { SCHEMA_SQL } from '../../src/data/schema';
import { seedIfEmpty } from '../../src/data/seedLoader';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';
import sampleSeed from '../../src/content/seed/oxford-3000-a1-a2.sample.json';

async function createSeededTestDb() {
  const db = createNodeSqliteDatabase();
  await db.execAsync(SCHEMA_SQL);
  return db;
}

describe('seedIfEmpty', () => {
  test('semeia o Deck e todos os Cards em um banco vazio', async () => {
    const db = await createSeededTestDb();

    await seedIfEmpty(db, [sampleSeed]);

    const decks = await db.getAllAsync<{ id: string; name: string; source_level: string }>('SELECT * FROM Deck');
    expect(decks).toHaveLength(1);
    expect(decks[0].name).toBe(sampleSeed.name);
    expect(decks[0].source_level).toBe(sampleSeed.sourceLevel);

    const cards = await db.getAllAsync<{ word: string }>('SELECT * FROM Card WHERE deck_id = $deckId', {
      $deckId: decks[0].id,
    });
    expect(cards).toHaveLength(sampleSeed.cards.length);
    expect(cards.map((c) => c.word).sort()).toEqual(sampleSeed.cards.map((c) => c.word).sort());
  });

  test('cartas semeadas nascem novas e imediatamente devidas', async () => {
    const db = await createSeededTestDb();
    const before = Date.now();

    await seedIfEmpty(db, [sampleSeed]);

    const cards = await db.getAllAsync<{
      repetitions: number;
      ease_factor: number;
      interval_minutes: number;
      next_due_at: number;
      last_reviewed_at: number | null;
    }>('SELECT * FROM Card');

    for (const card of cards) {
      expect(card.repetitions).toBe(0);
      expect(card.interval_minutes).toBe(0);
      expect(card.ease_factor).toBeCloseTo(2.5);
      expect(card.last_reviewed_at).toBeNull();
      expect(card.next_due_at).toBeLessThanOrEqual(Date.now());
      expect(card.next_due_at).toBeGreaterThanOrEqual(before - 1000);
    }
  });

  test('é idempotente: rodar duas vezes não duplica decks nem cartas', async () => {
    const db = await createSeededTestDb();

    await seedIfEmpty(db, [sampleSeed]);
    await seedIfEmpty(db, [sampleSeed]);

    const decks = await db.getAllAsync('SELECT * FROM Deck');
    const cards = await db.getAllAsync('SELECT * FROM Card');
    expect(decks).toHaveLength(1);
    expect(cards).toHaveLength(sampleSeed.cards.length);
  });
});
