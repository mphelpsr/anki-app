import { useLocalSearchParams, useRouter } from 'expo-router';
import { StudyCardScreen } from '../../src/features/study/StudyCardScreen';

/**
 * Sessão de estudo escopada a um deck (spec: 001-flashcard-study-loop).
 * "Voltar aos decks" (sessão concluída) retorna à lista em `/`.
 */
export default function Study() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();

  return <StudyCardScreen deckId={deckId} onFinishSession={() => router.back()} />;
}
