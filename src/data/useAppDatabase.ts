import { useEffect, useState } from 'react';
import sampleSeed from '../content/seed/oxford-3000-a1-a2.sample.json';
import type { Database } from './Database';
import { openAppDatabase } from './db';
import { seedIfEmpty, type SeedDeck } from './seedLoader';

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
      await seedIfEmpty(activeDb, [sampleSeed as SeedDeck]);
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
