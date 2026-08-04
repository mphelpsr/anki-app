import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/** Elemento 5: setas de navegação anterior/próxima (FR-006 a FR-009). */
export function NavArrows({ canGoPrevious, canGoNext, onPrevious, onNext }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Carta anterior"
        accessibilityState={{ disabled: !canGoPrevious }}
        disabled={!canGoPrevious}
        onPress={onPrevious}
        style={[styles.arrow, !canGoPrevious && styles.disabled]}
        testID="prev-arrow"
      >
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próxima carta"
        accessibilityState={{ disabled: !canGoNext }}
        disabled={!canGoNext}
        onPress={onNext}
        style={[styles.arrow, !canGoNext && styles.disabled]}
        testID="next-arrow"
      >
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6d998',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#2c2c2c',
    alignSelf: 'center',
  },
  arrow: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  disabled: {
    opacity: 0.4,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2c2c2c',
    opacity: 0.3,
  },
});
