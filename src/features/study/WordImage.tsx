import { StyleSheet, Text, View } from 'react-native';

interface Props {
  emoji: string;
}

/**
 * Elemento 2: imagem referente à palavra (FR-002).
 * Placeholder ilustrativo — a fonte real de ilustrações ainda não foi
 * definida (ver Suposições de specs/002-mvp1-card-screen/spec.md).
 */
export function WordImage({ emoji }: Props) {
  return (
    <View style={styles.frame} testID="word-image">
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#2b2320',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 96,
  },
});
