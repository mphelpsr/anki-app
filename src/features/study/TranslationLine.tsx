import { StyleSheet, Text } from 'react-native';

interface Props {
  before: string;
  word: string;
  after: string;
}

/**
 * Tradução em português, exibida apenas quando a carta está revelada
 * (FR-008 de specs/004-recall-grading/spec.md).
 */
export function TranslationLine({ before, word, after }: Props) {
  return (
    <Text style={styles.sentence} testID="translation-line">
      {before}
      <Text style={styles.word}>{word}</Text>
      {after}
    </Text>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#5a5a5a',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  word: {
    fontWeight: '700',
    color: '#3a3a3a',
  },
});
