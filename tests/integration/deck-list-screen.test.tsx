import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DeckListScreen } from '../../src/features/deckList/DeckListScreen';
import type { Database } from '../../src/data/Database';
import { createNodeSqliteDatabase } from '../support/nodeSqliteDatabase';
import { FIXTURE_DECK_ID, seedFixtureDatabase } from '../support/testDeckFixture';

async function insertDeck(db: Database, id: string, name: string, sourceLevel: string, createdAt: number) {
  await db.runAsync('INSERT INTO Deck (id, name, source_level, created_at) VALUES ($id, $name, $level, $createdAt)', {
    $id: id,
    $name: name,
    $level: sourceLevel,
    $createdAt: createdAt,
  });
}

async function insertCard(db: Database, id: string, deckId: string, nextDueAt: number) {
  await db.runAsync(
    `INSERT INTO Card (
      id, deck_id, word, sentence_before, sentence_after,
      translation_before, translated_word, translation_after, emoji,
      source_ref, repetitions, ease_factor, interval_minutes, next_due_at, last_reviewed_at
    ) VALUES ($id, $deckId, 'w', 'b', 'a', 'b', 'w', 'a', '📘', 'ref', 0, 2.5, 0, $nextDueAt, NULL)`,
    { $id: id, $deckId: deckId, $nextDueAt: nextDueAt },
  );
}

const UP_TO_DATE_DECK_ID = 'deck-em-dia';
const EMPTY_DECK_ID = 'deck-vazio';

/** Semeia o deck fixture (4 devidas) + um deck em dia + um deck vazio. */
async function seedMultiDeckDatabase(): Promise<Database> {
  const db = createNodeSqliteDatabase();
  await seedFixtureDatabase(db);
  const now = Date.now();
  await insertDeck(db, UP_TO_DATE_DECK_ID, 'Oxford 3000 — B1', 'B1', now + 1000);
  await insertCard(db, 'card-em-dia', UP_TO_DATE_DECK_ID, now + 24 * 60 * 60 * 1000);
  await insertDeck(db, EMPTY_DECK_ID, 'Oxford 3000 — B2', 'B2', now + 2000);
  return db;
}

async function renderScreen(onSelectDeck: (deckId: string) => void = jest.fn()) {
  const database = await seedMultiDeckDatabase();
  await render(<DeckListScreen database={database} onSelectDeck={onSelectDeck} />);
  await waitFor(() => {
    expect(screen.queryByTestId('deck-list-loading')).toBeNull();
  });
}

describe('DeckListScreen — mostrar decks e contagens (FR-008)', () => {
  test('mostra uma linha por deck semeado, com nome e contagem de devidos', async () => {
    await renderScreen();

    expect(screen.getByText('Oxford 3000 — A2 (teste)')).toBeTruthy();
    expect(screen.getByText('4 devidas')).toBeTruthy();
    expect(screen.getByText('Oxford 3000 — B1')).toBeTruthy();
    expect(screen.getByText('Oxford 3000 — B2')).toBeTruthy();
  });
});

describe('DeckListScreen — deck em dia é um no-op (FR-009)', () => {
  test('deck com zero devidos mostra "Em dia" e não dispara onSelectDeck ao ser tocado', async () => {
    const onSelectDeck = jest.fn();
    await renderScreen(onSelectDeck);

    expect(screen.getByText('Em dia')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`deck-item-${UP_TO_DATE_DECK_ID}`));

    expect(onSelectDeck).not.toHaveBeenCalled();
  });
});

describe('DeckListScreen — deck sem nenhum card é distinto de "em dia" (FR-010)', () => {
  test('deck vazio mostra um texto diferente de "Em dia" e não dispara onSelectDeck', async () => {
    const onSelectDeck = jest.fn();
    await renderScreen(onSelectDeck);

    expect(screen.getByText('Sem cards ainda')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`deck-item-${EMPTY_DECK_ID}`));

    expect(onSelectDeck).not.toHaveBeenCalled();
  });
});

describe('DeckListScreen — selecionar um deck com pendências inicia a sessão (FR-008)', () => {
  test('tocar num deck com devidos chama onSelectDeck com o id do deck', async () => {
    const onSelectDeck = jest.fn();
    await renderScreen(onSelectDeck);

    fireEvent.press(screen.getByTestId(`deck-item-${FIXTURE_DECK_ID}`));

    expect(onSelectDeck).toHaveBeenCalledTimes(1);
    expect(onSelectDeck).toHaveBeenCalledWith(FIXTURE_DECK_ID);
  });
});
