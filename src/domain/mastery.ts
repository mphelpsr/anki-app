export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface MasteryCard {
  cefrLevel: CefrLevel;
  repetitions: number;
  intervalDays: number;
  nextDueAt: number;
}

/**
 * Limiares provisórios de "dominada" (ver Suposições de
 * specs/003-cefr-progress-counter/spec.md) — ponto de partida de produto,
 * recalibrável quando o agendador SM-2 real (001) estiver em uso.
 */
const MASTERY_MIN_REPETITIONS = 3;
const MASTERY_MIN_INTERVAL_DAYS = 21;

export function isMastered(card: MasteryCard): boolean {
  return card.repetitions >= MASTERY_MIN_REPETITIONS && card.intervalDays >= MASTERY_MIN_INTERVAL_DAYS;
}

/** Percentual (0-100) de cartas do nível dado consideradas dominadas. */
export function levelProgress(cards: MasteryCard[], level: CefrLevel): number {
  const cardsInLevel = cards.filter((card) => card.cefrLevel === level);
  if (cardsInLevel.length === 0) {
    return 0;
  }

  const masteredCount = cardsInLevel.filter(isMastered).length;
  const percentage = Math.round((masteredCount / cardsInLevel.length) * 100);
  return Math.min(100, Math.max(0, percentage));
}

/** Quantidade de cartas do nível dado devidas em `now` ou antes. */
export function dueTodayCount(cards: MasteryCard[], level: CefrLevel, now: number): number {
  return cards.filter((card) => card.cefrLevel === level && card.nextDueAt <= now).length;
}
