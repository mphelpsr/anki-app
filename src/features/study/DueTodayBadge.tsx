import { StyleSheet, Text } from 'react-native';

interface Props {
  count: number;
}

/**
 * Indicador secundário e discreto de pendências do dia (FR-005) — deve
 * ficar visualmente menos proeminente que LevelProgress (SC-003).
 */
export function DueTodayBadge({ count }: Props) {
  return (
    <Text style={styles.text} testID="due-today-badge">
      {count} hoje
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 2,
  },
});
