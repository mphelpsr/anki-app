import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Grade } from '../../domain/scheduler';
import { GRADE_COLORS, GRADE_LABELS } from './gradeStyle';

interface Props {
  grade: Grade;
}

/**
 * Estado de carregamento breve exibido ao tocar em uma nota, antes de
 * avançar para a próxima carta (História de Usuário 3, FR-011/FR-012 de
 * specs/004-recall-grading/spec.md).
 */
export function GradeFeedback({ grade }: Props) {
  return (
    <View style={[styles.overlay, { backgroundColor: GRADE_COLORS[grade] }]} testID="grade-feedback">
      <ActivityIndicator color="#2c2c2c" />
      <Text style={styles.label}>{GRADE_LABELS[grade]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2c',
  },
});
