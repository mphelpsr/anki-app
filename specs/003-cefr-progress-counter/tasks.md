---

description: "Task list template for feature implementation"
---

# Tarefas: Contador Gamificado de Progresso CEFR

**Entrada**: Documentos de design de `/specs/003-cefr-progress-counter/`

**Pré-requisitos**: plan.md, spec.md, `002-mvp1-card-screen` já implementada

**Testes**: Incluídos para a lógica de "dominada"/progresso (Princípio III).

**Organização**: US1 = progresso de nível, US2 = badge de pendências do dia.

## Formato: `[ID] [P?] [Story] Descrição`

---

## Fase 1: Fundação (Mock estendido + lógica de domínio)

- [ ] T001 Escrever testes para `isMastered` e `levelProgress` em `tests/unit/mastery.test.ts` (limiares `repetitions >= 3` e `intervalDays >= 21`; percentual sempre em [0,100]; nível sem cartas dominadas = 0%; todas dominadas = 100%) — DEVE falhar antes da implementação
- [ ] T002 Implementar `src/domain/mastery.ts` (`isMastered`, `levelProgress`, `dueTodayCount`) para satisfazer T001 (depende de T001)
- [ ] T003 Estender `src/mocks/studyQueue.ts` com `cefrLevel`, `repetitions`, `intervalDays` por carta, cobrindo cenários de 0%, parcial e 100% dominado dentro do mesmo nível

**Checkpoint**: Lógica de progresso testada e independente de UI.

---

## Fase 2: História de Usuário 1 - Ver o progresso rumo ao nível atual (Prioridade: P1) 🎯

### Testes para a História de Usuário 1

- [ ] T004 [P] [US1] Atualizar `tests/integration/study-card-screen.test.tsx`: trocar as asserções de "N cartas restantes" pelas de "X% do \<nível\>" — DEVE falhar antes da implementação

### Implementação para a História de Usuário 1

- [ ] T005 [US1] Criar `src/features/study/LevelProgress.tsx` (recebe percentual + nível, renderiza "X% do \<nível\>")
- [ ] T006 [US1] Atualizar `src/features/study/StudyCardScreen.tsx` para usar `levelProgress` (T002) + `LevelProgress` (T005) no lugar de `RemainingCounter`
- [ ] T007 [US1] Remover `src/features/study/RemainingCounter.tsx` (papel absorvido por T005, ver plan.md)

**Checkpoint**: Progresso de nível exibido corretamente; testes de US1 passam.

---

## Fase 3: História de Usuário 2 - Badge de pendências do dia (Prioridade: P2)

### Testes para a História de Usuário 2

- [ ] T008 [P] [US2] Adicionar em `tests/integration/study-card-screen.test.tsx` a asserção do badge "N hoje" e de que seu estilo de fonte é menor que o de `LevelProgress` — DEVE falhar antes da implementação

### Implementação para a História de Usuário 2

- [ ] T009 [US2] Criar `src/features/study/DueTodayBadge.tsx` (recebe contagem, estilo visualmente secundário)
- [ ] T010 [US2] Conectar `DueTodayBadge` em `StudyCardScreen.tsx` usando `dueTodayCount` (T002) (depende de T009, T006)

**Checkpoint**: Os dois elementos (progresso + badge) funcionam juntos.

---

## Fase 4: Polimento

- [ ] T011 Rodar `npx expo start --web`, revisar visualmente e confirmar que o badge é claramente secundário ao progresso de nível (SC-003)
- [ ] T012 [P] Rodar `npx tsc --noEmit` e `npm test` completos

---

## Dependências e Ordem de Execução

- Fase 1 (Fundação) bloqueia as Fases 2 e 3.
- T001 antes de T002 (Princípio III).
- Fase 2 (US1) antes da Fase 3 (US2) — US2 se conecta na mesma tela que US1 já modificou.
- T007 (remover RemainingCounter) só depois de T006 confirmar que nada mais o usa.

## Notas

- Nenhum novo pacote/dependência é necessário.
- Commit após cada tarefa ou grupo lógico.
