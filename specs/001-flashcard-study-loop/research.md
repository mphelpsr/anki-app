# Phase 0 Research: Flashcard Study Loop (MVP)

## Scheduling algorithm

**Decision**: Implement SM-2 (SuperMemo 2) with the standard four-grade
mapping used by most modern SRS apps (including the benchmark):

- Grade 0 "did not recall" → reset repetitions to 0, interval to 1 day, drop
  ease factor by 0.20 (floor 1.30).
- Grade 1 "recalled with difficulty" → interval grows slowly, ease factor
  drops by 0.15.
- Grade 2 "recalled" → standard SM-2 growth (interval × ease factor), ease
  unchanged.
- Grade 3 "recalled easily" → standard SM-2 growth, ease factor increases by
  0.15.

First two successful repetitions use fixed intervals (1 day, then 6 days)
before the ease-factor multiplier takes over, per original SM-2.

**Rationale**: SM-2 is simple enough to implement as a small pure function,
well-documented, produces the exact "shorter on fail / longer on consecutive
success" behavior the spec's Story 3 and SC-003/SC-004 require, and is close
enough to the benchmark's own scheduler that a learner's intuition about
interval growth will transfer.

**Alternatives considered**: FSRS (newer, ML-fit algorithm — more accurate
long-term but higher implementation/testing complexity, deferred until the
MVP loop is validated); a flat "double the interval" naive scheme (rejected
— fails SC-004's ease-based growth expectation and doesn't differentiate
"recalled" vs "recalled easily").

## Persistence layer

**Decision**: `expo-sqlite` directly (its Promise-based / `useSQLiteContext`
API), with hand-written SQL migrations in `src/data/schema.sql`, no ORM.

**Rationale**: The MVP's schema is three small tables (Deck, Card, Review).
An ORM (Drizzle, WatermelonDB) adds a dependency and a learning-curve cost
that isn't justified at this scale (Constitution Principle V: MVP
discipline / YAGNI). `expo-sqlite` is officially supported by Expo, works
fully offline, and is straightforward to unit-test by pointing repositories
at an in-memory/temp database file in Jest.

**Alternatives considered**: WatermelonDB (built for sync — premature for a
no-backend MVP); AsyncStorage/plain JSON file (rejected — no query
capability for "cards due now", would require loading/scanning the whole
dataset into memory every session).

## Navigation

**Decision**: `expo-router` (file-based routing) with two routes for this
feature: `/` (deck list) and `/study/[deckId]` (study session).

**Rationale**: Expo's recommended default for new Expo projects, minimal
boilerplate for a two-screen MVP, and leaves room to add more routes
(stats, settings) later without restructuring.

**Alternatives considered**: React Navigation configured manually
(equivalent capability, more setup code for no MVP benefit).

## Content ingestion pipeline

**Decision**: A standalone Node/TypeScript script
(`content-pipeline/ingest-oxford.ts`) that reads a source word list and
writes a versioned JSON seed file under `src/content/seed/`. Until Oxford
source material's license/usage terms are confirmed and recorded in
`content-pipeline/SOURCES.md` (Constitution Principle IV), the pipeline
ships with a small hand-authored **sample** dataset of the same shape (~20
words) so the app is fully demoable and testable without depending on
unresolved licensing.

**Rationale**: Decouples "does the study loop work" (testable today) from
"is the exact Oxford 3000/5000 content cleared for bundling" (a licensing
question outside engineering). Keeps the constitution's traceability
requirement enforceable via a single script and a single sources ledger,
rather than ad-hoc content edits.

**Alternatives considered**: Parsing Oxford PDFs directly on-device at
runtime (rejected — violates the "ingestion does not run inside the mobile
runtime" constraint, and PDF parsing is unnecessary complexity for a
one-time build-time step); hand-typing all cards directly into the app
(rejected — not traceable to a source, fails Principle IV).

## Testing strategy

**Decision**: Jest as the single test runner for everything. `src/domain/`
(scheduler, due-card selection) is tested with plain Jest, no RN
dependencies — fast, framework-agnostic. `src/data/` repositories are
tested against a real (temp-file) SQLite DB via `expo-sqlite`'s Node-testable
API. Screens get one `@testing-library/react-native` smoke test per user
story (start session → grade a card → see next card; view deck list → see
due count).

**Rationale**: Matches Constitution Principle III (test-first for domain
logic, at least one integration test per user-facing flow) with a single
toolchain, avoiding the maintenance cost of mixing test runners.

**Alternatives considered**: Detox/Maestro E2E on a simulator (valuable
later for full-app regression, deferred — MVP discipline: not needed to
validate the three user stories in this feature).

## Open questions resolved

All `NEEDS CLARIFICATION` items from the Technical Context have been
resolved above; none remain.
