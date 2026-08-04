# Plano de Implementação: Tela de Estudo — Card Mínimo (MVP1 Front-end)

**Branch**: `002-mvp1-card-screen` | **Data**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `/specs/002-mvp1-card-screen/spec.md`

## Resumo

Construir a primeira fatia visual do front-end: uma única tela Expo que
renderiza os 5 elementos definidos na spec (contador de restantes, imagem
da palavra, frase com blank revelável, botão "Revelar", setas
anterior/próxima) contra uma fila de cartas **mock** em memória — sem
banco de dados, sem agendador SM-2, sem pipeline de conteúdo real. Esta
funcionalidade também executa, como pré-requisito, o bootstrap do projeto
Expo que a Fase 1 (Setup) de `001-flashcard-study-loop/tasks.md` já
havia planejado, mas que ainda não tinha sido executado por nenhuma
funcionalidade.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (modo strict), Node.js 22

**Dependências Principais**: React Native + Expo (managed workflow),
`expo-router` (reaproveita a decisão de `001-flashcard-study-loop/
research.md`); nenhuma dependência de banco de dados nesta fatia
(`expo-sqlite` fica para quando a spec 001 for implementada de fato)

**Armazenamento**: N/A nesta fatia — fila de cartas é um array TypeScript
mock em `src/mocks/studyQueue.ts`, sem persistência

**Testes**: Jest + `@testing-library/react-native` para um teste de
integração por história de usuário, conforme Princípio III da
Constituição

**Plataforma Alvo**: iOS/Android via Expo; validado localmente também via
`expo start --web` para revisão visual rápida no navegador

**Tipo de Projeto**: App mobile (mesmo projeto Expo único que
`001-flashcard-study-loop` planeja — esta feature apenas o inicializa)

**Metas de Performance**: Revelar a palavra e navegar entre cartas devem
responder de forma instantânea (dados em memória, sem I/O)

**Restrições**: Nenhum elemento fora da lista de 5 do spec.md pode ser
renderizado nesta tela nesta fatia (ver "Fora de Escopo Explícito" na
spec)

**Escala/Escopo**: Uma tela, 5 componentes visuais, fila mock de 2-5
cartas

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Reverificar após o design da Fase 1.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Offline-First, Propriedade Local | Dados mock em memória; nenhuma chamada de rede na tela | PASSA |
| II. Repetição Espaçada É o Loop Central | Não violado: esta fatia não implementa nem substitui o agendador; "Revelar" é puramente visual, sem avaliação nem reagendamento (ver Suposições da spec) | PASSA |
| III. Testes Primeiro para Lógica de Domínio | A única lógica não trivial aqui é a navegação de fila (índice atual, habilitação de setas) em `src/domain/mockQueue.ts` — testada primeiro; a tela recebe 1 teste de integração por história de usuário | PASSA |
| IV. Pipeline de Conteúdo Rastreável | N/A nesta fatia — dados são mock explicitamente marcados como tal, não conteúdo Oxford real | PASSA (não aplicável) |
| V. Disciplina de MVP | Escopo deliberadamente restrito aos 5 elementos pedidos; todo o resto da referência visual foi explicitamente excluído na spec | PASSA |
| Requisitos em EARS / Cenários em BDD (emenda 1.1.0) | spec.md usa EARS para FR-001..FR-010 e Gherkin para os cenários de aceitação | PASSA |

Nenhuma violação a justificar; Rastreamento de Complexidade vazio.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/002-mvp1-card-screen/
├── plan.md              # Este arquivo
├── tasks.md             # Saída da Fase 2 (/speckit-tasks)
└── checklists/
    └── requirements.md
```

*(Sem research.md/data-model.md/contracts/quickstart.md dedicados nesta
fatia — as decisões de stack já estão em `001-flashcard-study-loop/
research.md` e são reaproveitadas; não há modelo de dados persistente
nem contrato de interface externa para uma tela com dados mock.)*

### Código-fonte (raiz do repositório)

```text
app/
├── _layout.tsx                # Layout raiz do expo-router (bootstrap desta feature)
└── index.tsx                  # Tela de estudo (temporariamente na rota raiz — ver Suposições)

src/
├── domain/
│   └── mockQueue.ts           # Lógica pura: índice atual, próxima/anterior, habilitação de setas
├── mocks/
│   └── studyQueue.ts          # 2-5 cartas de exemplo (imagem placeholder, frase, palavra-alvo)
└── features/
    └── study/
        ├── RemainingCounter.tsx   # Elemento 1: "N cartas restantes"
        ├── WordImage.tsx          # Elemento 2: imagem referente à palavra
        ├── SentenceReveal.tsx     # Elemento 3: frase com blank/palavra revelada
        ├── RevealButton.tsx       # Elemento 4: botão "Revelar"
        ├── NavArrows.tsx          # Elemento 5: setas anterior/próxima
        └── StudyCardScreen.tsx    # Composição dos 5 componentes acima

tests/
├── unit/
│   └── mockQueue.test.ts
└── integration/
    └── study-card-screen.test.tsx
```

**Decisão de Estrutura**: Reaproveita a estrutura de `001-flashcard-
study-loop/plan.md` (Expo + expo-router + `src/domain` puro +
`src/features`), mas inicializa apenas o subconjunto necessário para esta
tela — sem `src/data/` (BD) nem `content-pipeline/`, que pertencem à
implementação completa da spec 001. Isso mantém as duas features
compatíveis: quando 001 for implementada, `src/mocks/studyQueue.ts` é
substituído por dados reais do SQLite/pipeline sem precisar reescrever os
5 componentes de UI.

## Rastreamento de Complexidade

*Nenhuma violação na Verificação da Constituição — tabela intencionalmente vazia.*
