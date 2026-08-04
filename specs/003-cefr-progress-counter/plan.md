# Plano de Implementação: Contador Gamificado de Progresso CEFR

**Branch**: `003-cefr-progress-counter` | **Data**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `/specs/003-cefr-progress-counter/spec.md`

## Resumo

Substituir o `RemainingCounter` (Elemento 1 de `002-mvp1-card-screen`) por
um indicador de progresso rumo ao nível CEFR atual (`X% do <nível>`),
calculado a partir de cartas mock marcadas como "dominadas"
(`repetitions >= 3` e `intervalDays >= 21`), mais um badge secundário e
discreto de pendências do dia. Continua sem SQLite/agendador reais — a
fila mock de `002` é estendida com os campos necessários.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (modo strict) — mesmo projeto de `002-mvp1-card-screen`

**Dependências Principais**: Nenhuma nova — reaproveita React Native/Expo já configurados

**Armazenamento**: N/A — extensão do mock local (`src/mocks/studyQueue.ts`)

**Testes**: Jest (lógica pura de "dominada"/progresso) + `@testing-library/react-native` (integração dos 2 cenários de usuário), seguindo o mesmo padrão de `002`

**Plataforma Alvo**: Mesma de `002` (Expo, validado também via `expo start --web`)

**Tipo de Projeto**: Mesma app mobile única

**Restrições**: Não pode alterar os outros 4 elementos de `002`; o
percentual nunca sai do intervalo [0, 100]

**Escala/Escopo**: 1 tela existente modificada, ~2 componentes novos, 1
função de domínio nova, mock estendido

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Reverificar após o design da Fase 1.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Offline-First, Propriedade Local | Cálculo 100% local sobre dados mock, sem rede | PASSA |
| II. Repetição Espaçada É o Loop Central | Não implementa nem substitui o agendador; usa os mesmos campos (`repetitions`, `intervalDays`) que `001-flashcard-study-loop/data-model.md` já reserva para o Card real, como leitura, não como novo contrato de agendamento | PASSA |
| III. Testes Primeiro para Lógica de Domínio | `isMastered` e o cálculo de percentual são funções puras testadas primeiro | PASSA |
| IV. Pipeline de Conteúdo Rastreável | N/A nesta fatia — mock, não conteúdo Oxford real | PASSA (não aplicável) |
| V. Disciplina de MVP | Escopo restrito à troca de um elemento visual + um badge secundário; nenhuma celebração, troca de nível ou avaliação real adicionada | PASSA |
| Requisitos em EARS / Cenários em BDD (emenda 1.1.0) | spec.md segue o formato | PASSA |

Nenhuma violação a justificar.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/003-cefr-progress-counter/
├── plan.md
├── tasks.md
└── checklists/
    └── requirements.md
```

### Código-fonte (raiz do repositório)

```text
src/
├── domain/
│   ├── mockQueue.ts            # inalterado (002)
│   └── mastery.ts              # NOVO: isMastered(card), levelProgress(cards, level)
├── mocks/
│   └── studyQueue.ts           # ESTENDIDO: + cefrLevel, repetitions, intervalDays por carta
└── features/
    └── study/
        ├── LevelProgress.tsx    # NOVO: substitui RemainingCounter — Elemento 1
        ├── DueTodayBadge.tsx    # NOVO: indicador secundário
        ├── RemainingCounter.tsx # REMOVIDO nesta feature (ver tasks.md)
        └── StudyCardScreen.tsx  # ATUALIZADO: usa LevelProgress + DueTodayBadge

tests/
└── unit/
    └── mastery.test.ts          # NOVO
    (tests/integration/study-card-screen.test.tsx é ATUALIZADO, não recriado)
```

**Decisão de Estrutura**: Mesma estrutura de `002`, sem novas pastas.
`RemainingCounter.tsx` é removido (não apenas deixado sem uso) porque seu
papel é inteiramente absorvido por `LevelProgress` + `DueTodayBadge` — não
há necessidade de manter dois caminhos para "contar cartas".

## Rastreamento de Complexidade

*Nenhuma violação — tabela intencionalmente vazia.*
