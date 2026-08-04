# Contract: Scheduler Module (`src/domain/scheduler.ts`)

The scheduler is the one interface every other layer (repositories, UI)
depends on, and it must stay a pure function per the constitution
(Technology & Data Constraints: "no React/Expo imports"). This contract
fixes its input/output shape so it can be implemented and unit-tested
before anything else in this feature.

## Function signature

```ts
type Grade = 0 | 1 | 2 | 3; // 0=did not recall, 1=difficult, 2=recalled, 3=easy

interface CardScheduleState {
  repetitions: number;   // >= 0
  easeFactor: number;    // >= 1.30
  intervalDays: number;  // >= 0 (0 means never reviewed)
}

interface ScheduleResult {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextDueAt: number; // unix ms, derived from now + intervalDays
}

function scheduleNextReview(
  current: CardScheduleState,
  grade: Grade,
  now: number, // unix ms, injected for testability
): ScheduleResult;
```

## Contract rules (verified by `tests/unit/scheduler.test.ts`)

1. **Determinism**: same `(current, grade, now)` input always produces the
   same output. No hidden randomness, no reads from a clock other than the
   injected `now`.
2. **Grade 0 always shortens**: `scheduleNextReview(current, 0, now)
   .intervalDays` MUST be `1` (or less) regardless of `current.intervalDays`,
   and `repetitions` resets to `0`. Satisfies spec Acceptance Scenario
   (Story 3 #1) and Edge Case (struggling card resets).
3. **Monotonic grade ordering**: for the same `current` and `now`, the
   resulting `nextDueAt` for grade 3 MUST be `>=` grade 2's, which MUST be
   `>=` grade 1's, which MUST be `>=` grade 0's. Satisfies SC-003.
4. **Growth on consecutive success**: calling `scheduleNextReview`
   repeatedly with grade 2 or 3, feeding each call's output back in as the
   next call's `current`, MUST produce a strictly increasing
   `intervalDays` sequence for at least 4 consecutive calls (after the
   initial fixed-interval steps). Satisfies SC-004.
5. **Ease factor floor**: `easeFactor` in the result is never less than
   `1.30`, regardless of how many consecutive grade-0 reviews are applied.
6. **No side effects**: the function does not read or write any database,
   storage, or global state — it only computes from its arguments. This is
   what makes it independently testable and reusable if the persistence
   layer changes.

## Consumers

- `src/data/repositories/reviewRepository.ts` calls `scheduleNextReview`
  with the Card's current state, persists the `ScheduleResult` onto the
  Card row, and appends a Review row (see
  [data-model.md](../data-model.md)).
- `tests/unit/scheduler.test.ts` exercises the function directly with no
  database, per Constitution Principle III (test-first for domain logic).
