import type { CefrLevel } from '../domain/mastery';

export interface StudyCardMock {
  id: string;
  emoji: string;
  sentenceBefore: string;
  word: string;
  sentenceAfter: string;
  cefrLevel: CefrLevel;
  repetitions: number;
  intervalDays: number;
  nextDueAt: number;
}

/** Nível CEFR estudado nesta fatia (ver Suposições de 003-cefr-progress-counter/spec.md). */
export const CURRENT_LEVEL: CefrLevel = 'A2';

const HOUR = 60 * 60 * 1000;

/**
 * Fila mock local (Suposições de specs/002-mvp1-card-screen/spec.md e
 * specs/003-cefr-progress-counter/spec.md): substituída por dados reais
 * do pipeline Oxford + SQLite + histórico de reviews quando
 * 001-flashcard-study-loop for implementada. Os campos de domínio
 * (repetitions/intervalDays/nextDueAt) simulam estados de progresso
 * variados para tornar o indicador de nível demonstrável.
 */
export const studyQueue: StudyCardMock[] = [
  {
    id: 'request',
    emoji: '🤝',
    sentenceBefore: 'We listened to all the ',
    word: 'requests',
    sentenceAfter: ' from our guests.',
    cefrLevel: 'A2',
    repetitions: 4,
    intervalDays: 30,
    nextDueAt: Date.now() + 30 * 24 * HOUR,
  },
  {
    id: 'journey',
    emoji: '🏔️',
    sentenceBefore: 'Our ',
    word: 'journey',
    sentenceAfter: ' across the mountains took three days.',
    cefrLevel: 'A2',
    repetitions: 1,
    intervalDays: 3,
    nextDueAt: Date.now() - HOUR,
  },
  {
    id: 'harvest',
    emoji: '🌾',
    sentenceBefore: 'The farmers celebrated a great ',
    word: 'harvest',
    sentenceAfter: ' this year.',
    cefrLevel: 'A2',
    repetitions: 0,
    intervalDays: 0,
    nextDueAt: Date.now() - HOUR,
  },
  {
    id: 'lecture',
    emoji: '📚',
    sentenceBefore: 'The professor gave a fascinating ',
    word: 'lecture',
    sentenceAfter: ' on ancient history.',
    cefrLevel: 'A2',
    repetitions: 3,
    intervalDays: 21,
    nextDueAt: Date.now() + 21 * 24 * HOUR,
  },
];
