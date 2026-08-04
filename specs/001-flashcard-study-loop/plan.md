# Implementation Plan: Flashcard Study Loop (MVP)

**Branch**: `001-flashcard-study-loop` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-flashcard-study-loop/spec.md`

## Summary

Build the core study loop: a learner opens the app, sees deck(s) seeded from
Oxford 3000/5000 word lists with due counts, studies due cards one at a time
(reveal answer → grade recall), and each grade reschedules the card via a
spaced-repetition algorithm (SM-2) whose interval visibly grows with
consecutive good grades and resets on poor ones. Everything runs fully
offline against an on-device SQLite database; content is prepared ahead of
time by a separate, non-runtime ingestion pipeline and shipped as a
versioned seed dataset.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 22 for tooling/pipeline scripts

**Primary Dependencies**: React Native + Expo (managed workflow), `expo-router` for navigation, `expo-sqlite` for on-device persistence

**Storage**: SQLite on-device via `expo-sqlite` (single local database file; no remote database for MVP)

**Testing**: Jest + `@testing-library/react-native` for app code; plain Jest (no RN dependency) for the pure scheduler module and the content-ingestion pipeline

**Target Platform**: iOS and Android via Expo (single React Native codebase); Expo Go / EAS build for device testing

**Project Type**: Mobile app — single Expo project (no separate backend/API; content pipeline is a standalone Node script, not a runtime service)

**Performance Goals**: Study screen answer reveal and grade-to-next-card transition each render in under 100ms perceived latency on a mid-range device; app cold start to first due card under 2s

**Constraints**: Fully offline-capable (Constitution Principle I) — no network call is on the critical path for opening the app, starting a session, grading a card, or seeing the next due date; scheduler MUST be a pure, framework-agnostic module (Constitution: Technology & Data Constraints)

**Scale/Scope**: Single local learner, a handful of decks (one per Oxford CEFR band, e.g. A1-A2/B1/B2), on the order of 3,000-5,000 cards total across all decks — comfortably within SQLite's capability on-device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Offline-First, Local Ownership | SQLite is the sole source of truth; no network calls in the study/grade/reschedule path | PASS |
| II. Spaced Repetition Is the Core Loop | This entire feature *is* the core loop; no other feature is being built before it | PASS |
| III. Test-First for Domain Logic | Scheduler module and repositories are planned with tests-first (see Phase 1 data-model + tasks); screens get one smoke test per flow | PASS (enforced at task-writing time) |
| IV. Traceable, License-Respecting Content Pipeline | Seed dataset is produced by a separate `content-pipeline/` script recording source/date/level; real Oxford material is gated on `content/SOURCES.md` confirming license terms — until then the app ships with a small sample/placeholder dataset of the same shape | PASS (with explicit placeholder-first fallback) |
| V. MVP Discipline | No accounts, sync, custom decks, or multi-deck combined sessions in this plan — matches spec Assumptions | PASS |

No violations to justify; Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-study-loop/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/                          # expo-router file-based routes (screens only, thin)
├── _layout.tsx
├── index.tsx                 # Deck list (User Story 2)
└── study/
    └── [deckId].tsx          # Study session screen (User Story 1 + 3)

src/
├── domain/
│   ├── scheduler.ts          # Pure SM-2 scheduling function (no RN/Expo imports)
│   ├── scheduler.types.ts    # Grade, CardScheduleState, ScheduleResult types
│   └── deck.ts                # Due-card selection / session-ordering logic
├── data/
│   ├── db.ts                  # expo-sqlite connection + migrations
│   ├── schema.sql             # Deck / Card / Review tables
│   └── repositories/
│       ├── deckRepository.ts
│       ├── cardRepository.ts
│       └── reviewRepository.ts
├── features/
│   ├── deckList/               # Deck list view-model + components
│   └── study/                  # Study session view-model + components (card flip, grade buttons)
└── content/
    └── seed/                   # Versioned JSON seed dataset(s) consumed at first run
        └── oxford-3000-a1-a2.sample.json

content-pipeline/               # Standalone Node/TS script, NOT part of the mobile runtime
├── ingest-oxford.ts            # Source word list → versioned seed JSON
├── sources/                    # Raw source material (gitignored until license confirmed)
└── SOURCES.md                  # Per Constitution Principle IV: source, date, level, license status

tests/
├── unit/
│   ├── scheduler.test.ts       # Story 3: interval growth/shrink, first-review behavior
│   └── deck.test.ts            # Due-card selection edge cases
├── integration/
│   ├── study-session.test.ts   # Story 1: full session flow against a seeded in-memory DB
│   └── deck-list.test.ts       # Story 2: due counts, empty-deck states
└── content-pipeline/
    └── ingest-oxford.test.ts   # Pipeline output shape/versioning
```

**Structure Decision**: Single Expo project at the repo root (Project Type:
mobile-app, no backend). The scheduler and due-card selection logic live in
`src/domain/` as plain TypeScript with zero React Native imports, per the
constitution's testability/portability constraint — they are unit-tested
directly with Jest, independent of the RN test renderer. Content ingestion
is a separate `content-pipeline/` Node script (not bundled into the app
runtime); its output is a static JSON file the app reads at first run,
keeping Principle IV's traceability (source/date/level per dataset) outside
the mobile codebase entirely.

## Complexity Tracking

*No Constitution Check violations — table intentionally empty.*
