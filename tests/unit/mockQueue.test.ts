import {
  canGoNext,
  canGoPrevious,
  goNext,
  goPrevious,
  type QueueState,
} from '../../src/domain/mockQueue';

describe('mockQueue', () => {
  test('canGoPrevious is false on the first card, true otherwise', () => {
    expect(canGoPrevious({ currentIndex: 0, total: 5 })).toBe(false);
    expect(canGoPrevious({ currentIndex: 1, total: 5 })).toBe(true);
  });

  test('canGoNext is false on the last card, true otherwise', () => {
    expect(canGoNext({ currentIndex: 4, total: 5 })).toBe(false);
    expect(canGoNext({ currentIndex: 3, total: 5 })).toBe(true);
  });

  test('goNext advances the index by one', () => {
    const state: QueueState = { currentIndex: 1, total: 5 };
    expect(goNext(state)).toEqual({ currentIndex: 2, total: 5 });
  });

  test('goNext is a no-op on the last card', () => {
    const state: QueueState = { currentIndex: 4, total: 5 };
    expect(goNext(state)).toEqual(state);
  });

  test('goPrevious retreats the index by one', () => {
    const state: QueueState = { currentIndex: 2, total: 5 };
    expect(goPrevious(state)).toEqual({ currentIndex: 1, total: 5 });
  });

  test('goPrevious is a no-op on the first card', () => {
    const state: QueueState = { currentIndex: 0, total: 5 };
    expect(goPrevious(state)).toEqual(state);
  });
});
