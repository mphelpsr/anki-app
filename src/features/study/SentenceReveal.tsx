import { StyleSheet, Text } from 'react-native';

interface Props {
  sentenceBefore: string;
  word: string;
  sentenceAfter: string;
  revealed: boolean;
}

/**
 * Elemento 3: frase com a palavra oculta por sublinhado até ser
 * revelada (FR-003, FR-005).
 */
export function SentenceReveal({ sentenceBefore, word, sentenceAfter, revealed }: Props) {
  const blank = '_'.repeat(Math.max(word.length, 6));

  return (
    <Text style={styles.sentence}>
      {sentenceBefore}
      <Text
        testID="sentence-target"
        style={[styles.target, revealed && styles.revealedWord]}
      >
        {revealed ? word : blank}
      </Text>
      {sentenceAfter}
    </Text>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    color: '#2c2c2c',
    paddingHorizontal: 16,
  },
  target: {
    textDecorationLine: 'underline',
  },
  revealedWord: {
    fontWeight: '700',
  },
});
