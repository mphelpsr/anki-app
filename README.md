# AnkiApp-Benchmark

Um app mobile de flashcards com o [AnkiApp](https://www.ankiapp.com/) como
benchmark, construído com abordagem spec-first usando o
[GitHub spec-kit](https://github.com/github/spec-kit). O MVP é um loop de
estudo com repetição espaçada, semeado com vocabulário derivado das
listas de palavras Oxford 3000/5000.

## Status

O spec-kit está configurado e a funcionalidade do MVP está totalmente
especificada, planejada e quebrada em tarefas. Nenhum código de aplicação
foi implementado ainda — este repositório contém atualmente os artefatos
de governança e design que a implementação vai seguir.

## Governança do projeto: spec-kit

Este repositório segue um fluxo de trabalho orientado por especificação:
toda funcionalidade passa por
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
antes de o código ser escrito, condicionado pelas regras em
[`.specify/memory/constitution.md`](.specify/memory/constitution.md).

Destaques da constituição:

- **Offline-first, propriedade local** — o app funciona totalmente sem
  conexão de rede; não há backend para o MVP.
- **Repetição espaçada é o loop central (não negociável)** — o loop
  mostrar card → avaliar → reagendar é lançado antes de qualquer outra
  funcionalidade.
- **Testes primeiro para lógica de domínio** — o algoritmo de agendamento
  e o pipeline de conteúdo são escritos com testes primeiro; todo fluxo
  voltado ao usuário recebe ao menos um teste de integração.
- **Pipeline de conteúdo rastreável e respeitando licenças** — material
  fonte da Oxford só é empacotado depois que seus termos de licença são
  confirmados e registrados em `content-pipeline/SOURCES.md`; até lá, o
  app é lançado com um dataset placeholder/amostra do mesmo formato.
- **Disciplina de MVP** — sem contas, sincronização ou decks
  personalizados até que o loop central esteja comprovado.

## Funcionalidade atual: Loop de Estudo com Flashcards (MVP)

Spec, plano e tarefas estão em
[`specs/001-flashcard-study-loop/`](specs/001-flashcard-study-loop/):

| Artefato | O que cobre |
|---|---|
| [`spec.md`](specs/001-flashcard-study-loop/spec.md) | Histórias de usuário, requisitos funcionais, critérios de sucesso (o quê/por quê, sem detalhe de implementação) |
| [`plan.md`](specs/001-flashcard-study-loop/plan.md) | Stack técnica (React Native + Expo, `expo-sqlite`), estrutura do projeto, verificação de conformidade com a constituição |
| [`research.md`](specs/001-flashcard-study-loop/research.md) | Decisões sobre algoritmo de agendamento (SM-2), persistência, navegação e testes |
| [`data-model.md`](specs/001-flashcard-study-loop/data-model.md) | Entidades Deck / Card / Review e transições de estado de agendamento |
| [`contracts/`](specs/001-flashcard-study-loop/contracts/) | Contrato da função do agendador; schema JSON do conteúdo semente |
| [`quickstart.md`](specs/001-flashcard-study-loop/quickstart.md) | Passos de validação manual + automatizada assim que implementado |
| [`tasks.md`](specs/001-flashcard-study-loop/tasks.md) | Tarefas de implementação ordenadas por dependência, com testes primeiro |

Stack planejada: **React Native (Expo) + TypeScript**, **SQLite** no
dispositivo para decks/cards/histórico de revisões, um módulo agendador
**SM-2** em TypeScript puro, e um script Node independente de ingestão que
transforma listas de palavras Oxford em um dataset semente versionado
(que não roda dentro do próprio app).

## Trabalhando com este repositório

- Leia o `spec.md` de uma funcionalidade antes do `plan.md`, e o
  `plan.md` antes do `tasks.md` — cada um é gerado a partir do anterior.
- Para iniciar uma nova funcionalidade: `/speckit-specify <descrição>`.
- Para validar a consistência entre spec/plan/tasks antes de implementar:
  `/speckit-analyze`.
- Para implementar as tarefas de uma funcionalidade em ordem:
  `/speckit-implement`.
- Emendas aos princípios do projeto passam por `/speckit-constitution`,
  não por edições ad-hoc em `constitution.md`.
