import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DeckWithDueCount } from '../../data/repositories/deckRepository';

interface Props {
  deck: DeckWithDueCount;
  onSelect: (deckId: string) => void;
}

/**
 * Uma linha da lista de decks (spec: 001-flashcard-study-loop, História
 * de Usuário 2). Três estados: com pendências (pressionável), em dia
 * (FR-009, no-op) e sem nenhum card (FR-010, distinto de "em dia").
 */
export function DeckListItem({ deck, onSelect }: Props) {
  const hasCards = deck.totalCount > 0;
  const hasDue = deck.dueCount > 0;

  return (
    <Pressable
      testID={`deck-item-${deck.id}`}
      onPress={hasDue ? () => onSelect(deck.id) : undefined}
      disabled={!hasDue}
      style={styles.row}
    >
      <Text style={styles.name}>{deck.name}</Text>
      {hasDue ? (
        <Text style={styles.dueCount}>{deck.dueCount} devidas</Text>
      ) : hasCards ? (
        <Text style={styles.upToDate}>Em dia</Text>
      ) : (
        <Text style={styles.empty}>Sem cards ainda</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c2c2c',
  },
  dueCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  upToDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8a8a8a',
  },
  empty: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8a8a8a',
  },
});
