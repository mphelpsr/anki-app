import { StyleSheet, Text } from 'react-native';
import type { CefrLevel } from '../../domain/mastery';

interface Props {
  percentage: number;
  level: CefrLevel;
}

/**
 * Elemento 1 (redefinido): progresso gamificado rumo ao nível CEFR atual,
 * no lugar do contador puro de cartas restantes (FR-001, FR-002).
 */
export function LevelProgress({ percentage, level }: Props) {
  return (
    <Text style={styles.text} testID="level-progress">
      {percentage}% do {level}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c2c2c',
    textAlign: 'center',
  },
});
