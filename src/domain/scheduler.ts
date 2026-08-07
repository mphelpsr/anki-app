export type Grade = 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy

export interface CardScheduleState {
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
}

export interface ScheduleResult extends CardScheduleState {
  nextDueAt: number;
}

const MINUTE_MS = 60 * 1000;
const DAY_MINUTES = 24 * 60;

const MIN_EASE_FACTOR = 1.3;
const AGAIN_STEP_MINUTES = 1;
const HARD_STEP_MINUTES = 10;
const GOOD_GRADUATION_MINUTES = 1 * DAY_MINUTES;
const EASY_GRADUATION_MINUTES = 4 * DAY_MINUTES;

// Multiplicadores da fase graduada: Hard usa um multiplicador fixo e
// conservador (não o fator de facilidade, para garantir Hard < Good de
// forma robusta); Good usa o fator de facilidade puro (SM-2 clássico);
// Easy aplica um bônus sobre o fator de facilidade.
const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_INTERVAL_BONUS = 1.3;

/**
 * Agendador de repetição espaçada em duas fases (ver
 * specs/001-flashcard-study-loop/contracts/scheduler-contract.md):
 * cartas com repetitions === 0 estão em aprendizagem (passos curtos em
 * minutos); repetitions >= 1 estão graduadas e crescem em dias via SM-2.
 * Função pura, sem I/O, sem leitura de relógio além do `now` injetado.
 */
export function scheduleNextReview(current: CardScheduleState, grade: Grade, now: number): ScheduleResult {
  const isLearning = current.repetitions === 0;

  if (grade === 0) {
    return {
      repetitions: 0,
      easeFactor: clampEase(current.easeFactor - 0.2),
      intervalMinutes: AGAIN_STEP_MINUTES,
      nextDueAt: now + AGAIN_STEP_MINUTES * MINUTE_MS,
    };
  }

  if (isLearning) {
    return scheduleFromLearning(current, grade, now);
  }

  return scheduleFromGraduated(current, grade, now);
}

function scheduleFromLearning(current: CardScheduleState, grade: Grade, now: number): ScheduleResult {
  if (grade === 1) {
    const intervalMinutes = HARD_STEP_MINUTES;
    return {
      repetitions: 0,
      easeFactor: clampEase(current.easeFactor - 0.15),
      intervalMinutes,
      nextDueAt: now + intervalMinutes * MINUTE_MS,
    };
  }

  const intervalMinutes = grade === 3 ? EASY_GRADUATION_MINUTES : GOOD_GRADUATION_MINUTES;
  const easeFactor = grade === 3 ? current.easeFactor + 0.15 : current.easeFactor;

  return {
    repetitions: 1,
    easeFactor: clampEase(easeFactor),
    intervalMinutes,
    nextDueAt: now + intervalMinutes * MINUTE_MS,
  };
}

function scheduleFromGraduated(current: CardScheduleState, grade: Grade, now: number): ScheduleResult {
  const currentIntervalDays = current.intervalMinutes / DAY_MINUTES;
  const multiplier = reviewMultiplier(grade, current.easeFactor);
  const nextIntervalDays = Math.max(1, Math.round(currentIntervalDays * multiplier));
  const nextIntervalMinutes = nextIntervalDays * DAY_MINUTES;

  let easeFactor = current.easeFactor;
  if (grade === 1) easeFactor -= 0.15;
  else if (grade === 3) easeFactor += 0.15;

  return {
    repetitions: current.repetitions + 1,
    easeFactor: clampEase(easeFactor),
    intervalMinutes: nextIntervalMinutes,
    nextDueAt: now + nextIntervalMinutes * MINUTE_MS,
  };
}

/** Multiplicador aplicado ao intervalo atual (em dias) na fase graduada. */
function reviewMultiplier(grade: Grade, easeFactor: number): number {
  if (grade === 1) return HARD_INTERVAL_MULTIPLIER;
  if (grade === 3) return easeFactor * EASY_INTERVAL_BONUS;
  return easeFactor; // grade === 2 (Good)
}

function clampEase(easeFactor: number): number {
  return Math.max(MIN_EASE_FACTOR, easeFactor);
}
