/**
 * Schema SQLite (Deck / Card / Review — ver
 * specs/001-flashcard-study-loop/data-model.md). Mantido como uma
 * constante de string em vez de um arquivo `.sql` porque o Metro não
 * empacota texto `.sql` bruto sem um transformer customizado, e
 * configurar um só para três `CREATE TABLE` não se justifica (ver
 * research.md → Camada de persistência).
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS Deck (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  source_level TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Card (
  id TEXT PRIMARY KEY NOT NULL,
  deck_id TEXT NOT NULL REFERENCES Deck(id),
  word TEXT NOT NULL,
  sentence_before TEXT NOT NULL,
  sentence_after TEXT NOT NULL,
  translation_before TEXT NOT NULL,
  translated_word TEXT NOT NULL,
  translation_after TEXT NOT NULL,
  emoji TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_minutes INTEGER NOT NULL DEFAULT 0,
  next_due_at INTEGER NOT NULL,
  last_reviewed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_card_deck_due ON Card (deck_id, next_due_at);

CREATE TABLE IF NOT EXISTS Review (
  id TEXT PRIMARY KEY NOT NULL,
  card_id TEXT NOT NULL REFERENCES Card(id),
  grade INTEGER NOT NULL,
  reviewed_at INTEGER NOT NULL,
  interval_before INTEGER NOT NULL,
  interval_after INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_card ON Review (card_id);
`;
