# Feature Specification: Flashcard Study Loop (MVP)

**Feature Branch**: `001-flashcard-study-loop`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "MVP study loop: browse a deck seeded from Oxford 3000/5000 word lists, study due flashcards, grade recall, and have the card rescheduled via spaced repetition"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Study due cards in a session (Priority: P1)

A learner opens the app, starts a study session, and is shown flashcards one
at a time (front: English word, back: definition/translation/example). For
each card they reveal the answer, judge how well they recalled it, and the
app moves to the next due card until none remain.

**Why this priority**: This is the entire reason the app exists. Without a
working study session, there is no product — everything else (deck lists,
stats, settings) is secondary.

**Independent Test**: Seed one deck with a handful of due cards, start a
session, answer through all cards with different recall grades, and confirm
the session ends cleanly with no due cards left to show.

**Acceptance Scenarios**:

1. **Given** a deck with due cards, **When** the learner starts a study
   session, **Then** the first due card is shown with its front side only
   (answer hidden).
2. **Given** a card's front is shown, **When** the learner reveals the
   answer, **Then** the back side (definition/example) is shown along with
   recall-grading options.
3. **Given** the answer is revealed, **When** the learner selects a recall
   grade, **Then** the card is scored, the session advances to the next due
   card (or ends if none remain), and the graded card is not shown again in
   this session.
4. **Given** the last due card has just been graded, **When** the session
   advances, **Then** the learner sees a clear "session complete" state
   instead of an empty or stuck screen.

---

### User Story 2 - See what's due before studying (Priority: P2)

Before committing to a session, a learner wants to see their deck(s) and how
many cards are due now, so they know what they're about to study.

**Why this priority**: Supports the core loop by letting the learner decide
when/what to study, matching the benchmark's deck-list-first navigation, but
the app is still usable end-to-end without it (a single default deck could
auto-start).

**Independent Test**: With a seeded deck containing a known due count, open
the app and verify the displayed due count matches, then start studying from
that screen.

**Acceptance Scenarios**:

1. **Given** the app has one or more seeded decks, **When** the learner opens
   the deck list, **Then** each deck shows its name and current due-card
   count.
2. **Given** a deck has zero due cards, **When** the learner views it,
   **Then** the deck is shown as up to date and studying is disabled or
   clearly a no-op (no crash, no empty session).
3. **Given** a deck with due cards, **When** the learner selects it,
   **Then** User Story 1's study session starts scoped to that deck.

---

### User Story 3 - Recall grade determines next review date (Priority: P1)

After grading a card, the learner's response measurably changes when that
card comes back: a poor grade brings it back sooner (same day or next day),
a good grade pushes it further out, following a spaced-repetition pattern
that lengthens with consecutive correct recalls.

**Why this priority**: This is what separates "flashcards" from a real
spaced-repetition app, and it's the mechanism the whole product benchmarks
against AnkiApp on. It must work correctly from the first release, since
review history compounds over time and cannot be easily "fixed up" later
without corrupting a learner's schedule.

**Independent Test**: Grade the same card with the lowest grade and verify
its next-due date is sooner than grading an equivalent card with the highest
grade; repeat a card through several "good" grades and confirm the interval
between due dates grows each time.

**Acceptance Scenarios**:

1. **Given** a new (never-reviewed) card, **When** the learner grades it as
   "did not recall", **Then** the card's next due time is very soon (within
   the same day).
2. **Given** a new card, **When** the learner grades it as "recalled
   easily", **Then** the card's next due date is set further out than a
   "did not recall" grade would produce.
3. **Given** a card that has already been graded "good" or better on its
   last two reviews, **When** it is graded "good" or better again, **Then**
   its new interval is longer than its previous interval.
4. **Given** a card the learner is actively struggling with (recent low
   grades), **When** it is graded low again, **Then** its interval resets
   toward a short review cycle instead of continuing to grow.

---

### Edge Cases

- What happens when a learner opens the app for the very first time with no
  review history? All seeded cards should be treated as new/due so a first
  session is always possible.
- What happens when a study session is interrupted (app closed/backgrounded
  mid-session) before a card is graded? On return, that card's ungraded
  state must not be lost or double-counted — it should simply still be due.
- How does the system handle a deck with zero cards at all (not just zero
  due)? The learner must see a clear "no cards in this deck" state, distinct
  from "nothing due right now".
- What happens if the learner grades a card faster than the UI can persist
  the previous grade (rapid repeated input)? Grades must be applied in order
  and no grade may be silently dropped.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present due cards one at a time within a study
  session, front side (prompt) first with the back side (answer) hidden
  until revealed.
- **FR-002**: System MUST let the learner reveal a card's back side (answer)
  on demand.
- **FR-003**: System MUST offer a small, fixed set of recall-grade options
  after the answer is revealed (at minimum: "did not recall" and "recalled",
  with intermediate grades for "recalled with difficulty" and "recalled
  easily" to support Story 3's interval growth/shrink behavior).
- **FR-004**: System MUST record a graded review for a card, including which
  grade was given and when.
- **FR-005**: System MUST compute the card's next due date/time from its
  grade and prior review history using a spaced-repetition scheduling rule
  (lower grades shorten/reset the interval, higher grades lengthen it).
- **FR-006**: System MUST NOT show a card again within the same study session
  once it has been graded.
- **FR-007**: System MUST end a study session with a clear "complete" state
  when no due cards remain, rather than showing an empty or blank screen.
- **FR-008**: System MUST list the learner's deck(s) with a per-deck count of
  currently due cards.
- **FR-009**: System MUST treat a deck with zero due cards as "up to date"
  and prevent starting an empty session from it.
- **FR-010**: System MUST distinguish, in the deck view, between a deck that
  has no cards at all and a deck that has cards but none currently due.
- **FR-011**: System MUST persist review results locally so due counts and
  next-due dates are correct the next time the app is opened, with no
  network connection required.
- **FR-012**: System MUST seed at least one deck from an Oxford 3000/5000
  word-list source (word, definition, and an example or usage note per
  card) so a learner has real content to study on first launch.
- **FR-013**: System MUST recover an interrupted, ungraded card as still due
  (not lost, not duplicated) if the app is closed mid-session and reopened.

### Key Entities

- **Deck**: A named collection of cards a learner studies as a unit (e.g.
  one Oxford level such as "Oxford 3000 — A1-A2"). Has a name and a count of
  cards currently due.
- **Card**: A single study item belonging to a deck, with a front (prompt —
  the word), a back (answer — definition/example/translation), and its own
  scheduling state (current interval, next due date, ease/strength derived
  from review history).
- **Review**: A single graded event for a card — which grade was given and
  when — that feeds the scheduling calculation for that card's next due
  date. History of reviews is what makes the interval grow/shrink over time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can go from opening the app to completing their
  first graded card in under 30 seconds, with no account setup required.
- **SC-002**: A learner can study every currently-due card in a deck in one
  uninterrupted session without the app losing, duplicating, or skipping a
  card.
- **SC-003**: Grading a card "did not recall" versus "recalled easily"
  produces a measurably different next-due date in 100% of cases (the lower
  grade is never scheduled later than the higher grade for equivalent review
  history).
- **SC-004**: A card graded "good" or better on consecutive reviews shows a
  strictly increasing interval across at least the first 4 successful
  reviews, matching the expected spaced-repetition growth pattern.
- **SC-005**: The app is fully studyable (start session, grade cards, see
  next-due changes) with the device in airplane mode.
- **SC-006**: On first install, a learner has at least one deck with
  real Oxford-sourced vocabulary ready to study — zero manual content setup
  required.

## Assumptions

- A single local learner profile is assumed for the MVP — no accounts,
  multi-user support, or login. This aligns with the constitution's
  offline-first, no-backend MVP scope.
- The MVP ships with a fixed set of Oxford 3000/5000-derived decks (e.g. by
  CEFR level). Learners cannot create, edit, or import their own decks/cards
  in this feature; that is out of scope until a later feature.
- Recall grading uses a four-level scale (did not recall / recalled with
  difficulty / recalled / recalled easily), matching common spaced-repetition
  UX (including the benchmark app) closely enough to validate Story 3's
  interval behavior, without mandating a specific algorithm implementation.
- "Due" is determined by comparing a card's stored next-due date/time to the
  device's current local time; no server-side clock or timezone sync is
  required for the MVP.
- Study sessions are scoped to one deck at a time for the MVP; a combined
  "study everything due across decks" view is out of scope until requested.
- Exact Oxford source licensing/usage terms are governed by the
  constitution's content-pipeline principle and are validated separately in
  the content-ingestion work, not re-litigated in this spec.
