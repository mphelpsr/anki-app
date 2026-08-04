<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Modified principles: n/a (first version)
- Added sections: Core Principles (I-V), Technology & Data Constraints,
  Development Workflow, Governance
- Removed sections: none
- Templates requiring follow-up: none — plan/spec/tasks templates consume
  this file at runtime and need no edits for this ratification.
- Deferred TODOs: none
-->

# AnkiApp-Benchmark Constitution

## Core Principles

### I. Offline-First, Local Ownership
The app MUST be fully usable with no network connection: study sessions,
scheduling, and progress data all read and write to on-device storage first.
Any future sync/backend feature MUST be additive and MUST NOT become a
runtime dependency for the core study loop. Rationale: this mirrors the
benchmark (AnkiApp) and keeps the MVP shippable without backend
infrastructure or account systems.

### II. Spaced Repetition Is the Core Loop (NON-NEGOTIABLE)
The product's reason to exist is the review loop: show a card, capture a
graded response, reschedule the card via a spaced-repetition algorithm
(SM-2 or a documented equivalent). This loop MUST be implemented, tested,
and stable before any other feature (decks browser, statistics, theming,
import/export UI) is built. No feature may alter or bypass the scheduler's
core contract (inputs: card state + grade; output: next interval and due
date) without a constitution amendment.

### III. Test-First for Domain Logic (NON-NEGOTIABLE)
The scheduling algorithm, deck/card data model, and content-ingestion
pipeline (Oxford word-list → card records) MUST have automated tests
written before implementation, following red-green-refactor. UI components
and screens are exempt from strict TDD but MUST have at least one
integration/smoke test per user-facing flow before that flow ships. Untested
scheduling logic is treated as a broken build, not a pending task.

### IV. Traceable, License-Respecting Content Pipeline
All flashcard content sourced from Oxford word lists (e.g. Oxford 3000/5000)
MUST go through a single, versioned ingestion pipeline that records: source
document, extraction date, and word-list level (A1-C1). The pipeline output
is treated as generated data, never hand-edited in place. Before any Oxford
source material is bundled into the app or repository, the license/usage
terms for that exact material MUST be confirmed and recorded in
`content/SOURCES.md`; if terms are unclear, the pipeline ships with a
placeholder/sample dataset instead of the real content until cleared.

### V. MVP Discipline (Simplicity, YAGNI)
Every feature added before the core loop (Principle II) is proven end-to-end
MUST be justified against the MVP scope: browse a deck, study due cards,
grade a response, see the card rescheduled. Accounts, cloud sync, social
features, multiple content sources, and custom deck creation are explicitly
OUT of scope until the MVP loop is validated. Prefer three similar screens
over one premature abstraction; prefer a local JSON/SQLite seed over a
generic plugin system.

## Technology & Data Constraints

- **Client**: React Native with Expo (managed workflow unless a specific
  native module forces a bare-workflow eject), TypeScript strict mode.
- **Local persistence**: an embedded on-device database (SQLite via
  `expo-sqlite` or an ORM built on it) is the source of truth for decks,
  cards, and review history. No remote database is required for the MVP.
- **Scheduling algorithm**: implemented as a pure, framework-agnostic
  TypeScript module with no React/Expo imports, so it is independently
  testable and portable if the client shell changes.
- **Content ingestion**: a separate, scriptable pipeline (Node/TypeScript)
  that turns source word lists into a versioned seed dataset consumed by
  the app at build or first-run time. It does not run inside the mobile
  runtime.
- **No backend service** is introduced for the MVP. If a future feature
  requires one, it is proposed via `/speckit-specify` as its own feature and
  evaluated against Principle I before acceptance.

## Development Workflow

- Features are defined with `/speckit-specify`, planned with `/speckit-plan`,
  and broken down with `/speckit-tasks` before implementation begins.
- Each feature plan MUST state which Core Principle(s) it touches and how it
  stays compliant; a plan that cannot state this is not ready for
  `/speckit-tasks`.
- Pull requests/commits touching the scheduler or the content pipeline MUST
  reference the tests that cover the change.
- Benchmarking against AnkiApp is qualitative, not contractual: use it to
  validate that core flows (deck list → study session → grading → due-date
  update) feel equivalent, not to justify copying UI verbatim.

## Governance

This constitution supersedes ad-hoc practice for this repository. Amendments
are made via `/speckit-constitution`, must state a version bump rationale
(MAJOR/MINOR/PATCH per semantic versioning), and take effect immediately for
new work. Existing in-flight plans are not retroactively invalidated but
should be reconciled at their next revision.

All feature plans (`/speckit-plan`) MUST include a Constitution Check step
that verifies compliance with the Core Principles above; unresolved
violations must be justified in the plan's Complexity Tracking section or
the plan is rejected.

**Version**: 1.0.0 | **Ratified**: 2026-08-04 | **Last Amended**: 2026-08-04
