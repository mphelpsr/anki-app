import { StyleSheet, Text } from 'react-native';

interface Props {
  sentenceBefore: string;
  word: string;
  sentenceAfter: string;
}

/**
 * Elemento 3: frase completa em inglês, com a palavra-alvo sempre
 * visível e em destaque (negrito + sublinhado) desde o início — não é
 * mais ocultada até "Reveal" (revisado após observar outros apps de
 * repetição espaçada: o que se testa é o reconhecimento do significado,
 * não a produção da palavra). "Reveal" agora controla apenas a tradução
 * e os botões de avaliação (ver specs/002-mvp1-card-screen/spec.md e
 * specs/004-recall-grading/spec.md).
 */
export function SentenceReveal({ sentenceBefore, word, sentenceAfter }: Props) {
  return (
    <Text style={styles.sentence}>
      {sentenceBefore}
      <Text testID="sentence-target" style={styles.target}>
        {word}
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
    fontWeight: '700',
  },
});
