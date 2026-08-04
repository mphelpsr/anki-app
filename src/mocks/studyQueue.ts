export interface StudyCardMock {
  id: string;
  emoji: string;
  sentenceBefore: string;
  word: string;
  sentenceAfter: string;
}

/**
 * Fila mock local (Suposições de specs/002-mvp1-card-screen/spec.md):
 * substituída por dados reais do pipeline Oxford + SQLite quando
 * 001-flashcard-study-loop for implementada.
 */
export const studyQueue: StudyCardMock[] = [
  {
    id: 'request',
    emoji: '🤝',
    sentenceBefore: 'We listened to all the ',
    word: 'requests',
    sentenceAfter: ' from our guests.',
  },
  {
    id: 'journey',
    emoji: '🏔️',
    sentenceBefore: 'Our ',
    word: 'journey',
    sentenceAfter: ' across the mountains took three days.',
  },
  {
    id: 'harvest',
    emoji: '🌾',
    sentenceBefore: 'The farmers celebrated a great ',
    word: 'harvest',
    sentenceAfter: ' this year.',
  },
  {
    id: 'lecture',
    emoji: '📚',
    sentenceBefore: 'The professor gave a fascinating ',
    word: 'lecture',
    sentenceAfter: ' on ancient history.',
  },
];
