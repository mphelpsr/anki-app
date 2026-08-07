import type { CefrLevel } from '../domain/mastery';

export interface StudyCardMock {
  id: string;
  emoji: string;
  sentenceBefore: string;
  word: string;
  sentenceAfter: string;
  translationBefore: string;
  translatedWord: string;
  translationAfter: string;
  cefrLevel: CefrLevel;
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
  nextDueAt: number;
}

/** Nível CEFR estudado nesta fatia (ver Suposições de 003-cefr-progress-counter/spec.md). */
export const CURRENT_LEVEL: CefrLevel = 'A2';

const HOUR = 60 * 60 * 1000;
const DAY_MINUTES = 24 * 60;

/**
 * Fila mock local (Suposições de specs/002-mvp1-card-screen/spec.md,
 * specs/003-cefr-progress-counter/spec.md e
 * specs/004-recall-grading/spec.md): substituída por dados reais do
 * pipeline Oxford + SQLite + histórico de reviews quando
 * 001-flashcard-study-loop for implementada. Os campos de domínio
 * (repetitions/easeFactor/intervalMinutes/nextDueAt) simulam estados de
 * progresso variados e são atualizados em memória a partir de
 * `src/domain/scheduler.ts` conforme o aprendiz avalia cada carta.
 */
export const studyQueue: StudyCardMock[] = [
  {
    id: 'request',
    emoji: '🤝',
    sentenceBefore: 'We listened to all the ',
    word: 'requests',
    sentenceAfter: ' from our guests.',
    translationBefore: 'Ouvimos todos os ',
    translatedWord: 'pedidos',
    translationAfter: ' dos nossos hóspedes.',
    cefrLevel: 'A2',
    repetitions: 4,
    easeFactor: 2.6,
    intervalMinutes: 30 * DAY_MINUTES,
    nextDueAt: Date.now() + 30 * 24 * HOUR,
  },
  {
    id: 'journey',
    emoji: '🏔️',
    sentenceBefore: 'Our ',
    word: 'journey',
    sentenceAfter: ' across the mountains took three days.',
    translationBefore: 'Nossa ',
    translatedWord: 'jornada',
    translationAfter: ' pelas montanhas durou três dias.',
    cefrLevel: 'A2',
    repetitions: 1,
    easeFactor: 2.3,
    intervalMinutes: 3 * DAY_MINUTES,
    nextDueAt: Date.now() - HOUR,
  },
  {
    id: 'harvest',
    emoji: '🌾',
    sentenceBefore: 'The farmers celebrated a great ',
    word: 'harvest',
    sentenceAfter: ' this year.',
    translationBefore: 'Os fazendeiros celebraram uma ótima ',
    translatedWord: 'colheita',
    translationAfter: ' este ano.',
    cefrLevel: 'A2',
    repetitions: 0,
    easeFactor: 2.5,
    intervalMinutes: 0,
    nextDueAt: Date.now() - HOUR,
  },
  {
    id: 'lecture',
    emoji: '📚',
    sentenceBefore: 'The professor gave a fascinating ',
    word: 'lecture',
    sentenceAfter: ' on ancient history.',
    translationBefore: 'O professor deu uma ',
    translatedWord: 'palestra',
    translationAfter: ' fascinante sobre história antiga.',
    cefrLevel: 'A2',
    repetitions: 3,
    easeFactor: 2.5,
    intervalMinutes: 21 * DAY_MINUTES,
    nextDueAt: Date.now() + 21 * 24 * HOUR,
  },
];
