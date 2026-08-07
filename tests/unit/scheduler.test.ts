import { scheduleNextReview, type CardScheduleState, type Grade } from '../../src/domain/scheduler';

const NOW = Date.parse('2026-08-04T12:00:00Z');
const MINUTE = 60 * 1000;
const DAY_MINUTES = 24 * 60;

const NEW_CARD: CardScheduleState = { repetitions: 0, easeFactor: 2.5, intervalMinutes: 0 };
const GRADUATED_CARD: CardScheduleState = { repetitions: 3, easeFactor: 2.5, intervalMinutes: 15 * DAY_MINUTES };

describe('scheduleNextReview — determinismo', () => {
  test('a mesma entrada sempre produz a mesma saída', () => {
    const first = scheduleNextReview(NEW_CARD, 2, NOW);
    const second = scheduleNextReview(NEW_CARD, 2, NOW);
    expect(second).toEqual(first);
  });
});

describe('scheduleNextReview — Again é sempre curtíssimo prazo (FR-004)', () => {
  test('carta nova: Again agenda em menos de 2 minutos', () => {
    const result = scheduleNextReview(NEW_CARD, 0, NOW);
    expect(result.nextDueAt).toBeLessThan(NOW + 2 * MINUTE);
    expect(result.repetitions).toBe(0);
  });

  test('carta já graduada: Again também agenda em menos de 2 minutos (lapso)', () => {
    const result = scheduleNextReview(GRADUATED_CARD, 0, NOW);
    expect(result.nextDueAt).toBeLessThan(NOW + 2 * MINUTE);
    expect(result.repetitions).toBe(0);
  });
});

describe('scheduleNextReview — ordenação monotônica entre notas (FR-003)', () => {
  test.each([NEW_CARD, GRADUATED_CARD])('Again <= Hard <= Good <= Easy para %o', (card) => {
    const grades: Grade[] = [0, 1, 2, 3];
    const dueTimes = grades.map((grade) => scheduleNextReview(card, grade, NOW).nextDueAt);
    expect(dueTimes[0]).toBeLessThanOrEqual(dueTimes[1]);
    expect(dueTimes[1]).toBeLessThanOrEqual(dueTimes[2]);
    expect(dueTimes[2]).toBeLessThanOrEqual(dueTimes[3]);
  });

  test('carta graduada: Hard, Good e Easy produzem intervalos estritamente diferentes', () => {
    const hard = scheduleNextReview(GRADUATED_CARD, 1, NOW);
    const good = scheduleNextReview(GRADUATED_CARD, 2, NOW);
    const easy = scheduleNextReview(GRADUATED_CARD, 3, NOW);

    expect(hard.intervalMinutes).toBeLessThan(good.intervalMinutes);
    expect(good.intervalMinutes).toBeLessThan(easy.intervalMinutes);
  });
});

describe('scheduleNextReview — graduação a partir de carta nova', () => {
  test('Good gradua com repetitions=1 e intervalo de 1 dia', () => {
    const result = scheduleNextReview(NEW_CARD, 2, NOW);
    expect(result.repetitions).toBe(1);
    expect(result.intervalMinutes).toBe(DAY_MINUTES);
  });

  test('Easy gradua direto com um intervalo maior que o de Good', () => {
    const good = scheduleNextReview(NEW_CARD, 2, NOW);
    const easy = scheduleNextReview(NEW_CARD, 3, NOW);
    expect(easy.repetitions).toBe(1);
    expect(easy.intervalMinutes).toBeGreaterThan(good.intervalMinutes);
  });

  test('Hard não gradua (repetitions permanece 0)', () => {
    const result = scheduleNextReview(NEW_CARD, 1, NOW);
    expect(result.repetitions).toBe(0);
  });
});

describe('scheduleNextReview — crescimento em sucessos consecutivos após graduar (SC-004 de 001)', () => {
  test('intervalo cresce estritamente ao longo de repetições "Good"', () => {
    let state: CardScheduleState = scheduleNextReview(NEW_CARD, 2, NOW); // gradua
    const intervals: number[] = [state.intervalMinutes];

    for (let i = 0; i < 4; i += 1) {
      state = scheduleNextReview(state, 2, NOW);
      intervals.push(state.intervalMinutes);
    }

    for (let i = 1; i < intervals.length; i += 1) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });
});

describe('scheduleNextReview — piso do fator de facilidade', () => {
  test('easeFactor nunca fica abaixo de 1.30, mesmo com Again repetido', () => {
    let state: CardScheduleState = NEW_CARD;
    for (let i = 0; i < 20; i += 1) {
      state = scheduleNextReview(state, 0, NOW);
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

describe('scheduleNextReview — sem efeitos colaterais', () => {
  test('não modifica o objeto de entrada', () => {
    const input: CardScheduleState = { repetitions: 1, easeFactor: 2.5, intervalMinutes: 1440 };
    const snapshot = { ...input };
    scheduleNextReview(input, 2, NOW);
    expect(input).toEqual(snapshot);
  });
});
