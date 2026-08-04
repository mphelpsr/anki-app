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

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário a tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto Expo único na raiz do repositório, conforme a Estrutura do
Projeto do plan.md: `app/` (rotas), `src/` (domain/data/features/content),
`content-pipeline/` (script independente), `tests/`.

---

## Fase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Inicialização do projeto e estrutura básica

- [ ] T001 Inicializar o projeto Expo + TypeScript na raiz do repositório (`package.json`, `tsconfig.json` em modo strict, `app.json`, `.gitignore` para `node_modules`/`.expo`)
- [ ] T002 [P] Instalar dependências principais: `expo-router`, `expo-sqlite`, e dependências de desenvolvimento `jest`, `@testing-library/react-native`, `ts-jest`/`babel-jest` conforme o preset do Jest do Expo
- [ ] T003 [P] Configurar ESLint + Prettier para TypeScript/React Native em `.eslintrc.js` / `.prettierrc`

**Checkpoint**: `npx expo start` inicia um app vazio; `npm test` roda (ainda sem testes).

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Infraestrutura central da qual toda história de usuário
depende — agendador, persistência e conteúdo semente. Nenhum trabalho de
história de usuário começa antes desta fase estar completa.

**⚠️ CRÍTICO**: Conforme o Princípio III da Constituição, T004 (testes)
DEVE ser escrita e DEVE falhar antes de T005 (implementação).

- [ ] T004 Escrever os testes de contrato do agendador em `tests/unit/scheduler.test.ts`, cobrindo cada regra de `contracts/scheduler-contract.md` (determinismo, encurtamento na nota 0, ordenação monotônica por nota, crescimento em sucessos consecutivos, piso do fator de facilidade, sem efeitos colaterais) — DEVE falhar (ainda sem implementação)
- [ ] T005 Implementar `scheduleNextReview` em `src/domain/scheduler.ts` conforme `contracts/scheduler-contract.md` e a tabela de transições de estado do `data-model.md`, para fazer T004 passar (depende de T004)
- [ ] T006 [P] Definir os tipos de domínio compartilhados (`Grade`, `CardScheduleState`, `ScheduleResult`) em `src/domain/scheduler.types.ts`
- [ ] T007 [P] Escrever o schema SQLite (tabelas Deck, Card, Review conforme `data-model.md`) em `src/data/schema.sql`
- [ ] T008 Implementar a conexão com o BD + o executor de migrações em `src/data/db.ts` (depende de T007)
- [ ] T009 [P] Criar o dataset de amostra (~20 cards, formato conforme `contracts/seed-content-schema.json`) em `src/content/seed/oxford-3000-a1-a2.sample.json`
- [ ] T010 [P] Criar `content-pipeline/SOURCES.md` registrando a fonte, data de extração e status de licença do dataset de amostra, conforme o Princípio IV da Constituição
- [ ] T011 Implementar o carregador de semeadura da primeira execução em `src/data/seedLoader.ts` — lê os arquivos JSON semente, insere linhas Deck/Card apenas se o BD estiver vazio (depende de T008, T009)
- [ ] T012 [P] Configurar o layout raiz do `expo-router` em `app/_layout.tsx`

**Checkpoint**: O agendador está implementado e testado de forma unitária
e isolada; o schema do BD, a conexão e a semeadura de primeira execução
funcionam de ponta a ponta (verificável abrindo o app em uma tela em
branco com o BD populado). A implementação das histórias de usuário pode
começar agora.

---

## Fase 3: História de Usuário 1 - Estudar cards devidos em uma sessão (Prioridade: P1) 🎯 MVP

**Objetivo**: O aprendiz estuda cards devidos um de cada vez (revelar →
avaliar → próximo card) até a sessão ser concluída.

**Teste Independente**: Semear um deck com alguns cards devidos, percorrer
a sessão completa avaliando todos os cards, e confirmar que ela termina
em um estado claro de "concluída" sem nenhum card repetido ou pulado
(spec História 1, quickstart.md §4).

### Testes para a História de Usuário 1

- [ ] T013 [P] [US1] Escrever o teste de integração para o fluxo completo da sessão de estudo (iniciar → revelar → avaliar → próximo card → sessão concluída) em `tests/integration/study-session.test.ts`, contra um BD de teste semeado — DEVE falhar antes da implementação

### Implementação para a História de Usuário 1

- [ ] T014 [US1] Implementar a query de cards devidos (`getDueCards(deckId, now)`) e `applyGrade` do `CardRepository` em `src/data/repositories/cardRepository.ts` (depende de T005 agendador, T008 db)
- [ ] T015 [US1] Implementar `ReviewRepository.recordReview` em `src/data/repositories/reviewRepository.ts` — chama o agendador, atualiza a linha do Card, anexa uma linha de Review em uma única transação (depende de T005, T014)
- [ ] T016 [US1] Implementar a lógica de ordenação de sessão de cards devidos em `src/domain/deck.ts` (função pura: dado os cards devidos + ids já avaliados nesta sessão, retorna o próximo card ou null)
- [ ] T017 [P] [US1] Construir o hook view-model da sessão de estudo `useStudySession` em `src/features/study/useStudySession.ts`, envolvendo T014-T016
- [ ] T018 [P] [US1] Construir o componente de visualização de card (revelar frente/verso) em `src/features/study/CardView.tsx`
- [ ] T019 [P] [US1] Construir o componente de botões de nota (4 notas) em `src/features/study/GradeButtons.tsx`
- [ ] T020 [US1] Construir a tela de sessão de estudo `app/study/[deckId].tsx`, conectando `useStudySession` + `CardView` + `GradeButtons` (depende de T017, T018, T019)
- [ ] T021 [US1] Implementar o estado de "sessão concluída" e o estado vazio de "deck sem nenhum card" em `app/study/[deckId].tsx`, conforme os Casos de Borda da spec

**Checkpoint**: A História de Usuário 1 está totalmente funcional e
testável/demonstrável de forma independente — `npm test -- study-session`
passa e o app pode ser estudado de ponta a ponta a partir de um único
deck.

---

## Fase 4: História de Usuário 2 - Ver o que está devido antes de estudar (Prioridade: P2)

**Objetivo**: O aprendiz vê o(s) deck(s) com contagens de devidos antes de
escolher um para estudar.

**Teste Independente**: Com um deck semeado de contagem de devidos
conhecida, abrir a lista de decks e confirmar que a contagem exibida
corresponde; selecionar o deck abre a sessão da História de Usuário 1 com
escopo nele (spec História 2, quickstart.md §3).

### Testes para a História de Usuário 2

- [ ] T022 [P] [US2] Escrever o teste de integração para as contagens de devidos da lista de decks e os estados de deck vazio em `tests/integration/deck-list.test.ts` — DEVE falhar antes da implementação

### Implementação para a História de Usuário 2

- [ ] T023 [US2] Implementar `DeckRepository.listWithDueCounts` em `src/data/repositories/deckRepository.ts` (conforme data-model.md: a contagem de devidos é derivada, nunca armazenada)
- [ ] T024 [P] [US2] Construir o hook view-model da lista de decks `useDeckList` em `src/features/deckList/useDeckList.ts`
- [ ] T025 [P] [US2] Construir o componente `DeckListItem` (nome + contagem de devidos + estado em dia) em `src/features/deckList/DeckListItem.tsx`
- [ ] T026 [US2] Construir a tela de lista de decks `app/index.tsx`, conectando `useDeckList` + `DeckListItem` e a navegação para `app/study/[deckId].tsx` (depende de T024, T025)
- [ ] T027 [US2] Implementar a distinção entre "nenhum card" e "em dia" na tela de lista de decks, conforme FR-010 da spec

**Checkpoint**: As Histórias de Usuário 1 E 2 funcionam de forma
independente — um aprendiz pode abrir o app, ver as contagens de devidos
e estudar a partir da lista de decks.

---

## Fase 5: História de Usuário 3 - A nota de lembrança determina a próxima data de revisão (Prioridade: P1)

**Objetivo**: Comprovar o comportamento de agendamento de ponta a ponta
através da camada de persistência, não apenas na função pura — avaliar
muda corretamente as datas de vencimento armazenadas e os intervalos
crescem/encolhem conforme especificado.

**Teste Independente**: Avaliar o mesmo card com nota baixa versus alta e
comparar o `nextDueAt` armazenado; repetir notas "boas" em um card e
confirmar que `intervalDays` cresce estritamente entre as revisões (spec
História 3, quickstart.md §5, SC-003/SC-004).

### Testes para a História de Usuário 3

- [ ] T028 [P] [US3] Escrever testes unitários para os casos de borda da seleção de cards devidos (card novo imediatamente devido, card com dificuldade volta para a sessão) em `tests/unit/deck.test.ts` — DEVE falhar antes da implementação
- [ ] T029 [P] [US3] Escrever um teste de integração que avalia um card ao longo de vários ciclos de revisão contra um BD SQLite real (arquivo temporário) e verifica que `Card.intervalDays` cresce estritamente ao longo de pelo menos 4 revisões "boas" consecutivas, e que uma nota baixa o reinicia, em `tests/integration/scheduling-growth.test.ts`

### Implementação para a História de Usuário 3

- [ ] T030 [US3] Garantir que `ReviewRepository.recordReview` (T015) persista `intervalBefore`/`intervalAfter` em cada linha de Review conforme `data-model.md`, para que o crescimento seja auditável a partir dos dados armazenados, não apenas recalculado
- [ ] T031 [US3] Verificar e, se necessário, ajustar `CardRepository.applyGrade` (T014) para que o piso do fator de facilidade (1,30) e o reinício na nota 0 sejam aplicados também na borda do repositório, não apenas dentro do agendador puro (defesa contra futuros chamadores que contornem o agendador)

**Checkpoint**: As três histórias de usuário estão funcionais de forma
independente. A alegação central de benchmark contra o AnkiApp
(comportamento de SRS correto) é verificada tanto no nível unitário (Fase
2) quanto de ponta a ponta através de persistência real (esta fase).

---

## Fase 6: Polimento e Preocupações Transversais

**Propósito**: Completar o que é necessário para rodar e validar a
funcionalidade como um todo, conforme quickstart.md.

- [ ] T032 [P] Escrever `content-pipeline/ingest-oxford.ts` (lê uma lista de palavras fonte, grava JSON semente conforme `contracts/seed-content-schema.json`) com um teste em `tests/content-pipeline/ingest-oxford.test.ts`
- [ ] T033 [P] Configurar os scripts `npm run content:ingest` e `npm test` em `package.json`
- [ ] T034 Rodar o `quickstart.md` de ponta a ponta manualmente (incluindo a verificação em modo avião/offline do §7) e corrigir qualquer lacuna encontrada
- [ ] T035 [P] Escrever um `README.md` de alto nível resumindo o app, o fluxo de trabalho spec-kit usado e como rodar o `quickstart.md`

---

## Dependências e Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — começar imediatamente.
- **Fundação (Fase 2)**: Depende do Setup. BLOQUEIA todas as histórias de
  usuário — em particular, o agendador (T004-T005) precisa estar testado
  e implementado antes de qualquer lógica de avaliação (US1, US3).
- **Histórias de Usuário (Fase 3-5)**: Todas dependem da conclusão da
  Fundação.
  - US1 (P1) e US2 (P2) são independentes entre si e podem prosseguir em
    paralelo assim que a Fundação estiver pronta.
  - US3 (P1) depende da camada de repositório da US1 (T014, T015) já
    existir, já que ela verifica o comportamento de agendamento através
    desses mesmos repositórios em vez de duplicá-los — então construa a
    US1 antes da US3, mesmo que ambas sejam P1.
- **Polimento (Fase 6)**: Depende da conclusão das três histórias de
  usuário.

### Dentro de Cada História de Usuário

- Os testes são escritos primeiro e DEVEM falhar antes das tarefas de
  implementação correspondentes (Princípio III da Constituição).
- Repositórios antes de view-models; view-models antes de telas.
- História concluída e seu checkpoint verificado antes de avançar para a
  próxima.

### Oportunidades de Paralelismo

- T002, T003 (Setup) em paralelo.
- T006, T007, T009, T010, T012 (Fundação, arquivos distintos) em paralelo
  assim que T004/T005 estiverem prontas.
- T017, T018, T019 (view-model/componentes da US1, arquivos distintos) em
  paralelo.
- T024, T025 (view-model/componente da US2, arquivos distintos) em
  paralelo.
- T028, T029 (testes da US3, arquivos distintos) em paralelo.
- As fases de implementação de US1 e US2 podem rodar em paralelo entre
  dois desenvolvedores assim que a Fundação estiver pronta; US3 deve vir
  depois da US1.

---

## Exemplo de Paralelismo: História de Usuário 1

```bash
# Depois que T014-T016 (repositórios/domínio) estiverem prontas, estas podem rodar juntas:
Task: "Construir o hook useStudySession em src/features/study/useStudySession.ts"
Task: "Construir o componente CardView em src/features/study/CardView.tsx"
Task: "Construir o componente GradeButtons em src/features/study/GradeButtons.tsx"
```

---

## Estratégia de Implementação

### MVP Primeiro (Apenas História de Usuário 1)

1. Completar a Fase 1: Setup.
2. Completar a Fase 2: Fundação (agendador + BD + semente — CRÍTICO).
3. Completar a Fase 3: História de Usuário 1.
4. **PARE e VALIDE**: rode `tests/integration/study-session.test.ts` e o
   quickstart.md §4 manualmente.
5. Isso sozinho já é um MVP demonstrável: um deck, loop de estudo
   completo, agendamento real por baixo dos panos.

### Entrega Incremental

1. Setup + Fundação → fundação pronta.
2. Adicionar US1 → validar de forma independente → MVP demonstrável.
3. Adicionar US2 → validar de forma independente → lista de decks sobre o
   mesmo loop.
4. Adicionar US3 → validar de forma independente → correção do
   agendamento comprovada de ponta a ponta, não apenas na função pura.
5. Polimento → pipeline de conteúdo, documentação, passagem completa do
   quickstart.

---

## Notas

- Tarefas [P] tocam arquivos diferentes e não têm dependências
  pendentes.
- O Princípio III da Constituição torna a nota "escrever o teste
  primeiro" acima não opcional para T004, T013, T022, T028, T029, T032 —
  tarefas de implementação que seguem uma tarefa de teste não devem
  começar até que esse teste esteja escrito e falhando.
- Faça commit após cada tarefa ou grupo lógico, referenciando o ID da
  tarefa.
- Evite scope creep: sem contas, sincronização, decks personalizados ou
  sessões combinadas entre múltiplos decks — isso está explicitamente
  fora de escopo conforme as Suposições do spec.md e o Princípio V da
  Constituição.
