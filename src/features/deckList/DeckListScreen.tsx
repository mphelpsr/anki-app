import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Database } from '../../data/Database';
import { listWithDueCounts, type DeckWithDueCount } from '../../data/repositories/deckRepository';
import { useAppDatabase } from '../../data/useAppDatabase';
import { DeckListItem } from './DeckListItem';

interface Props {
  /** Banco de dados a usar; por padrão abre o SQLite real. Injetável em testes. */
  database?: Database;
  onSelectDeck: (deckId: string) => void;
}

/**
 * Lista os decks do aprendiz com a contagem de cards devidos (spec:
 * 001-flashcard-study-loop, História de Usuário 2 / FR-008/009/010).
 * Agnóstica de rota — quem navega é quem usa esta tela (`app/index.tsx`).
 */
export function DeckListScreen({ database, onSelectDeck }: Props) {
  const { db, loading: dbLoading } = useAppDatabase(database);
  const [decks, setDecks] = useState<DeckWithDueCount[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;

    async function load() {
      const rows = await listWithDueCounts(db as Database, Date.now());
      if (cancelled) return;
      setDecks(rows);
      setLoadingDecks(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const loading = dbLoading || loadingDecks;

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingState} testID="deck-list-loading">
          <Text style={styles.loadingText}>Carregando…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {decks.map((deck) => (
            <DeckListItem key={deck.id} deck={deck} onSelect={onSelectDeck} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e9e6df',
  },
  list: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2c',
  },
});
