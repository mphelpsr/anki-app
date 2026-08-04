# Contrato: Módulo Agendador (`src/domain/scheduler.ts`)

O agendador é a interface única da qual toda outra camada (repositórios,
UI) depende, e precisa permanecer uma função pura conforme a constituição
(Restrições de Tecnologia e Dados: "sem imports de React/Expo"). Este
contrato fixa seu formato de entrada/saída para que possa ser
implementado e testado antes de qualquer outra coisa nesta funcionalidade.

## Assinatura da função

```ts
type Grade = 0 | 1 | 2 | 3; // 0=não lembrei, 1=difícil, 2=lembrei, 3=fácil

interface CardScheduleState {
  repetitions: number;   // >= 0
  easeFactor: number;    // >= 1.30
  intervalDays: number;  // >= 0 (0 significa nunca revisado)
}

interface ScheduleResult {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextDueAt: number; // unix ms, derivado de now + intervalDays
}

function scheduleNextReview(
  current: CardScheduleState,
  grade: Grade,
  now: number, // unix ms, injetado para testabilidade
): ScheduleResult;
```

## Regras do contrato (verificadas por `tests/unit/scheduler.test.ts`)

1. **Determinismo**: a mesma entrada `(current, grade, now)` sempre
   produz a mesma saída. Sem aleatoriedade oculta, sem leituras de um
   relógio diferente do `now` injetado.
2. **Nota 0 sempre encurta**: `scheduleNextReview(current, 0, now)
   .intervalDays` DEVE ser `1` (ou menos), independentemente de
   `current.intervalDays`, e `repetitions` reinicia para `0`. Atende ao
   Cenário de Aceitação da spec (História 3 #1) e ao Caso de Borda
   (reinício de card com dificuldade).
3. **Ordenação monotônica por nota**: para o mesmo `current` e `now`, o
   `nextDueAt` resultante para a nota 3 DEVE ser `>=` ao da nota 2, que
   DEVE ser `>=` ao da nota 1, que DEVE ser `>=` ao da nota 0. Atende ao
   SC-003.
4. **Crescimento em sucessos consecutivos**: chamar
   `scheduleNextReview` repetidamente com nota 2 ou 3, alimentando a
   saída de cada chamada de volta como o `current` da próxima chamada,
   DEVE produzir uma sequência de `intervalDays` estritamente crescente
   por pelo menos 4 chamadas consecutivas (após as etapas iniciais de
   intervalo fixo). Atende ao SC-004.
5. **Piso do fator de facilidade**: o `easeFactor` no resultado nunca é
   menor que `1,30`, independentemente de quantas revisões consecutivas
   com nota 0 forem aplicadas.
6. **Sem efeitos colaterais**: a função não lê nem grava em nenhum banco
   de dados, armazenamento ou estado global — ela apenas calcula a partir
   de seus argumentos. É isso que a torna testável de forma independente
   e reutilizável caso a camada de persistência mude.

## Consumidores

- `src/data/repositories/reviewRepository.ts` chama `scheduleNextReview`
  com o estado atual do Card, persiste o `ScheduleResult` na linha do
  Card e anexa uma linha de Review (ver
  [data-model.md](../data-model.md)).
- `tests/unit/scheduler.test.ts` exercita a função diretamente, sem
  banco de dados, conforme o Princípio III da Constituição (testes
  primeiro para lógica de domínio).
