# Phase 1 Data Model: Flashcard Study Loop (MVP)

## Deck

Represents a named collection of cards studied as a unit (spec: Key
Entities → Deck).

| Field | Type | Notes |
|---|---|---|
| `id` | text (uuid) | Primary key |
| `name` | text | e.g. "Oxford 3000 — A1-A2" |
| `sourceLevel` | text | CEFR band the deck represents (A1, A2, B1, B2...) |
| `createdAt` | integer (unix ms) | Set once, at seed time |

**Derived, not stored**: `dueCount` — computed per Deck by counting Cards
whose `nextDueAt <= now`. Recomputed on read, never persisted, so it can
never drift from the Card table (FR-008, FR-010).

**Validation rules**: `name` non-empty; `sourceLevel` one of the CEFR bands
the content pipeline supports.

## Card

A single study item belonging to a Deck (spec: Key Entities → Card).

| Field | Type | Notes |
|---|---|---|
| `id` | text (uuid) | Primary key |
| `deckId` | text | Foreign key → Deck.id |
| `front` | text | The word (prompt) |
| `back` | text | Definition/example/translation (answer) |
| `sourceRef` | text | Traceability back to the seed dataset entry (Constitution Principle IV) |
| `repetitions` | integer | Count of consecutive successful (grade ≥ 2) reviews; SM-2 state |
| `easeFactor` | real | SM-2 ease factor; starts at 2.5, floor 1.30 |
| `intervalDays` | integer | Current interval in days; starts at 0 (new/never reviewed) |
| `nextDueAt` | integer (unix ms) | When the card becomes due; new cards default to "now" so they're immediately due (spec Edge Case: first launch) |
| `lastReviewedAt` | integer (unix ms), nullable | Null until first review |

**Validation rules**: `front`/`back` non-empty; `easeFactor >= 1.30`;
`intervalDays >= 0`; a Card with `lastReviewedAt = null` MUST have
`repetitions = 0` and `intervalDays = 0`.

**State transitions** (driven by the scheduler in `src/domain/scheduler.ts`,
consuming a Grade and the Card's current schedule fields, producing the next
`repetitions` / `easeFactor` / `intervalDays` / `nextDueAt` — see
[contracts/scheduler-contract.md](./contracts/scheduler-contract.md)):

```text
New (repetitions=0, never reviewed)
   --grade 0--> Learning, interval=1 day, repetitions=0, ease -0.20
   --grade 1--> Learning, interval=1 day, repetitions=1, ease -0.15
   --grade 2/3--> Learning, interval=1 day, repetitions=1, ease unchanged/+0.15

Learning/Review (repetitions>=1)
   --grade 0--> reset: repetitions=0, interval=1 day, ease -0.20 (floor 1.30)
   --grade 1/2/3--> repetitions+1, interval=round(prevInterval * easeFactor)
                     (except repetitions 1→2 uses fixed 6-day interval per SM-2),
                     ease adjusted per grade
```

## Review

A single graded event for a Card (spec: Key Entities → Review).

| Field | Type | Notes |
|---|---|---|
| `id` | text (uuid) | Primary key |
| `cardId` | text | Foreign key → Card.id |
| `grade` | integer (0-3) | The recall grade given |
| `reviewedAt` | integer (unix ms) | When the grade was recorded |
| `intervalBefore` | integer | Card's `intervalDays` immediately before this review (for SC-004 verification / debugging) |
| `intervalAfter` | integer | Card's `intervalDays` immediately after this review |

**Validation rules**: `grade` in `{0,1,2,3}`; a Review is append-only —
never updated or deleted, satisfying FR-004 ("record a graded review") and
giving an audit trail independent of the Card's current (mutable) schedule
state.

**Relationships**: Deck 1—N Card; Card 1—N Review. Deleting a Deck is out of
scope for this feature (no delete requirement in the spec).

## Notes on FR/SC traceability

- FR-011 (persist locally, no network) / FR-013 (recover interrupted
  session): satisfied by Card being the durable source of "still due" state
  — a session never buffers an ungraded card outside the DB, so closing the
  app mid-session simply leaves `nextDueAt` untouched for the ungraded card.
- SC-003/SC-004 (measurable interval differences / growth): directly
  verifiable by reading `Card.intervalDays` and `Review.intervalAfter`
  before/after grading, which is exactly what `tests/unit/scheduler.test.ts`
  asserts against the pure function — no DB needed for that proof.
