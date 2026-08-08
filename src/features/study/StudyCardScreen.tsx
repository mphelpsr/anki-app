import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  canGoNext,
  canGoPrevious,
  goNext,
  goPrevious,
  type QueueState,
} from '../../domain/mockQueue';
import { dueTodayCount, levelProgress } from '../../domain/mastery';
import { scheduleNextReview, type Grade } from '../../domain/scheduler';
import { CURRENT_LEVEL, studyQueue, type StudyCardMock } from '../../mocks/studyQueue';
import { DueTodayBadge } from './DueTodayBadge';
import { GradeButtons } from './GradeButtons';
import { GradeFeedback } from './GradeFeedback';
import { LevelProgress } from './LevelProgress';
import { NavArrows } from './NavArrows';
import { RevealButton } from './RevealButton';
import { SentenceReveal } from './SentenceReveal';
import { TranslationLine } from './TranslationLine';
import { WordImage } from './WordImage';

const DEFAULT_FEEDBACK_DURATION_MS = 1000;

interface Props {
  /** Duração do popup pós-avaliação (FR-011); reduzível a 0 em testes. */
  feedbackDurationMs?: number;
}

interface PendingGrade {
  grade: Grade;
  intervalMinutes: number;
}

/**
 * Composição dos elementos em escopo de
 * specs/002-mvp1-card-screen/spec.md, com o Elemento 1 redefinido por
 * specs/003-cefr-progress-counter/spec.md e o pós-revelação (tradução +
 * avaliação real + feedback em popup) definido por
 * specs/004-recall-grading/spec.md.
 */
export function StudyCardScreen({ feedbackDurationMs = DEFAULT_FEEDBACK_DURATION_MS }: Props) {
  const [cards, setCards] = useState<StudyCardMock[]>(studyQueue);
  const [queueState, setQueueState] = useState<QueueState>({
    currentIndex: 0,
    total: cards.length,
  });
  const [revealed, setRevealed] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pending, setPending] = useState<PendingGrade | null>(null);

  const card = cards[queueState.currentIndex];
  const progress = levelProgress(cards, CURRENT_LEVEL);
  const dueToday = dueTodayCount(cards, CURRENT_LEVEL, Date.now());

  function handleNext() {
    setQueueState((state) => goNext(state));
    setRevealed(false);
  }

  function handlePrevious() {
    setQueueState((state) => goPrevious(state));
    setRevealed(false);
  }

  function handleGrade(grade: Grade) {
    const now = Date.now();
    const currentIndex = queueState.currentIndex;
    const result = scheduleNextReview(cards[currentIndex], grade, now);

    setPending({ grade, intervalMinutes: result.intervalMinutes });

    setTimeout(() => {
      setCards((previous) => previous.map((c, i) => (i === currentIndex ? { ...c, ...result } : c)));

      if (canGoNext(queueState)) {
        setQueueState((state) => goNext(state));
        setRevealed(false);
      } else {
        setSessionComplete(true);
      }

      setPending(null);
    }, feedbackDurationMs);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <LevelProgress percentage={progress} level={CURRENT_LEVEL} />
        <DueTodayBadge count={dueToday} />
      </View>
      <View style={styles.card}>
        {sessionComplete ? (
          <View style={styles.completeState} testID="session-complete">
            <Text style={styles.completeText}>Sessão concluída!</Text>
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <WordImage emoji={card.emoji} />
              <SentenceReveal
                sentenceBefore={card.sentenceBefore}
                word={card.word}
                sentenceAfter={card.sentenceAfter}
              />
              {revealed && (
                <TranslationLine
                  before={card.translationBefore}
                  word={card.translatedWord}
                  after={card.translationAfter}
                />
              )}
            </View>
            <View style={styles.controls}>
              {revealed ? (
                <GradeButtons cardState={card} now={Date.now()} onGrade={handleGrade} />
              ) : (
                <RevealButton revealed={revealed} onReveal={() => setRevealed(true)} />
              )}
              <NavArrows
                canGoPrevious={canGoPrevious(queueState)}
                canGoNext={canGoNext(queueState)}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </View>
          </>
        )}
        {pending && <GradeFeedback grade={pending.grade} intervalMinutes={pending.intervalMinutes} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e9e6df',
  },
  header: {
    marginTop: 16,
    marginBottom: 8,
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
  completeState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2c',
  },
});
