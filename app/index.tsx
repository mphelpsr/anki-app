import { StudyCardScreen } from '../src/features/study/StudyCardScreen';

/**
 * Rota raiz temporária (ver Suposições de
 * specs/002-mvp1-card-screen/spec.md): quando 001-flashcard-study-loop
 * for implementada, esta tela migra para /study/[deckId] e a raiz passa
 * a ser a lista de decks (US2 de 001).
 */
export default function Index() {
  return <StudyCardScreen />;
}
