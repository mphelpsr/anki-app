<!--
Nota de sincronização (atualizado por 004-recall-grading, 2026-08-04):
o modelo original abaixo (intervalos só em dias, nota 0 sempre "1 dia")
foi substituído por um modelo de duas fases (aprendizagem em minutos +
crescimento em dias após graduar), para que "Again" traga a carta de
volta em curtíssimo prazo, como pedido explicitamente na especificação
de 004. A unidade de intervalo passa de `intervalDays` para
`intervalMinutes`. Esta é a versão vigente, implementada em
`src/domain/scheduler.ts`.
-->

# Contrato: Módulo Agendador (`src/domain/scheduler.ts`)

O agendador é a interface única da qual toda outra camada (repositórios,
UI) depende, e precisa permanecer uma função pura conforme a constituição
(Restrições de Tecnologia e Dados: "sem imports de React/Expo"). Este
contrato fixa seu formato de entrada/saída para que possa ser
implementado e testado antes de qualquer outra coisa que dependa dele.

## Assinatura da função

```ts
type Grade = 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy

interface CardScheduleState {
  repetitions: number;      // >= 0; 0 = carta nova ou em relearning (não graduada)
  easeFactor: number;       // >= 1.30
  intervalMinutes: number;  // >= 0 (0 significa nunca revisado)
}

interface ScheduleResult {
  repetitions: number;
  easeFactor: number;
  intervalMinutes: number;
  nextDueAt: number; // unix ms, derivado de now + intervalMinutes
}

function scheduleNextReview(
  current: CardScheduleState,
  grade: Grade,
  now: number, // unix ms, injetado para testabilidade
): ScheduleResult;
```

## Modelo: duas fases

- **Fase de aprendizagem** (`repetitions === 0`, carta nova ou que acabou
  de sofrer um "Again"): usa passos curtos em minutos.
  - Again → 1 minuto, `repetitions` permanece 0, fator de facilidade
    reduz 0,20 (piso 1,30).
  - Hard → 10 minutos, `repetitions` permanece 0, fator de facilidade
    reduz 0,15.
  - Good → gradua: `repetitions = 1`, intervalo = 1 dia (1440 min).
  - Easy → gradua direto para um intervalo maior: `repetitions = 1`,
    intervalo = 4 dias (5760 min), fator de facilidade aumenta 0,15.
- **Fase graduada** (`repetitions >= 1`): cresce em dias por um
  multiplicador que depende da nota, não apenas do fator de facilidade.
  - Again → **lapso**: volta para a fase de aprendizagem (`repetitions =
    0`, intervalo = 1 minuto, fator de facilidade reduz 0,20). Não existe
    meio-termo em horas.
  - Hard → `repetitions + 1`; intervalo = `round(intervalo_anterior_em_dias
    * 1,2)` — multiplicador **fixo**, não o fator de facilidade, para que
    Hard nunca produza o mesmo intervalo que Good; fator de facilidade
    reduz 0,15.
  - Good → `repetitions + 1`; intervalo = `round(intervalo_anterior_em_dias
    * fator_de_facilidade)` (SM-2 clássico); fator de facilidade
    inalterado.
  - Easy → `repetitions + 1`; intervalo = `round(intervalo_anterior_em_dias
    * fator_de_facilidade * 1,3)`; fator de facilidade aumenta 0,15.

## Regras do contrato (verificadas por `tests/unit/scheduler.test.ts`)

1. **Determinismo**: a mesma entrada `(current, grade, now)` sempre
   produz a mesma saída. Sem aleatoriedade oculta, sem leituras de um
   relógio diferente do `now` injetado.
2. **Again é sempre curtíssimo prazo**: `scheduleNextReview(current, 0,
   now).nextDueAt` DEVE ser inferior a `now + 2 minutos`,
   independentemente de `current` (carta nova ou já graduada), e
   `repetitions` do resultado DEVE ser `0`.
3. **Ordenação monotônica por nota**: para o mesmo `current` e `now`, o
   `nextDueAt` resultante para a nota 3 (Easy) DEVE ser `>=` ao da nota 2
   (Good), que DEVE ser `>=` ao da nota 1 (Hard), que DEVE ser `>=` ao
   da nota 0 (Again).
4. **Crescimento em sucessos consecutivos**: chamar `scheduleNextReview`
   repetidamente com nota 2 ou 3, alimentando a saída de cada chamada de
   volta como o `current` da próxima chamada, DEVE produzir uma
   sequência de `intervalMinutes` estritamente crescente já a partir da
   graduação (repetitions >= 1).
5. **Piso do fator de facilidade**: o `easeFactor` no resultado nunca é
   menor que `1,30`, independentemente de quantas revisões consecutivas
   com nota 0 forem aplicadas.
6. **Sem efeitos colaterais**: a função não lê nem grava em nenhum banco
   de dados, armazenamento ou estado global — ela apenas calcula a partir
   de seus argumentos.

## Consumidores

- `src/features/study/StudyCardScreen.tsx` (via `004-recall-grading`)
  chama `scheduleNextReview` com o estado atual da carta em memória e
  atualiza o estado da sessão — ainda sem persistência (SQLite fica para
  `001` completa).
- `src/data/repositories/reviewRepository.ts` (quando `001` for
  implementada com persistência real) chamará a mesma função, persistindo
  o `ScheduleResult` na linha do Card e anexando uma linha de Review (ver
  [data-model.md](../data-model.md) — `intervalBefore`/`intervalAfter`
  passam a ser expressos em minutos).
- `tests/unit/scheduler.test.ts` exercita a função diretamente, sem
  banco de dados nem UI, conforme o Princípio III da Constituição.
