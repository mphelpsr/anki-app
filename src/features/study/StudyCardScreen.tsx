import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  canGoNext,
  canGoPrevious,
  goNext,
  goPrevious,
  remainingCount,
  type QueueState,
} from '../../domain/mockQueue';
import { studyQueue } from '../../mocks/studyQueue';
import { NavArrows } from './NavArrows';
import { RemainingCounter } from './RemainingCounter';
import { RevealButton } from './RevealButton';
import { SentenceReveal } from './SentenceReveal';
import { WordImage } from './WordImage';

/**
 * Composição dos 5 elementos em escopo de
 * specs/002-mvp1-card-screen/spec.md, contra a fila mock local.
 */
export function StudyCardScreen() {
  const [queueState, setQueueState] = useState<QueueState>({
    currentIndex: 0,
    total: studyQueue.length,
  });
  const [revealed, setRevealed] = useState(false);

  const card = studyQueue[queueState.currentIndex];

  function handleNext() {
    setQueueState((state) => goNext(state));
    setRevealed(false);
  }

  function handlePrevious() {
    setQueueState((state) => goPrevious(state));
    setRevealed(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RemainingCounter remaining={remainingCount(queueState)} />
      <View style={styles.card}>
        <View style={styles.content}>
          <WordImage emoji={card.emoji} />
          <SentenceReveal
            sentenceBefore={card.sentenceBefore}
            word={card.word}
            sentenceAfter={card.sentenceAfter}
            revealed={revealed}
          />
        </View>
        <View style={styles.controls}>
          <RevealButton revealed={revealed} onReveal={() => setRevealed(true)} />
          <NavArrows
            canGoPrevious={canGoPrevious(queueState)}
            canGoNext={canGoNext(queueState)}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e9e6df',
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    gap: 32,
    marginTop: 24,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
});
