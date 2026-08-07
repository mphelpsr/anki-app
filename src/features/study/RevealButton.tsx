import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  revealed: boolean;
  onReveal: () => void;
}

/**
 * Elemento 4: botão "Reveal" (FR-004, FR-005 de 002; rótulo em inglês
 * por FR-010 de specs/004-recall-grading/spec.md, para consistência com
 * os botões Again/Hard/Good/Easy).
 * Some após revelar, dando lugar ao GradeButtons — FR-010 de 002
 * (idempotência) fica trivialmente satisfeito porque não há como tocar
 * novamente em um botão que não está mais lá.
 */
export function RevealButton({ revealed, onReveal }: Props) {
  if (revealed) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Reveal"
      onPress={onReveal}
      style={styles.button}
      testID="reveal-button"
    >
      <Text style={styles.label}>Reveal</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f6d998',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#2c2c2c',
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
  },
});
