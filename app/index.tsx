import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { DeckListScreen } from '../src/features/deckList/DeckListScreen';

/**
 * Raiz do app: lista de decks (spec: 001-flashcard-study-loop, História
 * de Usuário 2). Selecionar um deck com pendências navega para a sessão
 * de estudo escopada a ele em /study/[deckId].
 *
 * `DeckListScreen` fica agnóstica de rota (renderizável direto em teste,
 * sem contexto de navegação), então o refetch ao voltar de uma sessão de
 * estudo é feito aqui: `useFocusEffect` remonta a tela via `key` sempre
 * que esta rota ganha foco de novo (não na primeira montagem — remontar
 * de imediato duplicaria a abertura do banco e corre risco de disputar o
 * mesmo arquivo OPFS), o que refaz `listWithDueCounts` e mostra as
 * contagens recalculadas (ex.: um deck que virou "Em dia").
 */
export default function Index() {
  const router = useRouter();
  const [focusKey, setFocusKey] = useState(0);
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setFocusKey((key) => key + 1);
    }, []),
  );

  return <DeckListScreen key={focusKey} onSelectDeck={(deckId) => router.push(`/study/${deckId}`)} />;
}
