# Quickstart: Validate the Flashcard Study Loop (MVP)

Prerequisites: Node 22+, a way to run Expo (Expo Go app on a device/
simulator, or `--web` for a quick check).

## 1. Install and run

```bash
npm install
npx expo start
```

Open on a simulator/device or press `w` for web preview.

## 2. Generate/refresh the seed content (optional — a sample seed ships by default)

```bash
npm run content:ingest
# writes src/content/seed/*.json per contracts/seed-content-schema.json
```

Until `content-pipeline/SOURCES.md` confirms Oxford licensing terms, this
produces the small sample dataset, not the full Oxford 3000/5000 — see
[research.md](./research.md#content-ingestion-pipeline).

## 3. Validate User Story 2 (deck list + due counts)

1. Launch the app. The home screen (deck list) MUST show at least one deck
   with a non-zero due count (fresh install ⇒ all seeded cards are due).
2. Confirm the due count matches the number of cards in the sample seed
   file for that deck.

## 4. Validate User Story 1 (study session)

1. Tap a deck with due cards. The study screen MUST show the first card's
   `front` only.
2. Reveal the answer. The `back` MUST appear along with 4 grade buttons.
3. Grade the card. The next due card MUST appear immediately, and the
   graded card MUST NOT reappear later in the same session.
4. Grade every remaining due card. The screen MUST show a clear "session
   complete" state, and the deck list's due count for that deck MUST now
   read 0.

## 5. Validate User Story 3 (scheduling)

1. Grade a fresh card "did not recall" (grade 0). Inspect its stored
   `nextDueAt` (via `tests/unit/scheduler.test.ts` or a debug log) — it MUST
   be within the same day.
2. Grade a different fresh card "recalled easily" (grade 3). Its
   `nextDueAt` MUST be later than the grade-0 card's.
3. Re-open that same deck the next day (or fast-forward the device clock)
   and grade the grade-3 card "recalled" or "recalled easily" three more
   times in a row. Its `intervalDays` MUST strictly increase each time —
   confirms SC-004.

## 6. Automated verification

```bash
npm test                 # unit + integration (Jest)
npm test -- scheduler    # scheduler contract only (fast, no DB)
```

`tests/unit/scheduler.test.ts` MUST pass before any UI work is considered
done, per Constitution Principle III (test-first for domain logic).

## 7. Offline check (Constitution Principle I / SC-005)

Put the device/simulator in airplane mode and repeat steps 3-5. Every step
MUST work identically with no network connection.
