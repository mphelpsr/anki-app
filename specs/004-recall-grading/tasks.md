---

description: "Task list template for feature implementation"
---

# Tarefas: Avaliação de Lembrança com Agendador Real

**Entrada**: Documentos de design de `/specs/004-recall-grading/`

**Pré-requisitos**: plan.md, spec.md, `002` e `003` já implementadas

**Testes**: Incluídos para o agendador (Princípio III, NÃO NEGOCIÁVEL
para esta feature — é literalmente o loop central da constituição).

**Organização**: US1 = avaliação com tempo real, US2 = tradução.

## Formato: `[ID] [P?] [Story] Descrição`

---

## Fase 1: Fundação (Agendador real)

- [ ] T001 Escrever testes para `scheduleNextReview` em `tests/unit/scheduler.test.ts`, cobrindo as 6 regras do contrato atualizado (`specs/001-flashcard-study-loop/contracts/scheduler-contract.md`): determinismo, Again < 2min sempre (carta nova e carta graduada), ordenação Again<=Hard<=Good<=Easy, crescimento estrito após graduar, piso de ease 1,30, sem efeitos colaterais — DEVE falhar antes da implementação
- [ ] T002 Implementar `src/domain/scheduler.ts` (modelo de duas fases: aprendizagem em minutos + SM-2 em dias após graduar) para satisfazer T001 (depende de T001)
- [ ] T003 [P] Criar `src/domain/formatInterval.ts` (`formatInterval(minutes): string`, regra `<Nm`/`<Nh` abaixo de 1 dia, `Nd` a partir de 1 dia) com teste em `tests/unit/formatInterval.test.ts`
- [ ] T004 Atualizar `src/domain/mastery.ts`: renomear `intervalDays` → `intervalMinutes` em `MasteryCard`, ajustar limiar de "dominada" para minutos (21 dias = 30240 min), atualizar `tests/unit/mastery.test.ts` de acordo

**Checkpoint**: Agendador testado e independente de UI; `mastery.ts` consistente com a nova unidade.

---

## Fase 2: História de Usuário 1 - Avaliação com tempo real (Prioridade: P1) 🎯

### Testes para a História de Usuário 1

- [ ] T005 [P] [US1] Atualizar `tests/integration/study-card-screen.test.tsx`: após tocar "Reveal", esperar os 4 botões (Again/Hard/Good/Easy) em vez do botão sumir sem substituto; adicionar teste de que tocar em um botão avança a carta e atualiza `LevelProgress`/`DueTodayBadge` — DEVE falhar antes da implementação

### Implementação para a História de Usuário 1

- [ ] T006 [US1] Estender `StudyCardMock` em `src/mocks/studyQueue.ts` com `easeFactor`; renomear `intervalDays` → `intervalMinutes` (valores convertidos: dias × 1440)
- [ ] T007 [US1] Criar `src/features/study/GradeButtons.tsx`: recebe o estado atual da carta + `now`, usa `scheduleNextReview` (preview, sem mutar) para cada uma das 4 notas, renderiza rótulo via `formatInterval` acima de cada botão, dispara `onGrade(grade)` ao tocar
- [ ] T008 [US1] Atualizar `src/features/study/RevealButton.tsx`: rótulo "Reveal" (era "Revelar")
- [ ] T009 [US1] Atualizar `StudyCardScreen.tsx`: cards em `useState`; `handleGrade(grade)` chama `scheduleNextReview`, atualiza a carta atual no estado, avança a fila (reaproveitando `goNext`) e reseta `revealed`; renderizar `GradeButtons` no lugar de `RevealButton` quando `revealed === true` (depende de T002, T006, T007, T008)
- [ ] T010 [US1] Confirmar que `LevelProgress`/`DueTodayBadge` (de `003`) recebem os cards do estado mutável (não mais o `studyQueue` estático) para refletir avaliações ao vivo

**Checkpoint**: Avaliar uma carta muda seu agendamento e o progresso de nível em tempo real; testes de US1 passam.

---

## Fase 3: História de Usuário 2 - Tradução ao revelar (Prioridade: P2)

### Testes para a História de Usuário 2

- [ ] T011 [P] [US2] Adicionar em `tests/integration/study-card-screen.test.tsx` a asserção de que a tradução aparece após "Reveal" — DEVE falhar antes da implementação

### Implementação para a História de Usuário 2

- [ ] T012 [US2] Estender `StudyCardMock` com `translationBefore`/`translatedWord`/`translationAfter` para as 4 cartas mock existentes
- [ ] T013 [US2] Criar `src/features/study/TranslationLine.tsx` (mesmo padrão de composição de `SentenceReveal`, sem estado oculto — só renderiza quando `revealed`)
- [ ] T014 [US2] Conectar `TranslationLine` em `StudyCardScreen.tsx`, exibida abaixo da frase em inglês quando `revealed === true` (depende de T012, T013)

**Checkpoint**: As duas histórias funcionam juntas — revelar mostra tradução + 4 botões com tempo real.

---

## Fase 4: Polimento

- [ ] T015 Rodar `npx expo start --web`, revisar visualmente o fluxo completo (ocultar → Reveal → tradução + 4 botões → avaliar → próxima carta → sessão concluída na última)
- [ ] T016 [P] Rodar `npx tsc --noEmit` e `npm test` completos

---

## Dependências e Ordem de Execução

- Fase 1 bloqueia as Fases 2 e 3.
- T001 antes de T002 (Princípio III, não negociável aqui).
- Fase 2 (US1) antes da Fase 3 (US2) — a tradução é renderizada no mesmo bloco condicional que os botões passam a controlar.

## Notas

- Nenhum novo pacote é necessário.
- `formatInterval` fica em `src/domain/` (não em `features/`) por ser
  lógica pura reaproveitável (mesmo critério de `mastery.ts`/`scheduler.ts`).
- Commit após cada tarefa ou grupo lógico.
