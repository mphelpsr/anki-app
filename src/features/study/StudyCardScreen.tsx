import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Database } from '../../data/Database';
import { getCardById, getDueCards, type CardRow } from '../../data/repositories/cardRepository';
import { getCardsForMastery, getDeckById } from '../../data/repositories/deckRepository';
import { recordReview } from '../../data/repositories/reviewRepository';
import { useAppDatabase } from '../../data/useAppDatabase';
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
  /** Deck ao qual esta sessão de estudo é escopada (spec: 001, US2). */
  deckId: string;
  /** Chamado ao tocar "Voltar aos decks" no estado de sessão concluída. */
  onFinishSession: () => void;
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
export function StudyCardScreen({ deckId, onFinishSession, feedbackDurationMs = DEFAULT_FEEDBACK_DURATION_MS, database }: Props) {
  const { db, loading: dbLoading } = useAppDatabase(database);
  const [deckLevel, setDeckLevel] = useState<CefrLevel>('A2');
  const [deckLoading, setDeckLoading] = useState(true);
  const [sessionQueue, setSessionQueue] = useState<CardRow[]>([]);
  const [masteryCards, setMasteryCards] = useState<MasteryCard[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({ currentIndex: 0, total: 0 });
  const [revealed, setRevealed] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pending, setPending] = useState<PendingGrade | null>(null);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;

    async function load() {
      const activeDb = db as Database;
      const deck = await getDeckById(activeDb, deckId);
      if (!deck) {
        if (!cancelled) setDeckLoading(false);
        return;
      }

      const [due, mastery] = await Promise.all([
        getDueCards(activeDb, deck.id, Date.now()),
        getCardsForMastery(activeDb, deck.id),
      ]);

      if (cancelled) return;
      setDeckLevel(deck.sourceLevel);
      setSessionQueue(due);
      setMasteryCards(mastery);
      setQueueState({ currentIndex: 0, total: due.length });
      setDeckLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [db, deckId]);

  const loading = dbLoading || deckLoading;
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
    if (!db || !card) return;
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
            <Pressable
              accessibilityRole="button"
              onPress={onFinishSession}
              style={styles.backButton}
              testID="back-to-decks-button"
            >
              <Text style={styles.backButtonLabel}>Voltar aos decks</Text>
            </Pressable>
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
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#f6d998',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#2c2c2c',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  backButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c2c2c',
  },
});
