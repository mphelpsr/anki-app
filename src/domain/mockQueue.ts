export interface QueueState {
  currentIndex: number;
  total: number;
}

export function canGoPrevious(state: QueueState): boolean {
  return state.currentIndex > 0;
}

export function canGoNext(state: QueueState): boolean {
  return state.currentIndex < state.total - 1;
}

export function goNext(state: QueueState): QueueState {
  if (!canGoNext(state)) return state;
  return { ...state, currentIndex: state.currentIndex + 1 };
}

export function goPrevious(state: QueueState): QueueState {
  if (!canGoPrevious(state)) return state;
  return { ...state, currentIndex: state.currentIndex - 1 };
}
