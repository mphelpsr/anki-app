import { SCHEMA_SQL } from '../../src/data/schema';
import type { Database } from '../../src/data/Database';

export interface FixtureCard {
  id: string;
  word: string;
  translatedWord: string;
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
  nextDueAt: number;
}

const DAY_MINUTES = 24 * 60;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Fixture de teste equivalente ao antigo `src/mocks/studyQueue.ts`: 4
 * cartas do nível A2, todas devidas (para preservar a semântica dos
 * testes de UI anteriores à persistência real), com uma mistura de
 * estados de domínio (2 dominadas, 2 não) para exercitar o progresso de
 * nível (003) de forma determinística.
 */
export const FIXTURE_CARDS: FixtureCard[] = [
  {
    id: 'card-request',
    word: 'requests',
    translatedWord: 'pedidos',
    repetitions: 4,
    easeFactor: 2.6,
    intervalMinutes: 30 * DAY_MINUTES, // dominada
    nextDueAt: Date.now() - HOUR_MS,
  },
  {
    id: 'card-journey',
    word: 'journey',
    translatedWord: 'jornada',
    repetitions: 1,
    easeFactor: 2.3,
    intervalMinutes: 3 * DAY_MINUTES, // não dominada
    nextDueAt: Date.now() - HOUR_MS,
  },
  {
    id: 'card-harvest',
    word: 'harvest',
    translatedWord: 'colheita',
    repetitions: 0,
    easeFactor: 2.5,
    intervalMinutes: 0, // nova, não dominada
    nextDueAt: Date.now() - HOUR_MS,
  },
  {
    id: 'card-lecture',
    word: 'lecture',
    translatedWord: 'palestra',
    repetitions: 3,
    easeFactor: 2.5,
    intervalMinutes: 21 * DAY_MINUTES, // dominada
    nextDueAt: Date.now() - HOUR_MS,
  },
];

export const FIXTURE_DECK_ID = 'deck-fixture-a2';

/** Cria um banco de teste (node:sqlite) já semeado com `FIXTURE_CARDS`. */
export async function seedFixtureDatabase(db: Database): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $now)', {
    $id: FIXTURE_DECK_ID,
    $name: 'Oxford 3000 — A2 (teste)',
    $level: 'A2',
    $now: Date.now(),
  });

  for (const card of FIXTURE_CARDS) {
    await db.runAsync(
      `INSERT INTO Card (
        id, deck_id, word, sentence_before, sentence_after,
        translation_before, translated_word, translation_after, emoji,
        source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
      ) VALUES (
        $id, $deckId, $word, $sentenceBefore, $sentenceAfter,
        $translationBefore, $translatedWord, $translationAfter, $emoji,
        $sourceRef, $repetitions, $easeFactor, $intervalMinutes, $nextDueAt, $now
      )`,
      {
        $id: card.id,
        $deckId: FIXTURE_DECK_ID,
        $word: card.word,
        $sentenceBefore: `We listened to all the `,
        $sentenceAfter: ` from our guests.`,
        $translationBefore: `Ouvimos todos os `,
        $translatedWord: card.translatedWord,
        $translationAfter: ` dos nossos hóspedes.`,
        $emoji: '📘',
        $sourceRef: `test#${card.word}`,
        $repetitions: card.repetitions,
        $easeFactor: card.easeFactor,
        $intervalMinutes: card.intervalMinutes,
        $nextDueAt: card.nextDueAt,
        $now: Date.now(),
      },
    );
  }
}
