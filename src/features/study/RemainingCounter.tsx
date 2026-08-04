import { StyleSheet, Text } from 'react-native';

interface Props {
  remaining: number;
}

/** Elemento 1: contador de cartas restantes (FR-001). */
export function RemainingCounter({ remaining }: Props) {
  return <Text style={styles.text}>{remaining} cartas restantes</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a3a3a',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
