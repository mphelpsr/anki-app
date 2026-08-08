import type { Database } from './Database';
import { generateId } from './id';

export interface SeedCard {
  word: string;
  sentenceBefore: string;
  sentenceAfter: string;
  translationBefore: string;
  translatedWord: string;
  translationAfter: string;
  emoji: string;
  sourceRef: string;
}

export interface SeedDeck {
  deckId: string;
  name: string;
  sourceLevel: string;
  source: string;
  extractedAt: string;
  cards: SeedCard[];
}

/**
 * Semeia Deck(s) + Card(s) a partir de datasets no formato de
 * `contracts/seed-content-schema.json`, apenas se o banco ainda não tiver
 * nenhum Deck — idempotente, para que reabrir o app não duplique dados
 * (ver specs/001-flashcard-study-loop/tasks.md, T043/T044).
 */
export async function seedIfEmpty(db: Database, decks: SeedDeck[]): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Deck');
  if (existing && existing.count > 0) {
    return;
  }

  const now = Date.now();

  for (const deck of decks) {
    const deckId = generateId('deck');

    await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $sourceLevel, $now)', {
      $id: deckId,
      $name: deck.name,
      $sourceLevel: deck.sourceLevel,
      $now: now,
    });

    for (const card of deck.cards) {
      await db.runAsync(
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
          $id: generateId('card'),
          $deckId: deckId,
          $word: card.word,
          $sentenceBefore: card.sentenceBefore,
          $sentenceAfter: card.sentenceAfter,
          $translationBefore: card.translationBefore,
          $translatedWord: card.translatedWord,
          $translationAfter: card.translationAfter,
          $emoji: card.emoji,
          $sourceRef: card.sourceRef,
          $now: now,
        },
      );
    }
  }
}
