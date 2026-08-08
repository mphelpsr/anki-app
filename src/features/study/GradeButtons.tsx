import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatInterval } from '../../domain/formatInterval';
import { scheduleNextReview, type CardScheduleState, type Grade } from '../../domain/scheduler';
import { GlossyLayer } from '../../ui/GlossyLayer';
import { glossyShadowStyle } from '../../ui/glossyShadow';
import { GRADE_COLORS, GRADE_LABELS, GRADES } from './gradeStyle';

interface Props {
  cardState: CardScheduleState;
  now: number;
  onGrade: (grade: Grade) => void;
}

/**
 * Elemento pós-revelação: 4 botões de avaliação com rótulo de tempo
 * calculado dinamicamente a partir do estado atual da carta (FR-001 a
 * FR-004 de specs/004-recall-grading/spec.md) e cor fixa por nota
 * (FR-012). Substitui o RevealButton.
 */
export function GradeButtons({ cardState, now, onGrade }: Props) {
  return (
    <View style={styles.row} testID="grade-buttons">
      {GRADES.map((grade) => {
        const preview = scheduleNextReview(cardState, grade, now);
        const label = GRADE_LABELS[grade];
        return (
          <View key={grade} style={styles.column}>
            <Text style={styles.time}>{formatInterval(preview.intervalMinutes)}</Text>
            <View style={[styles.shadowWrapper, glossyShadowStyle(GRADE_COLORS[grade])]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => onGrade(grade)}
                style={styles.button}
                testID={`grade-${label.toLowerCase()}`}
              >
                <GlossyLayer color={GRADE_COLORS[grade]} />
                <Text style={styles.label}>{label}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#5a5a5a',
  },
  shadowWrapper: {
    width: '100%',
    borderRadius: 14,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c2c2c',
  },
});
