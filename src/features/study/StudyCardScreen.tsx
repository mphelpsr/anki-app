import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Database } from '../../data/Database';
import { openAppDatabase } from '../../data/db';
import { getCardById, getDueCards, type CardRow } from '../../data/repositories/cardRepository';
import { getCardsForMastery, getFirstDeck } from '../../data/repositories/deckRepository';
import { recordReview } from '../../data/repositories/reviewRepository';
import { seedIfEmpty, type SeedDeck } from '../../data/seedLoader';
import sampleSeed from '../../content/seed/oxford-3000-a1-a2.sample.json';
import {
  canGoNext,
  canGoPrevious,
  goNext,
  goPrevious,
  type QueueState,
} from '../../domain/mockQueue';
import { dueTodayCount, levelProgress, type CefrLevel, type MasteryCard } from '../../domain/mastery';
import { scheduleNextReview, type Grade } from '../../domain/scheduler';
import { DueTodayBadge } from './DueTodayBadge';
import { GradeButtons } from './GradeButtons';
import { GradeFeedback } from './GradeFeedback';
import { LevelProgress } from './LevelProgress';
import { NavArrows } from './NavArrows';
import { RevealButton } from './RevealButton';
import { SentenceReveal } from './SentenceReveal';
import { TranslationLine } from './TranslationLine';
import { WordImage } from './WordImage';

const DEFAULT_FEEDBACK_DURATION_MS = 700;

interface Props {
  /** Duração do popup pós-avaliação (FR-011); reduzível a 0 em testes. */
  feedbackDurationMs?: number;
  /** Banco de dados a usar; por padrão abre o SQLite real. Injetável em testes. */
  database?: Database;
}

interface PendingGrade {
  grade: Grade;
  intervalMinutes: number;
}

/**
 * Composição dos elementos em escopo de
 * specs/002-mvp1-card-screen/spec.md, com o Elemento 1 redefinido por
 * specs/003-cefr-progress-counter/spec.md, o pós-revelação (tradução +
 * avaliação real + feedback em popup) definido por
 * specs/004-recall-grading/spec.md, e a persistência real (SQLite,
 * fila = cartas devidas de verdade) de 001-flashcard-study-loop.
 */
export function StudyCardScreen({ feedbackDurationMs = DEFAULT_FEEDBACK_DURATION_MS, database }: Props) {
  const [db, setDb] = useState<Database | null>(null);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [deckLevel, setDeckLevel] = useState<CefrLevel>('A2');
  const [loading, setLoading] = useState(true);
  const [sessionQueue, setSessionQueue] = useState<CardRow[]>([]);
  const [masteryCards, setMasteryCards] = useState<MasteryCard[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({ currentIndex: 0, total: 0 });
  const [revealed, setRevealed] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pending, setPending] = useState<PendingGrade | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const activeDb = database ?? (await openAppDatabase());
      await seedIfEmpty(activeDb, [sampleSeed as SeedDeck]);

      const deck = await getFirstDeck(activeDb);
      if (!deck) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [due, mastery] = await Promise.all([
        getDueCards(activeDb, deck.id, Date.now()),
        getCardsForMastery(activeDb, deck.id),
      ]);

      if (cancelled) return;
      setDb(activeDb);
      setDeckId(deck.id);
      setDeckLevel(deck.sourceLevel);
      setSessionQueue(due);
      setMasteryCards(mastery);
      setQueueState({ currentIndex: 0, total: due.length });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = sessionQueue[queueState.currentIndex];
  const progress = levelProgress(masteryCards, deckLevel);
  const dueToday = dueTodayCount(masteryCards, deckLevel, Date.now());
  const hasDueCards = sessionQueue.length > 0;

  function handleNext() {
    setQueueState((state) => goNext(state));
    setRevealed(false);
  }

  function handlePrevious() {
    setQueueState((state) => goPrevious(state));
    setRevealed(false);
  }

  function handleGrade(grade: Grade) {
    if (!db || !deckId || !card) return;
    const now = Date.now();
    const preview = scheduleNextReview(card, grade, now);
    const cardId = card.id;

    setPending({ grade, intervalMinutes: preview.intervalMinutes });

    setTimeout(() => {
      void (async () => {
        await recordReview(db, cardId, grade, now);
        const [refreshedMastery, refreshedCard] = await Promise.all([
          getCardsForMastery(db, deckId),
          getCardById(db, cardId),
        ]);
        setMasteryCards(refreshedMastery);
        if (refreshedCard) {
          setSessionQueue((previous) => previous.map((c) => (c.id === cardId ? refreshedCard : c)));
        }

        if (canGoNext(queueState)) {
          setQueueState((state) => goNext(state));
          setRevealed(false);
        } else {
          setSessionComplete(true);
        }
        setPending(null);
      })();
    }, feedbackDurationMs);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <LevelProgress percentage={progress} level={deckLevel} />
        <DueTodayBadge count={dueToday} />
      </View>
      <View style={styles.card}>
        {loading ? (
          <View style={styles.completeState} testID="study-loading">
            <Text style={styles.completeText}>Carregando…</Text>
          </View>
        ) : sessionComplete ? (
          <View style={styles.completeState} testID="session-complete">
            <Text style={styles.completeText}>Sessão concluída!</Text>
          </View>
        ) : !hasDueCards ? (
          <View style={styles.completeState} testID="no-cards-due">
            <Text style={styles.completeText}>Tudo em dia por aqui!</Text>
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
