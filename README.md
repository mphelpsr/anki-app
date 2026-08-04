# AnkiApp-Benchmark

A mobile flashcard app benchmarked against [AnkiApp](https://www.ankiapp.com/),
built spec-first with [GitHub spec-kit](https://github.com/github/spec-kit).
The MVP is a core spaced-repetition study loop, seeded with vocabulary
derived from the Oxford 3000/5000 word lists.

## Status

Spec-kit is set up and the MVP feature is fully specified, planned, and
broken into tasks. No application code has been implemented yet — this repo
currently holds the governance and design artifacts that implementation
will follow.

## Project governance: spec-kit

This repo follows a spec-driven workflow: every feature goes through
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
before code is written, gated by the rules in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md).

Constitution highlights:

- **Offline-first, local ownership** — the app works fully with no network
  connection; there is no backend for the MVP.
- **Spaced repetition is the core loop (non-negotiable)** — the
  show-card → grade → reschedule loop ships before any other feature.
- **Test-first for domain logic** — the scheduling algorithm and content
  pipeline are written test-first; every user-facing flow gets at least one
  integration test.
- **Traceable, license-respecting content pipeline** — Oxford source
  material is only bundled once its license terms are confirmed and
  recorded in `content-pipeline/SOURCES.md`; until then the app ships with
  a placeholder/sample dataset of the same shape.
- **MVP discipline** — no accounts, sync, or custom decks until the core
  loop is proven.

## Current feature: Flashcard Study Loop (MVP)

Spec, plan, and tasks live in
[`specs/001-flashcard-study-loop/`](specs/001-flashcard-study-loop/):

| Artifact | What it covers |
|---|---|
| [`spec.md`](specs/001-flashcard-study-loop/spec.md) | User stories, functional requirements, success criteria (what/why, no implementation detail) |
| [`plan.md`](specs/001-flashcard-study-loop/plan.md) | Tech stack (React Native + Expo, `expo-sqlite`), project structure, constitution compliance check |
| [`research.md`](specs/001-flashcard-study-loop/research.md) | Scheduling algorithm (SM-2), persistence, navigation, and testing decisions |
| [`data-model.md`](specs/001-flashcard-study-loop/data-model.md) | Deck / Card / Review entities and scheduling state transitions |
| [`contracts/`](specs/001-flashcard-study-loop/contracts/) | Scheduler function contract; seed-content JSON schema |
| [`quickstart.md`](specs/001-flashcard-study-loop/quickstart.md) | Manual + automated validation steps once implemented |
| [`tasks.md`](specs/001-flashcard-study-loop/tasks.md) | Dependency-ordered, test-first implementation tasks |

Planned stack: **React Native (Expo) + TypeScript**, on-device **SQLite**
for decks/cards/review history, a pure TypeScript **SM-2** scheduler module,
and a standalone Node ingestion script that turns Oxford word lists into a
versioned seed dataset (not run inside the app itself).

## Working with this repo

- Read a feature's `spec.md` before its `plan.md`, and `plan.md` before
  `tasks.md` — each is generated from the one before it.
- To start a new feature: `/speckit-specify <description>`.
- To validate spec/plan/tasks consistency before implementing:
  `/speckit-analyze`.
- To implement a feature's tasks in order: `/speckit-implement`.
- Amendments to project principles go through `/speckit-constitution`, not
  ad-hoc edits to `constitution.md`.
