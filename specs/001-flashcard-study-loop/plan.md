# Plano de Implementação: Loop de Estudo com Flashcards (MVP)

**Branch**: `001-flashcard-study-loop` | **Data**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `/specs/001-flashcard-study-loop/spec.md`

## Resumo

Construir o loop de estudo central: um aprendiz abre o app, vê o(s)
deck(s) semeados a partir das listas de palavras Oxford 3000/5000 com
contagens de devidos, estuda cards devidos um de cada vez (revelar
resposta → avaliar lembrança), e cada nota reagenda o card via um
algoritmo de repetição espaçada (SM-2) cujo intervalo cresce visivelmente
com notas boas consecutivas e reinicia com notas ruins. Tudo roda
totalmente offline contra um banco de dados SQLite no dispositivo; o
conteúdo é preparado antecipadamente por um pipeline de ingestão separado,
fora do runtime, e distribuído como um conjunto de dados semente
versionado.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (modo strict), Node.js 22 para scripts de ferramentas/pipeline

**Dependências Principais**: React Native + Expo (managed workflow), `expo-router` para navegação, `expo-sqlite` para persistência no dispositivo

**Armazenamento**: SQLite no dispositivo via `expo-sqlite` (um único arquivo de banco de dados local; nenhum banco de dados remoto para o MVP)

**Testes**: Jest + `@testing-library/react-native` para o código do app; Jest simples (sem dependência de RN) para o módulo puro do agendador e para o pipeline de ingestão de conteúdo

**Plataforma Alvo**: iOS e Android via Expo (uma única base de código React Native); Expo Go / EAS build para testes em dispositivo

**Tipo de Projeto**: App mobile — projeto Expo único (sem backend/API separado; o pipeline de conteúdo é um script Node independente, não um serviço em execução)

**Metas de Performance**: Revelação de resposta na tela de estudo e transição de nota-para-próximo-card renderizam em menos de 100ms de latência percebida em um dispositivo de gama média; cold start do app até o primeiro card devido em menos de 2s

**Restrições**: Totalmente capaz de operar offline (Princípio I da Constituição) — nenhuma chamada de rede está no caminho crítico de abrir o app, iniciar uma sessão, avaliar um card ou ver a próxima data de vencimento; o agendador DEVE ser um módulo puro e agnóstico de framework (Constituição: Restrições de Tecnologia e Dados)

**Escala/Escopo**: Um único aprendiz local, um punhado de decks (um por faixa CEFR da Oxford, ex.: A1-A2/B1/B2), da ordem de 3.000-5.000 cards no total entre todos os decks — confortavelmente dentro da capacidade do SQLite no dispositivo

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Reverificar após o design da Fase 1.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Offline-First, Propriedade Local | SQLite é a única fonte da verdade; nenhuma chamada de rede no caminho de estudar/avaliar/reagendar | PASSA |
| II. Repetição Espaçada É o Loop Central | Esta funcionalidade inteira *é* o loop central; nenhuma outra funcionalidade está sendo construída antes dela | PASSA |
| III. Testes Primeiro para Lógica de Domínio | O módulo do agendador e os repositórios são planejados com testes primeiro (ver Fase 1 data-model + tasks); telas recebem um teste de smoke por fluxo | PASSA (aplicado na escrita das tarefas) |
| IV. Pipeline de Conteúdo Rastreável e Respeitando Licenças | O dataset semente é produzido por um script separado em `content-pipeline/` que registra fonte/data/nível; material real da Oxford é condicionado a `content/SOURCES.md` confirmando os termos de licença — até lá o app distribui um pequeno dataset de amostra/placeholder com o mesmo formato | PASSA (com fallback explícito de placeholder primeiro) |
| V. Disciplina de MVP | Sem contas, sincronização, decks personalizados ou sessões combinadas entre múltiplos decks neste plano — condiz com as Suposições da spec | PASSA |

Nenhuma violação a justificar; o Rastreamento de Complexidade está vazio.

## Estrutura do Projeto

<!--
Nota de sincronização (implementação do SQLite real, 2026-08-08): a
árvore abaixo é a intenção original deste plano. Na prática, o app foi
construído incrementalmente por 002/003/004 antes da persistência real
existir, então a estrutura efetiva diverge em alguns pontos — ver
"Estrutura Real Atual" logo após a árvore original para o que
efetivamente existe no repositório nesta etapa.
-->


### Documentação (esta funcionalidade)

```text
specs/001-flashcard-study-loop/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0 (/speckit-plan)
├── data-model.md         # Saída da Fase 1 (/speckit-plan)
├── quickstart.md        # Saída da Fase 1 (/speckit-plan)
├── contracts/           # Saída da Fase 1 (/speckit-plan)
└── tasks.md             # Saída da Fase 2 (comando /speckit-tasks - NÃO criado pelo /speckit-plan)
```

### Código-fonte (raiz do repositório)

```text
app/                          # rotas baseadas em arquivo do expo-router (apenas telas, finas)
├── _layout.tsx
├── index.tsx                 # Lista de decks (História de Usuário 2)
└── study/
    └── [deckId].tsx          # Tela de sessão de estudo (Histórias 1 + 3)

src/
├── domain/
│   ├── scheduler.ts          # Função pura de agendamento SM-2 (sem imports de RN/Expo)
│   ├── scheduler.types.ts    # Tipos Grade, CardScheduleState, ScheduleResult
│   └── deck.ts                # Lógica de seleção de cards devidos / ordenação de sessão
├── data/
│   ├── db.ts                  # Conexão expo-sqlite + migrações
│   ├── schema.sql             # Tabelas Deck / Card / Review
│   └── repositories/
│       ├── deckRepository.ts
│       ├── cardRepository.ts
│       └── reviewRepository.ts
├── features/
│   ├── deckList/               # View-model + componentes da lista de decks
│   └── study/                  # View-model + componentes da sessão de estudo (flip de card, botões de nota)
└── content/
    └── seed/                   # Dataset(s) JSON versionado(s), consumido(s) na primeira execução
        └── oxford-3000-a1-a2.sample.json

content-pipeline/               # Script Node/TS independente, NÃO faz parte do runtime mobile
├── ingest-oxford.ts            # Lista de palavras fonte → JSON semente versionado
├── sources/                    # Material fonte bruto (no .gitignore até a licença ser confirmada)
└── SOURCES.md                  # Conforme Princípio IV da Constituição: fonte, data, nível, status de licença

tests/
├── unit/
│   ├── scheduler.test.ts       # História 3: crescimento/redução de intervalo, comportamento na primeira revisão
│   └── deck.test.ts            # Casos de borda da seleção de cards devidos
├── integration/
│   ├── study-session.test.ts   # História 1: fluxo completo de sessão contra um BD de teste semeado
│   └── deck-list.test.ts       # História 2: contagens de devidos, estados de deck vazio
└── content-pipeline/
    └── ingest-oxford.test.ts   # Formato/versionamento da saída do pipeline
```

### Estrutura Real Atual (após 002-004 + SQLite real + US2)

```text
app/
├── _layout.tsx
├── index.tsx                   # Lista de decks (US2) — router.push para /study/[deckId]
└── study/
    └── [deckId].tsx             # Sessão de estudo escopada a um deck; onFinishSession -> router.back()

src/
├── domain/
│   ├── scheduler.ts             # Grade/CardScheduleState/ScheduleResult inline (sem arquivo .types.ts separado)
│   ├── mastery.ts                # isMastered/levelProgress/dueTodayCount (003)
│   ├── formatInterval.ts         # Rótulos curtos e por extenso dos intervalos (004)
│   └── mockQueue.ts              # Navegação de fila mock (002) — permanece só para os testes/telas que ainda a usam
├── data/
│   ├── Database.ts               # Interface estrutural (execAsync/runAsync/getAllAsync/getFirstAsync)
│   ├── schema.ts                 # SCHEMA_SQL como string (não .sql — ver research.md)
│   ├── db.ts                     # openAppDatabase(): abre via expo-sqlite real
│   ├── seedLoader.ts              # Semeia Deck+Cards do JSON se o BD estiver vazio
│   ├── useAppDatabase.ts          # NOVO (US2): hook compartilhado abrir+semear, usado por DeckListScreen e StudyCardScreen
│   └── repositories/
│       ├── deckRepository.ts      # getDeckById/listWithDueCounts (US2); getFirstDeck removido (código morto)
│       ├── cardRepository.ts
│       └── reviewRepository.ts
├── content/
│   └── seed/                      # Conteúdo autoral definitivo (não mais placeholder — ver SOURCES.md)
│       ├── core-vocabulary-a1.json  # 20 cartas
│       ├── core-vocabulary-a2.json  # 20 cartas (4 originais + 16 novas)
│       └── core-vocabulary-b1.json  # 20 cartas
└── features/
    ├── deckList/                 # NOVO (US2): DeckListItem.tsx + DeckListScreen.tsx
    └── study/                    # RemainingCounter foi substituído por LevelProgress+DueTodayBadge (003);
                                   # GradeButtons/GradeFeedback/TranslationLine adicionados por 004;
                                   # StudyCardScreen agora recebe deckId + onFinishSession (US2)

content-pipeline/
└── SOURCES.md                    # Proveniência do dataset de amostra atual

tests/
├── unit/
│   ├── scheduler.test.ts
│   ├── mastery.test.ts
│   ├── formatInterval.test.ts
│   └── mockQueue.test.ts
├── integration/
│   ├── study-card-screen.test.tsx    # deckId/onFinishSession explícitos via FIXTURE_DECK_ID
│   └── deck-list-screen.test.tsx     # NOVO (US2): estados devido/em dia/vazio, onSelectDeck
├── data/                          # Repositórios contra SQLite real via node:sqlite
│   ├── schema.test.ts
│   ├── seedLoader.test.ts
│   ├── cardRepository.test.ts
│   ├── reviewRepository.test.ts
│   └── deckRepository.test.ts     # + getDeckById/listWithDueCounts (US2)
└── support/
    ├── nodeSqliteDatabase.ts      # Adaptador de teste (node:sqlite) para a interface Database
    └── testDeckFixture.ts        # 4 cartas devidas com estados de progresso mistos, usadas pelo teste de integração

metro.config.js                    # Registra `.wasm` como asset e cabeçalhos COOP/COEP —
                                    # exigidos pelo worker WebAssembly (wa-sqlite) do expo-sqlite na web;
                                    # sem isso a tela trava em "Carregando…" (ver quickstart/T050)
```

`app/index.tsx` e `app/study/[deckId].tsx` ficam intencionalmente finos
e sem teste unitário — não há precedente de teste de `expo-router` neste
repo, e não compensou criar essa infraestrutura para as duas chamadas de
navegação desta etapa (`router.push`/`router.back`). Validados manualmente
via Playwright (T058).

**Decisão de Estrutura**: Um único projeto Expo na raiz do repositório
(Tipo de Projeto: app mobile, sem backend). O agendador e a lógica de
seleção de cards devidos ficam em `src/domain/` como TypeScript puro, sem
nenhum import de React Native, conforme a restrição de testabilidade/
portabilidade da constituição — são testados diretamente com Jest,
independente do renderizador de teste do RN. A ingestão de conteúdo é um
script Node separado em `content-pipeline/` (não empacotado no runtime do
app); sua saída é um arquivo JSON estático que o app lê na primeira
execução, mantendo a rastreabilidade do Princípio IV (fonte/data/nível por
dataset) totalmente fora da base de código mobile.

## Rastreamento de Complexidade

*Nenhuma violação na Verificação da Constituição — tabela intencionalmente vazia.*
