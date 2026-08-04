---

description: "Task list template for feature implementation"
---

# Tasks: Flashcard Study Loop (MVP)

**Input**: Design documents from `/specs/001-flashcard-study-loop/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included and REQUIRED for domain logic — Constitution Principle III
(Test-First for Domain Logic, NON-NEGOTIABLE) mandates tests before
implementation for the scheduler, data model, and content pipeline. UI
screens get one integration/smoke test per user story.

**Organization**: Tasks are grouped by user story (US1 = Study session /P1,
US2 = Deck list /P2, US3 = Scheduling correctness /P1) to enable independent
implementation and testing of each story, per spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Single Expo project at repo root, per plan.md's Project Structure:
`app/` (routes), `src/` (domain/data/features/content), `content-pipeline/`
(standalone script), `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize the Expo + TypeScript project at repo root (`package.json`, `tsconfig.json` strict mode, `app.json`, `.gitignore` for `node_modules`/`.expo`)
- [ ] T002 [P] Install core dependencies: `expo-router`, `expo-sqlite`, and dev dependencies `jest`, `@testing-library/react-native`, `ts-jest`/`babel-jest` per Expo's Jest preset
- [ ] T003 [P] Configure ESLint + Prettier for TypeScript/React Native in `.eslintrc.js` / `.prettierrc`

**Checkpoint**: `npx expo start` boots an empty app; `npm test` runs (no tests yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story depends on — scheduler,
persistence, and seed content. No user story work starts until this phase
is complete.

**⚠️ CRITICAL**: Per Constitution Principle III, T004 (tests) MUST be
written and MUST fail before T005 (implementation).

- [ ] T004 Write scheduler contract tests in `tests/unit/scheduler.test.ts`, covering every rule in `contracts/scheduler-contract.md` (determinism, grade-0 shortening, monotonic grade ordering, growth on consecutive success, ease-factor floor, no side effects) — MUST fail (no implementation yet)
- [ ] T005 Implement `scheduleNextReview` in `src/domain/scheduler.ts` per `contracts/scheduler-contract.md` and `data-model.md`'s state-transition table, to make T004 pass (depends on T004)
- [ ] T006 [P] Define shared domain types (`Grade`, `CardScheduleState`, `ScheduleResult`) in `src/domain/scheduler.types.ts`
- [ ] T007 [P] Write SQLite schema (Deck, Card, Review tables per `data-model.md`) in `src/data/schema.sql`
- [ ] T008 Implement DB connection + migration runner in `src/data/db.ts` (depends on T007)
- [ ] T009 [P] Author the sample seed dataset (~20 cards, shape per `contracts/seed-content-schema.json`) at `src/content/seed/oxford-3000-a1-a2.sample.json`
- [ ] T010 [P] Create `content-pipeline/SOURCES.md` recording the sample dataset's source, extraction date, and license status, per Constitution Principle IV
- [ ] T011 Implement the first-run seed loader in `src/data/seedLoader.ts` — reads seed JSON files, inserts Deck/Card rows only if the DB is empty (depends on T008, T009)
- [ ] T012 [P] Set up the `expo-router` root layout in `app/_layout.tsx`

**Checkpoint**: Scheduler is implemented and unit-tested in isolation; DB
schema, connection, and first-run seeding work end-to-end (verifiable by
opening the app to a blank screen with a populated DB). User story
implementation can now begin.

---

## Phase 3: User Story 1 - Study due cards in a session (Priority: P1) 🎯 MVP

**Goal**: Learner studies due cards one at a time (reveal → grade → next
card) until the session completes.

**Independent Test**: Seed one deck with a handful of due cards, run
through the full session grading every card, and confirm it ends in a
clear "complete" state with no card repeated or skipped (spec Story 1,
quickstart.md §4).

### Tests for User Story 1

- [ ] T013 [P] [US1] Write integration test for the full study-session flow (start → reveal → grade → next card → session complete) in `tests/integration/study-session.test.ts`, against a seeded test DB — MUST fail before implementation

### Implementation for User Story 1

- [ ] T014 [US1] Implement `CardRepository` due-card query (`getDueCards(deckId, now)`) and `applyGrade` in `src/data/repositories/cardRepository.ts` (depends on T005 scheduler, T008 db)
- [ ] T015 [US1] Implement `ReviewRepository.recordReview` in `src/data/repositories/reviewRepository.ts` — calls the scheduler, updates the Card row, appends a Review row in one transaction (depends on T005, T014)
- [ ] T016 [US1] Implement due-card session ordering logic in `src/domain/deck.ts` (pure function: given due cards + already-graded-this-session ids, return the next card or null)
- [ ] T017 [P] [US1] Build the study-session view-model hook `useStudySession` in `src/features/study/useStudySession.ts`, wrapping T014-T016
- [ ] T018 [P] [US1] Build the card view component (front/back reveal) in `src/features/study/CardView.tsx`
- [ ] T019 [P] [US1] Build the grade-buttons component (4 grades) in `src/features/study/GradeButtons.tsx`
- [ ] T020 [US1] Build the study session screen `app/study/[deckId].tsx`, wiring `useStudySession` + `CardView` + `GradeButtons` (depends on T017, T018, T019)
- [ ] T021 [US1] Implement the "session complete" state and the "deck has no cards at all" empty state in `app/study/[deckId].tsx`, per spec Edge Cases

**Checkpoint**: User Story 1 is fully functional and independently
testable/demoable — `npm test -- study-session` passes and the app can be
studied end-to-end from a single deck.

---

## Phase 4: User Story 2 - See what's due before studying (Priority: P2)

**Goal**: Learner sees deck(s) with due counts before choosing one to study.

**Independent Test**: With a seeded deck of known due count, open the deck
list and confirm the displayed count matches; selecting the deck opens
User Story 1's session scoped to it (spec Story 2, quickstart.md §3).

### Tests for User Story 2

- [ ] T022 [P] [US2] Write integration test for deck list due counts and empty-deck states in `tests/integration/deck-list.test.ts` — MUST fail before implementation

### Implementation for User Story 2

- [ ] T023 [US2] Implement `DeckRepository.listWithDueCounts` in `src/data/repositories/deckRepository.ts` (per data-model.md: due count is derived, never stored)
- [ ] T024 [P] [US2] Build the deck-list view-model hook `useDeckList` in `src/features/deckList/useDeckList.ts`
- [ ] T025 [P] [US2] Build the `DeckListItem` component (name + due count + up-to-date state) in `src/features/deckList/DeckListItem.tsx`
- [ ] T026 [US2] Build the deck list screen `app/index.tsx`, wiring `useDeckList` + `DeckListItem` and navigation to `app/study/[deckId].tsx` (depends on T024, T025)
- [ ] T027 [US2] Implement the "no cards at all" vs. "up to date" distinction in the deck list screen, per spec FR-010

**Checkpoint**: User Stories 1 AND 2 both work independently — a learner
can open the app, see due counts, and study from the deck list.

---

## Phase 5: User Story 3 - Recall grade determines next review date (Priority: P1)

**Goal**: Prove the scheduling behavior end-to-end through the persistence
layer, not just the pure function — grading changes stored next-due dates
correctly and intervals grow/shrink as specified.

**Independent Test**: Grade the same card low vs. high and compare stored
`nextDueAt`; repeat "good" grades on a card and confirm `intervalDays`
strictly increases across reviews (spec Story 3, quickstart.md §5,
SC-003/SC-004).

### Tests for User Story 3

- [ ] T028 [P] [US3] Write unit tests for due-card selection edge cases (new card immediately due, struggling card lands back in the session) in `tests/unit/deck.test.ts` — MUST fail before implementation
- [ ] T029 [P] [US3] Write an integration test that grades a card through several review cycles against a real (temp-file) SQLite DB and asserts `Card.intervalDays` strictly increases across at least 4 consecutive "good" reviews, and that a low grade resets it, in `tests/integration/scheduling-growth.test.ts`

### Implementation for User Story 3

- [ ] T030 [US3] Ensure `ReviewRepository.recordReview` (T015) persists `intervalBefore`/`intervalAfter` on each Review row per `data-model.md`, so growth is auditable from stored data, not just recomputed
- [ ] T031 [US3] Verify and, if needed, adjust `CardRepository.applyGrade` (T014) so the ease-factor floor (1.30) and grade-0 reset are enforced at the repository boundary, not just inside the pure scheduler (defense against future callers bypassing the scheduler)

**Checkpoint**: All three user stories are independently functional. The
core benchmark-against-AnkiApp claim (correct SRS behavior) is verified
both at the unit level (Phase 2) and end-to-end through real persistence
(this phase).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Round out what's needed to run and validate the feature as a
whole, per quickstart.md.

- [ ] T032 [P] Write `content-pipeline/ingest-oxford.ts` (reads a source word list, writes seed JSON per `contracts/seed-content-schema.json`) with a test in `tests/content-pipeline/ingest-oxford.test.ts`
- [ ] T033 [P] Wire `npm run content:ingest` and `npm test` scripts in `package.json`
- [ ] T034 Run `quickstart.md` end-to-end manually (including the airplane-mode/offline check in §7) and fix any gaps found
- [ ] T035 [P] Write a top-level `README.md` summarizing the app, the spec-kit workflow used, and how to run `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories —
  in particular, the scheduler (T004-T005) must be tested and implemented
  before any grading logic (US1, US3) is built.
- **User Stories (Phase 3-5)**: All depend on Foundational completion.
  - US1 (P1) and US2 (P2) are independent of each other and can proceed in
    parallel once Foundational is done.
  - US3 (P1) depends on US1's repository layer (T014, T015) existing, since
    it verifies scheduling behavior through those same repositories rather
    than duplicating them — so build US1 before US3 even though both are
    P1.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- Tests are written first and MUST fail before their corresponding
  implementation tasks (Constitution Principle III).
- Repositories before view-models; view-models before screens.
- Story complete and its checkpoint verified before moving to the next.

### Parallel Opportunities

- T002, T003 (Setup) in parallel.
- T006, T007, T009, T010, T012 (Foundational, distinct files) in parallel
  once T004/T005 land.
- T017, T018, T019 (US1 view-model/components, distinct files) in parallel.
- T024, T025 (US2 view-model/component, distinct files) in parallel.
- T028, T029 (US3 tests, distinct files) in parallel.
- US1 and US2 implementation phases can run in parallel across two
  developers once Foundational is done; US3 should follow US1.

---

## Parallel Example: User Story 1

```bash
# After T014-T016 (repositories/domain) land, these can run together:
Task: "Build useStudySession hook in src/features/study/useStudySession.ts"
Task: "Build CardView component in src/features/study/CardView.tsx"
Task: "Build GradeButtons component in src/features/study/GradeButtons.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (scheduler + DB + seed — CRITICAL).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `tests/integration/study-session.test.ts` and
   quickstart.md §4 manually.
5. This alone is a demoable MVP: one deck, full study loop, real
   scheduling under the hood.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 → validate independently → demoable MVP.
3. Add US2 → validate independently → deck list on top of the same loop.
4. Add US3 → validate independently → scheduling correctness proven
   end-to-end, not just in the pure function.
5. Polish → content pipeline, docs, full quickstart pass.

---

## Notes

- [P] tasks touch different files and have no unmet dependencies.
- Constitution Principle III makes the "write test first" note above
  non-optional for T004, T013, T022, T028, T029, T032 — implementation
  tasks that follow a test task must not start until that test is written
  and failing.
- Commit after each task or logical group, referencing the task ID.
- Avoid scope creep: no accounts, sync, custom decks, or multi-deck
  combined sessions — those are explicitly out of scope per spec.md
  Assumptions and Constitution Principle V.
