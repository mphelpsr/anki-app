import { SCHEMA_SQL } from '../../src/data/schema';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';

describe('SCHEMA_SQL', () => {
  test('cria as tabelas Deck, Card e Review', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);

    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    const names = tables.map((t) => t.name);

    expect(names).toEqual(expect.arrayContaining(['Deck', 'Card', 'Review']));
  });

  test('Deck tem as colunas esperadas', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(Deck)');
    const names = columns.map((c) => c.name);

    expect(names).toEqual(expect.arrayContaining(['id', 'name', 'source_level', 'created_at']));
  });

  test('Card tem as colunas esperadas (frase, tradução, agendamento)', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(Card)');
    const names = columns.map((c) => c.name);

    expect(names).toEqual(
      expect.arrayContaining([
        'id',
        'deck_id',
        'word',
        'sentence_before',
        'sentence_after',
        'translation_before',
        'translated_word',
        'translation_after',
        'emoji',
        'source_ref',
        'repetitions',
        'ease_factor',
        'interval_minutes',
        'next_due_at',
        'last_reviewed_at',
      ]),
    );
  });

  test('Review tem as colunas esperadas', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(Review)');
    const names = columns.map((c) => c.name);

    expect(names).toEqual(
      expect.arrayContaining(['id', 'card_id', 'grade', 'reviewed_at', 'interval_before', 'interval_after']),
    );
  });

  test('é idempotente (usa CREATE TABLE IF NOT EXISTS)', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);
    await expect(db.execAsync(SCHEMA_SQL)).resolves.not.toThrow();
  });

  test('Card.deck_id referencia Deck.id e é possível inserir uma carta válida', async () => {
    const db = createNodeSqliteDatabase();
    await db.execAsync(SCHEMA_SQL);

    await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $now)', {
      $id: 'deck-1',
      $name: 'Oxford 3000 — A2',
      $level: 'A2',
      $now: Date.now(),
    });

    await expect(
      db.runAsync(
        `INSERT INTO Card (
          id, deck_id, word, sentence_before, sentence_after,
          translation_before, translated_word, translation_after, emoji,
          source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
        ) VALUES (
          $id, $deckId, $word, $sentenceBefore, $sentenceAfter,
          $translationBefore, $translatedWord, $translationAfter, $emoji,
          $sourceRef, 0, 2.5, 0, $now, NULL
        )`,
        {
          $id: 'card-1',
          $deckId: 'deck-1',
          $word: 'requests',
          $sentenceBefore: 'We listened to all the ',
          $sentenceAfter: ' from our guests.',
          $translationBefore: 'Ouvimos todos os ',
          $translatedWord: 'pedidos',
          $translationAfter: ' dos nossos hóspedes.',
          $emoji: '🤝',
          $sourceRef: 'oxford-3000-a1-a2#request',
          $now: Date.now(),
        },
      ),
    ).resolves.toBeTruthy();
  });
});
