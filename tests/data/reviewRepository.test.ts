import { SCHEMA_SQL } from '../../src/data/schema';
import { getAllCards } from '../../src/data/repositories/cardRepository';
import { recordReview } from '../../src/data/repositories/reviewRepository';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

async function createDbWithOneCard() {
  const db = createNodeSqliteDatabase();
  await db.execAsync(SCHEMA_SQL);
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $now)', {
    $id: 'deck-1',
    $name: 'Test Deck',
    $level: 'A2',
    $now: Date.now(),
  });
  await db.runAsync(
    `INSERT INTO Card (
      id, deck_id, word, sentence_before, sentence_after,
      translation_before, translated_word, translation_after, emoji,
      source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
    ) VALUES (
      'card-1', 'deck-1', 'journey', 'Our ', ' was long.',
      'Nossa ', 'jornada', ' foi longa.', '🏔️',
      'test#journey', 0, 2.5, 0, $now, NULL
    )`,
    { $now: Date.now() },
  );
  return db;
}

describe('recordReview — História de Usuário 3 (agendamento persistido de ponta a ponta)', () => {
  test('atualiza o Card e retorna seu novo estado', async () => {
    const db = await createDbWithOneCard();
    const now = Date.parse('2026-08-08T12:00:00Z');

    const updated = await recordReview(db, 'card-1', 2, now); // Good

    expect(updated.repetitions).toBe(1);
    expect(updated.intervalMinutes).toBe(24 * 60); // gradua com 1 dia
    expect(updated.nextDueAt).toBe(now + 24 * 60 * 60_000);

    const [persisted] = await getAllCards(db, 'deck-1');
    expect(persisted.repetitions).toBe(1);
    expect(persisted.intervalMinutes).toBe(24 * 60);
  });

  test('insere uma linha de Review append-only com intervalBefore/intervalAfter', async () => {
    const db = await createDbWithOneCard();
    const now = Date.parse('2026-08-08T12:00:00Z');

    await recordReview(db, 'card-1', 2, now);

    const reviews = await db.getAllAsync<{
      card_id: string;
      grade: number;
      interval_before: number;
      interval_after: number;
    }>('SELECT * FROM Review');

    expect(reviews).toHaveLength(1);
    expect(reviews[0].card_id).toBe('card-1');
    expect(reviews[0].grade).toBe(2);
    expect(reviews[0].interval_before).toBe(0);
    expect(reviews[0].interval_after).toBe(24 * 60);
  });

  test('intervalo cresce estritamente ao longo de revisões "Good" consecutivas, persistido a cada passo (SC-004)', async () => {
    const db = await createDbWithOneCard();
    let now = Date.parse('2026-08-08T12:00:00Z');
    const intervals: number[] = [];

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const updated = await recordReview(db, 'card-1', 2, now);
      intervals.push(updated.intervalMinutes);
      now += 1000;
    }

    for (let i = 1; i < intervals.length; i += 1) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }

    const reviews = await db.getAllAsync('SELECT * FROM Review');
    expect(reviews).toHaveLength(5);
  });

  test('Again sempre agenda a carta em menos de 2 minutos, mesmo já graduada', async () => {
    const db = await createDbWithOneCard();
    const now = Date.parse('2026-08-08T12:00:00Z');

    await recordReview(db, 'card-1', 3, now); // Easy: gradua
    const lapsed = await recordReview(db, 'card-1', 0, now + 1000); // Again: lapso

    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.nextDueAt).toBeLessThan(now + 1000 + 2 * 60_000);
  });
});
