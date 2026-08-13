import { useEffect, useState } from 'react';
import coreVocabularyA2 from '../content/seed/core-vocabulary-a2.json';
import coreVocabularyB1 from '../content/seed/core-vocabulary-b1.json';
import type { Database } from './Database';
import { openAppDatabase } from './db';
import { seedIfEmpty, type SeedDeck } from './seedLoader';

// A1 deliberadamente fora do conteúdo semeado — vocabulário considerado
// básico demais pelo aprendiz, que já parte de A2 (ver SOURCES.md).
const SEED_DECKS = [coreVocabularyA2, coreVocabularyB1] as SeedDeck[];

interface UseAppDatabaseResult {
  db: Database | null;
  loading: boolean;
}

/**
 * Abre o banco (ou usa um `database` injetado, para testes) e garante a
 * semeadura inicial. Compartilhado entre a lista de decks e a tela de
 * estudo para não duplicar esse bootstrap em cada tela.
 */
export function useAppDatabase(database?: Database): UseAppDatabaseResult {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const activeDb = database ?? (await openAppDatabase());
      await seedIfEmpty(activeDb, SEED_DECKS);
      if (cancelled) return;
      setDb(activeDb);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { db, loading };
}
