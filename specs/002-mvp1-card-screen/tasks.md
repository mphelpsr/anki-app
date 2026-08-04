---

description: "Task list template for feature implementation"
---

# Tarefas: Tela de Estudo — Card Mínimo (MVP1 Front-end)

**Entrada**: Documentos de design de `/specs/002-mvp1-card-screen/`

**Pré-requisitos**: plan.md, spec.md

**Testes**: Incluídos para a lógica de navegação de fila (Princípio III
da Constituição); a tela recebe um teste de integração por história de
usuário.

**Organização**: US1 = ver/revelar card, US2 = navegar entre cartas.

## Formato: `[ID] [P?] [Story] Descrição`

---

## Fase 1: Setup (Bootstrap do projeto Expo)

**Propósito**: Esta é a primeira feature a gerar código — inicializa o
projeto Expo que `001-flashcard-study-loop` também vai usar.

- [ ] T001 Inicializar o projeto Expo + TypeScript na raiz do repositório (`package.json`, `tsconfig.json` em modo strict, `app.json`, `.gitignore`)
- [ ] T002 [P] Instalar dependências: `expo-router`, `react-native-web` (para `expo start --web`), dependências de dev `jest`, `@testing-library/react-native`
- [ ] T003 [P] Configurar ESLint + Prettier em `.eslintrc.js` / `.prettierrc`
- [ ] T004 Configurar o layout raiz do `expo-router` em `app/_layout.tsx`

**Checkpoint**: `npx expo start --web` abre um app vazio no navegador.

---

## Fase 2: Fundação (Dados mock + lógica de fila)

**Propósito**: Base compartilhada pelas duas histórias de usuário.

- [ ] T005 Escrever testes para a lógica de fila (índice atual, `next`, `previous`, `canGoNext`, `canGoPrevious`) em `tests/unit/mockQueue.test.ts` — DEVE falhar antes da implementação
- [ ] T006 Implementar `src/domain/mockQueue.ts` (função pura, sem imports de RN) para satisfazer T005 (depende de T005)
- [ ] T007 [P] Criar a fila mock de 3-5 cartas (imagem placeholder, frase com marcação de onde a palavra entra, palavra-alvo) em `src/mocks/studyQueue.ts`, conforme a entidade "Carta de Estudo (mock)" do spec.md

**Checkpoint**: Lógica de fila testada e independente de UI.

---

## Fase 3: História de Usuário 1 - Ver e revelar o card de estudo (Prioridade: P1) 🎯 MVP

**Objetivo**: Ver o contador, a imagem e a frase com blank; revelar a
palavra ao tocar em "Revelar".

**Teste Independente**: Abrir a tela com a fila mock, ver a palavra
oculta, tocar "Revelar", ver a palavra aparecer sublinhada na frase.

### Testes para a História de Usuário 1

- [ ] T008 [P] [US1] Escrever teste de integração cobrindo os 3 cenários BDD da História 1 (contagem no topo, card com palavra oculta, revelar) em `tests/integration/study-card-screen.test.tsx` — DEVE falhar antes da implementação

### Implementação para a História de Usuário 1

- [ ] T009 [P] [US1] Implementar `RemainingCounter` (Elemento 1) em `src/features/study/RemainingCounter.tsx` — recebe a contagem e renderiza "N cartas restantes"
- [ ] T010 [P] [US1] Implementar `WordImage` (Elemento 2) em `src/features/study/WordImage.tsx` — renderiza a imagem placeholder da carta atual
- [ ] T011 [P] [US1] Implementar `SentenceReveal` (Elemento 3) em `src/features/study/SentenceReveal.tsx` — renderiza a frase com blank sublinhado ou a palavra revelada sublinhada, conforme prop `revealed`
- [ ] T012 [P] [US1] Implementar `RevealButton` (Elemento 4) em `src/features/study/RevealButton.tsx` — botão "Revelar" que dispara `onReveal`, desabilitado/oculto se já revelado (FR-010: idempotente)
- [ ] T013 [US1] Implementar `StudyCardScreen` em `src/features/study/StudyCardScreen.tsx`, compondo T009-T012 com estado local `revealed` por carta (depende de T009, T010, T011, T012, T006)
- [ ] T014 [US1] Renderizar `StudyCardScreen` em `app/index.tsx` usando `src/mocks/studyQueue.ts` (depende de T013, T007)

**Checkpoint**: História de Usuário 1 funcional e testável de forma
independente — `npm test -- study-card-screen` cobre os 3 cenários BDD.

---

## Fase 4: História de Usuário 2 - Navegar entre as cartas da fila (Prioridade: P2)

**Objetivo**: Setas anterior/próxima navegam a fila mock, reiniciando o
estado de revelado a cada carta, com desabilitação nas pontas.

**Teste Independente**: Navegar até a última carta e confirmar seta
direita desabilitada; voltar até a primeira e confirmar seta esquerda
desabilitada.

### Testes para a História de Usuário 2

- [ ] T015 [P] [US2] Escrever teste de integração cobrindo os 4 cenários BDD da História 2 (avançar, retroceder, seta esquerda desabilitada na 1ª, seta direita desabilitada na última) em `tests/integration/study-card-screen.test.tsx` (mesmo arquivo de T008) — DEVE falhar antes da implementação

### Implementação para a História de Usuário 2

- [ ] T016 [US2] Implementar `NavArrows` (Elemento 5) em `src/features/study/NavArrows.tsx` — duas setas com props `canGoPrevious`/`canGoNext` e callbacks `onPrevious`/`onNext`
- [ ] T017 [US2] Conectar `NavArrows` a `StudyCardScreen` usando `src/domain/mockQueue.ts` (T006) para calcular índice atual e habilitação das setas; reiniciar `revealed` para `false` ao trocar de carta (depende de T016, T013, T006)

**Checkpoint**: As duas histórias de usuário funcionam juntas — a tela
completa dos 5 elementos, navegável, corresponde ao escopo do spec.md.

---

## Fase 5: Polimento

- [ ] T018 [P] Ajustar estilos (cores, tipografia, espaçamento) para aproximar visualmente da referência fornecida pelo usuário, dentro dos 5 elementos em escopo
- [ ] T019 Rodar `npx expo start --web`, revisar visualmente no navegador e ajustar divergências encontradas em relação ao spec.md

---

## Dependências e Ordem de Execução

- **Setup (Fase 1)** → **Fundação (Fase 2)** → Histórias de Usuário (Fase 3, depois Fase 4 — US2 depende da tela que US1 constrói) → **Polimento (Fase 5)**.
- T005 (teste) antes de T006 (implementação) — Princípio III da Constituição.
- T008/T015 (testes) antes das implementações correspondentes de cada história.

## Estratégia de Implementação

1. Fase 1 + Fase 2 → projeto roda vazio, lógica de fila testada.
2. Fase 3 (US1) → **PARE e VALIDE**: os 3 primeiros elementos (contador,
   imagem, frase) e o botão Revelar funcionam contra a fila mock.
3. Fase 4 (US2) → setas conectadas, os 5 elementos completos.
4. Fase 5 → revisão visual final comparando com a referência.

## Notas

- Nenhuma tarefa aqui cria `src/data/`, `expo-sqlite` ou
  `content-pipeline/` — isso pertence à implementação completa de
  `001-flashcard-study-loop`, que reaproveitará o bootstrap desta feature.
- Commit após cada tarefa ou grupo lógico.
