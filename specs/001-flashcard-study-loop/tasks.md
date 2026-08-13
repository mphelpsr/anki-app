---

description: "Task list template for feature implementation"
---

# Tarefas: Loop de Estudo com Flashcards (MVP)

**Entrada**: Documentos de design de `/specs/001-flashcard-study-loop/`

**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Incluídos e OBRIGATÓRIOS para lógica de domínio — o Princípio
III da Constituição (Testes Primeiro para Lógica de Domínio, NÃO
NEGOCIÁVEL) exige testes antes da implementação para o agendador, o
modelo de dados e o pipeline de conteúdo. Telas de UI recebem um teste de
integração/smoke por história de usuário.

**Organização**: As tarefas são agrupadas por história de usuário (US1 =
Sessão de estudo /P1, US2 = Lista de decks /P2, US3 = Correção do
agendamento /P1) para permitir implementação e teste independentes de
cada história, conforme spec.md.

<!--
Nota de status (2026-08-08): grande parte desta lista foi concluída de
forma incremental pelas features 002/003/004 (tela de estudo mock →
progresso gamificado → avaliação real com agendador de duas fases) antes
de a persistência SQLite existir. Esta revisão marca o que já está feito,
mantém as tarefas originais como registro histórico e adiciona a Fase 2b
com as tarefas concretas da implementação do SQLite real. US2 (lista de
decks) permanece não implementada — fora de escopo desta etapa.
-->

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário a tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto Expo único na raiz do repositório, conforme a Estrutura do
Projeto do plan.md: `app/` (rotas), `src/` (domain/data/features/content),
`content-pipeline/` (script independente), `tests/`.

---

## Fase 1: Setup (Infraestrutura Compartilhada)

- [x] T001 Inicializar o projeto Expo + TypeScript na raiz do repositório
- [x] T002 [P] Instalar dependências principais (`expo-router`, `jest`, `@testing-library/react-native`, preset `jest-expo`)
- [x] T003 [P] Configurar TypeScript strict + `tsc --noEmit` como gate

**Checkpoint**: ✅ Atingido (via `002-mvp1-card-screen`).

---

## Fase 2: Fundação — Agendador (Pré-requisito Bloqueante)

- [x] T004 Testes de contrato do agendador em `tests/unit/scheduler.test.ts` (via `004-recall-grading`, modelo de duas fases)
- [x] T005 `scheduleNextReview` em `src/domain/scheduler.ts`
- [x] T006 Tipos `Grade`/`CardScheduleState`/`ScheduleResult` (inline em `scheduler.ts`, sem arquivo `.types.ts` separado — simplificação aceita)
- [x] T012 Layout raiz do `expo-router` em `app/_layout.tsx`

**Checkpoint**: ✅ Atingido. Agendador real, testado, em produção desde `004-recall-grading`.

---

## Fase 2b: Fundação — Persistência SQLite Real (NOVA nesta etapa)

**Propósito**: Substituir o estado mock em memória (`src/mocks/
studyQueue.ts`, usado por `002`/`003`/`004`) por SQLite real, sem mudar o
comportamento já validado visualmente.

**⚠️ CRÍTICO**: Testes de repositório usam SQL real via `node:sqlite`
(ver research.md → Estratégia de testes), não mocks — devem falhar antes
da implementação correspondente.

- [x] T036 [P] Criar a interface `Database` (`execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync`) em `src/data/Database.ts`
- [x] T037 [P] Criar o adaptador de teste `tests/support/nodeSqliteDatabase.ts` (implementa `Database` via `node:sqlite`, banco `:memory:`)
- [x] T038 Escrever teste do schema em `tests/data/schema.test.ts` (tabelas/colunas esperadas existem após `execAsync(SCHEMA_SQL)`) — DEVE falhar antes de T039
- [x] T039 Criar `SCHEMA_SQL` (tabelas Deck/Card/Review conforme `data-model.md`) em `src/data/schema.ts` (depende de T038, T036)
- [x] T040 Implementar `openAppDatabase()` em `src/data/db.ts`, usando `expo-sqlite` real + `SCHEMA_SQL` (depende de T039)
- [x] T041 [P] Criar `content-pipeline/SOURCES.md` (fonte, data, nível, status de licença do dataset de amostra — Princípio IV)
- [x] T042 [P] Criar o dataset de amostra em `src/content/seed/oxford-3000-a1-a2.sample.json`, conforme `contracts/seed-content-schema.json` (mesmas 4 palavras já usadas no mock, agora rastreáveis) — **substituído** por `core-vocabulary-{a2,b1}.json` (40 cartas, 2 níveis; um terceiro deck A1 chegou a ser criado e foi removido a pedido do aprendiz — vocabulário considerado básico demais) quando T032 virou conteúdo autoral definitivo em vez de placeholder à espera da Oxford; ver `content-pipeline/SOURCES.md`
- [x] T043 Escrever testes de `seedLoader` em `tests/data/seedLoader.test.ts` (semeia deck+cards em BD vazio; idempotente — rodar duas vezes não duplica) — DEVE falhar antes de T044
- [x] T044 Implementar `seedIfEmpty(db)` em `src/data/seedLoader.ts` (depende de T043, T040, T042)

**Checkpoint**: BD abre, aplica schema e semeia dados reais uma única vez; comprovado por teste, não só manualmente.

---

## Fase 3: História de Usuário 1 - Estudar cards devidos em uma sessão (Prioridade: P1) 🎯 MVP

- [x] T013 Teste de integração do fluxo revelar → avaliar → próximo card → sessão concluída, em `tests/integration/study-card-screen.test.tsx` (contra mock; ver T045 para a versão contra SQLite real)
- [x] T018/T019 `SentenceReveal`/`GradeButtons` (nomes reais: `src/features/study/SentenceReveal.tsx`, `GradeButtons.tsx`)
- [x] T020/T021 Tela de sessão em `app/index.tsx` (rota única — `app/study/[deckId].tsx` não existe; ver nota de US2) com estado de "sessão concluída"

### Restante desta história para SQLite real

- [x] T045 [US1] `tests/integration/study-card-screen.test.tsx` reescrito para injetar um `Database` de teste (`node:sqlite`, `tests/support/testDeckFixture.ts`, pré-semeado) via prop, em vez do array mock estático
- [x] T046 [P] [US1] `cardRepository.getDueCards(db, deckId, now)` e `cardRepository.applyGrade(db, cardId, result, now)` implementados em `src/data/repositories/cardRepository.ts`
- [x] T047 [US1] `reviewRepository.recordReview(db, cardId, grade, now)` implementado em `src/data/repositories/reviewRepository.ts` — busca a carta, calcula `scheduleNextReview`, atualiza o Card e insere a linha de Review. Desvio do plano original: sem `withTransactionAsync` explícito — a interface `Database` deliberadamente não expõe transações (simplificação YAGNI documentada em `research.md`); assinatura final recebe `cardId` (não o objeto `card` inteiro), buscando a carta atual internamente
- [x] T048 [US1] `StudyCardScreen.tsx` reconectado: efeito inicial chama `openAppDatabase()` (ou `database` injetado) + `seedIfEmpty` + `getFirstDeck` + `getDueCards`/`getCardsForMastery`, com estado `loading` (`testID="study-loading"`) e estado vazio `no-cards-due`; `handleGrade` chama `reviewRepository.recordReview` dentro do `setTimeout` já existente e recarrega `masteryCards`/a carta avaliada do banco
- [x] `src/mocks/studyQueue.ts` removido — não era mais importado por nenhum código de produção após T048

**Checkpoint**: A fila de estudo passa a ser as cartas **devidas de verdade** (filtradas por `nextDueAt`), não as 4 cartas mock fixas — e o progresso sobrevive a um reload da página (verificado manualmente em T050).

---

## Fase 4: História de Usuário 2 - Ver o que está devido antes de estudar (Prioridade: P2)

- [x] T051 [P] [US2] Testes de `deckRepository.getDeckById`/`listWithDueCounts` em `tests/data/deckRepository.test.ts` (deck único, deck sem nenhum card — FR-010, múltiplos decks com contagens independentes) — DEVEM falhar antes de T052
- [x] T052 [US2] Implementar `getDeckById`/`listWithDueCounts` em `deckRepository.ts` (depende de T051); `getFirstDeck` removido (código morto após T056)
- [x] T053 [P] [US2] `src/data/useAppDatabase.ts`: extrai o bootstrap "abrir DB (ou `database` injetado) + `seedIfEmpty`" que antes vivia inline em `StudyCardScreen`, para ser reaproveitado pela lista de decks
- [x] T054 [US2] Teste `tests/integration/deck-list-screen.test.tsx` (nome+contagem por deck, deck em dia é no-op — FR-009, deck vazio distinto de em dia — FR-010, selecionar deck com pendências chama `onSelectDeck`) — DEVE falhar antes de T055
- [x] T055 [US2] `src/features/deckList/DeckListItem.tsx` + `DeckListScreen.tsx` (depende de T054, T052, T053); tela agnóstica de rota, expõe `onSelectDeck(deckId)`
- [x] T056 [US2] `StudyCardScreen.tsx`: troca `getFirstDeck()` por prop `deckId` obrigatória + `getDeckById`; adota `useAppDatabase`; adiciona prop `onFinishSession` e botão "Voltar aos decks" no estado de sessão concluída; `tests/integration/study-card-screen.test.tsx` atualizado (3 pontos de render + 1 teste novo para o botão)
- [x] T057 [US2] Rotas: `app/index.tsx` vira a lista de decks (`router.push` para `/study/[deckId]`); novo `app/study/[deckId].tsx` lê `deckId` via `useLocalSearchParams` e chama `router.back()` em `onFinishSession`. Ambas ficam finas e sem teste unitário próprio — sem precedente de teste de `expo-router` neste repo (nenhum mock, nenhum uso de `useRouter`/`useLocalSearchParams` em teste antes desta etapa); não compensa criar essa infraestrutura para uma única chamada de navegação. Validado manualmente (T058)
- [x] T058 [US2] Validado manualmente via `expo start --web` + Playwright: lista → deck com pendências (4 devidas) → sessão de estudo → avaliar tudo → "Sessão concluída" → "Voltar aos decks" → lista mostra o deck agora "Em dia" (prova que `listWithDueCounts` recalcula ao vivo). Bug encontrado e corrigido nesse processo: `router.back()` não remonta a rota anterior por padrão (o Stack do expo-router mantém a tela viva), então a lista ficava com a contagem desatualizada até um novo carregamento manual; corrigido com `useFocusEffect` em `app/index.tsx` remontando `DeckListScreen` via `key` sempre que a rota reganha foco — com uma guarda para não disparar na primeira montagem (evita abrir o banco duas vezes em sequência, o que chegou a produzir um erro real de "Access Handle" do SQLite via WASM/OPFS na web)

**Checkpoint**: A lista de decks mostra contagens reais e recalculadas a
cada leitura; um deck em dia não inicia uma sessão vazia; selecionar um
deck com pendências escopa a sessão a ele; a UI inteira (exceto a cola
fina de roteamento) tem cobertura de teste test-first.

---

## Fase 5: História de Usuário 3 - A nota de lembrança determina a próxima data de revisão (Prioridade: P1)

- [x] T028/T029 Cobertos por `tests/unit/scheduler.test.ts` (crescimento estrito, ordenação, Again curto) — a versão pura já prova SC-003/SC-004
- [x] T049 [US3] Teste de integração que avalia uma carta ao longo de vários ciclos **contra o BD real** (`tests/data/reviewRepository.test.ts`, adaptador `node:sqlite`) verificando que `intervalMinutes` cresce estritamente e que `Review.intervalBefore`/`intervalAfter` ficam auditáveis
- [x] T030 `intervalBefore`/`intervalAfter` já fazem parte do desenho do Review em `data-model.md` — persistidos por T047

**Checkpoint**: Comportamento de agendamento correto, provado tanto na
função pura (Fase 2) quanto de ponta a ponta contra SQLite real (T049).

---

## Fase 6: Polimento e Preocupações Transversais

- [x] T035 `README.md` de alto nível já existe
- [x] T032 **Cancelado, não adiado** — decisão de produto: não perseguir a licença Oxford (mesmo para uso pessoal, os termos de uso do Oxford Learner's Dictionaries não permitem copiar/redistribuir o material sem permissão por escrito, nem a lista "de referência" em PDF). Substituído por conteúdo 100% autoral: `src/content/seed/core-vocabulary-{a2,b1}.json`, 20 cartas por nível (40 no total), escrito do zero — ver `content-pipeline/SOURCES.md`. Nível A1 chegou a ser criado e foi removido a pedido do aprendiz (vocabulário considerado básico demais, conhecimento que já tem — o app parte de A2)
- [x] T033 [P] **Cancelado junto com T032** — sem pipeline de ingestão de terceiros para automatizar; crescer o vocabulário é escrever mais cartas no mesmo formato JSON, sem dependência externa
- [x] T050 Rodado manualmente com o BD real via `expo start --web` + Playwright: carregamento inicial semeia o banco (4 cartas devidas), avaliar 2 cartas reduz "2 hoje", e um reload completo da página **preserva** a carta atual e a contagem de devidas — prova de persistência real, não estado de componente. Lacuna encontrada e corrigida: faltava `metro.config.js` registrando `.wasm` como asset e os cabeçalhos COOP/COEP exigidos pelo worker WASM do `expo-sqlite` na web; sem isso a tela ficava presa em "Carregando…" indefinidamente. Modo avião não testado nesta etapa (fora do alcance do Playwright/web; comportamento offline já é garantido pela ausência de qualquer chamada de rede no caminho de dados, só SQLite local).

---

## Dependências e Ordem de Execução (Fase 2b + retomada de US1/US3)

- T036 (interface) e T037 (adaptador de teste) não têm dependências — podem começar imediatamente e em paralelo.
- T038 → T039 → T040 (schema testado → schema real → conexão real), em sequência.
- T041/T042 (conteúdo) são paralelos entre si e independentes do schema.
- T043 → T044 (seedLoader) depende de T040 e T042.
- T045 (teste) → T046/T047 (repositórios) → T048 (wiring da tela), nessa ordem — T048 é o único ponto em que a UI muda de fato.
- T049 pode ser escrito assim que T047 existir.

### Oportunidades de Paralelismo

- T036, T037 em paralelo.
- T041, T042 em paralelo.
- T046 e a escrita de T047 podem ser desenvolvidas lado a lado, mas T047 só fica "verde" depois que T046 existir (reviewRepository chama cardRepository internamente).

---

## Estratégia de Implementação (retomada)

1. Fase 2b completa (schema + db + seed, todos testados) antes de tocar em `StudyCardScreen.tsx`.
2. T045 (teste da tela contra BD real) escrito e falhando antes de T048.
3. T048 é o único commit que efetivamente troca a fonte de dados da tela — mudança cirúrgica, não uma reescrita.
4. **PARE e VALIDE**: `npm test`, `tsc --noEmit`, e manualmente via `expo start --web` — recarregar a página deve manter o progresso (prova de que é SQLite real, não estado de componente).
5. Deck list (Fase 4) e pipeline de conteúdo real (T032/T033) ficam para uma próxima etapa.

---

## Notas

- Tarefas [P] tocam arquivos diferentes e não têm dependências pendentes.
- O Princípio III da Constituição torna "escrever o teste primeiro"
  não-opcional para T038, T043, T045, T049 — a implementação
  correspondente não começa até o teste existir e falhar.
- Faça commit após cada tarefa ou grupo lógico, referenciando o ID da
  tarefa.
- Evite scope creep: sem contas, sincronização, decks personalizados,
  sessões combinadas entre múltiplos decks, ou lista de decks (Fase 4) —
  isso está explicitamente fora de escopo desta etapa.
