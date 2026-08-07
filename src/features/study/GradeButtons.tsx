import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatInterval } from '../../domain/formatInterval';
import { scheduleNextReview, type CardScheduleState, type Grade } from '../../domain/scheduler';

interface Props {
  cardState: CardScheduleState;
  now: number;
  onGrade: (grade: Grade) => void;
}

const GRADES: { grade: Grade; label: string }[] = [
  { grade: 0, label: 'Again' },
  { grade: 1, label: 'Hard' },
  { grade: 2, label: 'Good' },
  { grade: 3, label: 'Easy' },
];

/**
 * Elemento pós-revelação: 4 botões de avaliação com rótulo de tempo
 * calculado dinamicamente a partir do estado atual da carta (FR-001 a
 * FR-004 de specs/004-recall-grading/spec.md). Substitui o RevealButton.
 */
export function GradeButtons({ cardState, now, onGrade }: Props) {
  return (
    <View style={styles.row} testID="grade-buttons">
      {GRADES.map(({ grade, label }) => {
        const preview = scheduleNextReview(cardState, grade, now);
        return (
          <View key={grade} style={styles.column}>
            <Text style={styles.time}>{formatInterval(preview.intervalMinutes)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onGrade(grade)}
              style={styles.button}
              testID={`grade-${label.toLowerCase()}`}
            >
              <Text style={styles.label}>{label}</Text>
            </Pressable>
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
  button: {
    width: '100%',
    backgroundColor: '#f6d998',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2c2c2c',
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c2c2c',
  },
});
