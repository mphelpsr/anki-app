import { dueTodayCount, isMastered, levelProgress, type MasteryCard } from '../../src/domain/mastery';

const DAY_MINUTES = 24 * 60;

function card(overrides: Partial<MasteryCard> = {}): MasteryCard {
  return {
    cefrLevel: 'A2',
    repetitions: 0,
    intervalMinutes: 0,
    nextDueAt: Date.now(),
    ...overrides,
  };
}

describe('isMastered', () => {
  test('is false for a new card', () => {
    expect(isMastered(card({ repetitions: 0, intervalMinutes: 0 }))).toBe(false);
  });

  test('is false when repetitions meet the bar but interval does not', () => {
    expect(isMastered(card({ repetitions: 3, intervalMinutes: 10 * DAY_MINUTES }))).toBe(false);
  });

  test('is false when interval meets the bar but repetitions do not', () => {
    expect(isMastered(card({ repetitions: 2, intervalMinutes: 30 * DAY_MINUTES }))).toBe(false);
  });

  test('is true when both thresholds are met', () => {
    expect(isMastered(card({ repetitions: 3, intervalMinutes: 21 * DAY_MINUTES }))).toBe(true);
    expect(isMastered(card({ repetitions: 5, intervalMinutes: 40 * DAY_MINUTES }))).toBe(true);
  });
});

describe('levelProgress', () => {
  test('is 0% when no card in the level is mastered', () => {
    const cards = [
      card({ repetitions: 0, intervalMinutes: 0 }),
      card({ repetitions: 1, intervalMinutes: 2 * DAY_MINUTES }),
    ];
    expect(levelProgress(cards, 'A2')).toBe(0);
  });

  test('is 100% when every card in the level is mastered', () => {
    const cards = [
      card({ repetitions: 3, intervalMinutes: 21 * DAY_MINUTES }),
      card({ repetitions: 4, intervalMinutes: 30 * DAY_MINUTES }),
    ];
    expect(levelProgress(cards, 'A2')).toBe(100);
  });

  test('is a partial percentage otherwise', () => {
    const cards = [
      card({ repetitions: 3, intervalMinutes: 21 * DAY_MINUTES }),
      card({ repetitions: 0, intervalMinutes: 0 }),
      card({ repetitions: 0, intervalMinutes: 0 }),
      card({ repetitions: 0, intervalMinutes: 0 }),
    ];
    expect(levelProgress(cards, 'A2')).toBe(25);
  });

  test('only counts cards belonging to the given level', () => {
    const cards = [
      card({ cefrLevel: 'A2', repetitions: 3, intervalMinutes: 21 * DAY_MINUTES }),
      card({ cefrLevel: 'B1', repetitions: 0, intervalMinutes: 0 }),
    ];
    expect(levelProgress(cards, 'A2')).toBe(100);
  });

  test('never exceeds 100 or goes below 0', () => {
    expect(levelProgress([], 'A2')).toBe(0);
  });
});

describe('dueTodayCount', () => {
  test('counts only cards due at or before now, in the given level', () => {
    const now = Date.parse('2026-08-04T12:00:00Z');
    const cards = [
      card({ cefrLevel: 'A2', nextDueAt: now - 1000 }),
      card({ cefrLevel: 'A2', nextDueAt: now + 1000 }),
      card({ cefrLevel: 'B1', nextDueAt: now - 1000 }),
    ];
    expect(dueTodayCount(cards, 'A2', now)).toBe(1);
  });
});
