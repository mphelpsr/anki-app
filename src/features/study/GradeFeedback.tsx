import { StyleSheet, Text, View } from 'react-native';
import { formatIntervalLong } from '../../domain/formatInterval';
import type { Grade } from '../../domain/scheduler';
import { GlossyLayer } from '../../ui/GlossyLayer';
import { glossyShadowStyle } from '../../ui/glossyShadow';
import { GRADE_COLORS, GRADE_LABELS } from './gradeStyle';

interface Props {
  grade: Grade;
  intervalMinutes: number;
}

/**
 * Popup breve exibido ao tocar em uma nota, sobre um fundo escurecido,
 * com a cor e o rótulo da nota e a próxima revisão por extenso — antes
 * de avançar para a próxima carta (História de Usuário 3, FR-011/FR-012
 * de specs/004-recall-grading/spec.md).
 */
export function GradeFeedback({ grade, intervalMinutes }: Props) {
  const color = GRADE_COLORS[grade];

  return (
    <View style={styles.backdrop} testID="grade-feedback">
      <View style={styles.card}>
        <View style={[styles.badgeShadow, glossyShadowStyle(color)]}>
          <View style={[styles.badge, { backgroundColor: color }]} testID="grade-feedback-badge">
            <GlossyLayer color={color} />
            <Text style={styles.badgeIcon}>✓</Text>
          </View>
        </View>
        <Text style={styles.title}>{GRADE_LABELS[grade]}</Text>
        <Text style={styles.subtitle} testID="grade-feedback-interval">
          Próxima revisão em {formatIntervalLong(intervalMinutes)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 44, 44, 0.45)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 8,
    minWidth: 220,
  },
  badgeShadow: {
    borderRadius: 32,
    marginBottom: 8,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c2c2c',
  },
  subtitle: {
    fontSize: 14,
    color: '#6a6a6a',
    textAlign: 'center',
  },
});
