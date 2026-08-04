# Especificação da Funcionalidade: Contador Gamificado de Progresso CEFR

**Branch da Feature**: `003-cefr-progress-counter`

**Criada em**: 2026-08-04

**Status**: Rascunho

**Entrada**: Descrição do usuário: "Replace the raw remaining-card counter with a gamified CEFR-level progress indicator (percent of words mastered toward the current level, e.g. A2/B1/B2), plus a smaller secondary due-today badge"

**Contexto e motivação**: em conversa, foi identificado que um contador
puro de "cartas restantes" (elemento 1 de
[`002-mvp1-card-screen/spec.md`](../002-mvp1-card-screen/spec.md)) tende a
reproduzir um problema observado em outros apps de benchmark: perder um
dia de estudo acumula uma fila grande (relatado: 200+ frases), o que
desanima a continuar. A proposta é substituir esse contador por um
indicador de progresso rumo ao nível CEFR atual (ao estilo Duolingo),
baseado em quantas palavras já são consideradas dominadas — sem prometer
fluência real, apenas uma visão mais motivadora do que acúmulo puro.

**Escopo desta funcionalidade**: substitui o Elemento 1 ("N cartas
restantes") da tela de estudo por um indicador de progresso de nível, e
adiciona um indicador secundário e discreto de pendências do dia. Os
demais 4 elementos de `002-mvp1-card-screen` (imagem, frase revelável,
botão Revelar, setas) não mudam. Segue a mesma base de dados mock local
(sem SQLite/agendador reais ainda — ver Suposições).

## Cenários e Testes do Usuário *(obrigatório)*

### História de Usuário 1 - Ver o progresso rumo ao nível atual (Prioridade: P1)

Ao abrir a tela de estudo, o aprendiz vê, no lugar do contador de
restantes, um percentual de progresso rotulado com o nível CEFR atual
(ex.: "40% do A2"), calculado a partir de quantas palavras desse nível já
são consideradas dominadas.

**Por que essa prioridade**: É a mudança central pedida — resolve
diretamente o problema de desânimo por acúmulo, dando uma métrica de
avanço em vez de dívida.

**Teste Independente**: Com uma fila mock onde um número conhecido de
cartas do nível atual está marcado como dominado e outras não, abrir a
tela e conferir que o percentual exibido corresponde a
`dominadas / total do nível`.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Progresso exibido com base em palavras dominadas
  Dado que o nível atual é "A2" com 10 palavras no total
  E que 4 dessas palavras estão marcadas como dominadas
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir "40% do A2"

Cenário: Progresso em 0% quando nenhuma palavra foi dominada
  Dado que nenhuma carta do nível atual está marcada como dominada
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir "0% do <nível atual>"

Cenário: Progresso em 100% quando todas as palavras estão dominadas
  Dado que todas as cartas do nível atual estão marcadas como dominadas
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir "100% do <nível atual>"
```

---

### História de Usuário 2 - Não perder o sinal prático de pendências do dia (Prioridade: P2)

Junto ao progresso de nível, o aprendiz ainda consegue ver, de forma
discreta, quantas cartas estão devidas hoje — para planejar a sessão sem
que esse número volte a ser o elemento emocionalmente dominante da tela.

**Por que essa prioridade**: Reduz o risco de simplesmente trocar um
problema (ansiedade por acúmulo) por outro (perda de previsibilidade da
sessão). É secundária porque a tela continua funcional e já resolve o
pedido principal sem ela.

**Teste Independente**: Com uma fila mock de tamanho conhecido, abrir a
tela e conferir que o indicador de pendências do dia mostra o número
correto e é visualmente menos destacado que o progresso de nível (fonte
menor).

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Indicador secundário de pendências do dia
  Dado que 3 cartas do nível atual estão devidas hoje
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir um indicador com "3 hoje"
  E esse indicador deve ser visualmente menos proeminente que o progresso de nível
```

---

### Casos de Borda

- O que acontece se a fila mock não tiver nenhuma palavra do nível atual?
  Fora de escopo nesta fatia — assume-se ao menos uma carta do nível atual
  (ver Suposições).
- O que acontece se o percentual calculado dobrar por arredondamento acima
  de 100 (ex.: mais dominadas do que o total, por inconsistência de
  dados)? O sistema DEVE limitar a exibição a 100% (ver FR-004).
- O percentual é sempre um número inteiro exibido (sem casas decimais),
  para manter a leitura rápida — arredondamento é responsabilidade da
  implementação, não muda o requisito.

## Requisitos *(obrigatório)*

### Requisitos Funcionais (EARS)

- **FR-001** (Onipresente): O sistema DEVE exibir, no lugar do contador de
  cartas restantes, o percentual de palavras dominadas em relação ao
  total de palavras do nível CEFR atual.
- **FR-002** (Onipresente): O sistema DEVE rotular esse percentual com o
  nível CEFR ao qual ele se refere (ex.: "40% do A2").
- **FR-003** (Onipresente): O sistema DEVE considerar uma carta como
  "dominada" quando `repetitions >= 3` E `intervalDays >= 21` (ver
  Suposições sobre a origem provisória desses limiares).
- **FR-004** (Comportamento indesejado): SE o número de cartas dominadas
  calculado exceder o total de cartas do nível (por inconsistência de
  dados), ENTÃO o sistema DEVE exibir no máximo 100%.
- **FR-005** (Onipresente): O sistema DEVE exibir, de forma visualmente
  secundária (fonte menor, menos contraste) em relação ao progresso de
  nível, a quantidade de cartas do nível atual devidas hoje.
- **FR-006** (Estado): ENQUANTO nenhuma carta do nível atual estiver
  dominada, o sistema DEVE exibir o progresso como "0% do \<nível\>", sem
  ocultar o indicador.
- **FR-007** (Estado): ENQUANTO todas as cartas do nível atual estiverem
  dominadas, o sistema DEVE exibir "100% do \<nível\>".

### Fora de Escopo Explícito

Comemoração/tela de "nível concluído" ao atingir 100%; troca do nível
atual pelo aprendiz dentro desta tela; painel com progresso de múltiplos
níveis simultaneamente; qualquer wiring real de avaliação/agendamento
(a UI de avaliação continua fora de escopo, como em `002`) — os estados
de "dominada" usados aqui vêm de dados mock, não de reviews reais ainda.

### Entidades Principais

- **Carta de Estudo (mock, estendida)**: além dos campos já existentes em
  `002-mvp1-card-screen` (frase, palavra, emoji), passa a ter
  `cefrLevel`, `repetitions` e `intervalDays` — os dois últimos são os
  mesmos campos já reservados para o Card real em
  `001-flashcard-study-loop/data-model.md`, aqui simulados.
- **Progresso de Nível (derivado, não armazenado)**: percentual de cartas
  do nível atual consideradas dominadas (FR-003) em relação ao total de
  cartas desse nível na fila mock. Recalculado a cada leitura, nunca
  persistido — mesmo princípio já aplicado ao `dueCount` do Deck em
  `001-flashcard-study-loop/data-model.md`.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um aprendiz consegue, olhando só o topo da tela, dizer
  corretamente o nível CEFR atual e o percentual de progresso, sem
  precisar contar cartas manualmente.
- **SC-002**: Em 100% das combinações possíveis de dominadas/total na
  fila mock, o percentual exibido é sempre um valor entre 0 e 100
  (nunca negativo, nunca acima de 100).
- **SC-003**: O indicador de pendências do dia nunca é, visualmente, o
  elemento de maior destaque (tamanho de fonte/contraste) da parte
  superior da tela — o progresso de nível sempre é.

## Suposições

- Os limiares de "dominada" (`repetitions >= 3`, `intervalDays >= 21`) são
  um ponto de partida de produto, não uma regra definitiva — servem para
  tornar o progresso demonstrável nesta fatia e podem ser recalibrados
  depois de uso real com o agendador SM-2 verdadeiro (`001`).
- O "nível atual" é fixo por sessão/deck mock nesta fatia; não há troca de
  nível nem visão combinada de múltiplos níveis.
- O total de palavras do nível atual, nesta fatia, é o tamanho da fila
  mock filtrada por `cefrLevel`, não a contagem real de um nível Oxford
  (que só existirá quando o pipeline de conteúdo de `001` for
  implementado). A fórmula do percentual não muda quando isso acontecer —
  só a fonte do denominador.
- Mantém-se um indicador secundário de pendências do dia (em vez de
  removê-lo por completo) para não perder o sinal prático de planejamento
  de sessão — decisão tomada em conversa como o padrão a seguir, ajustável
  se, na prática, ainda parecer estressante.
- Esta funcionalidade não valida nem invalida a definição de "dominada"
  como proxy de fluência real — apenas torna o progresso mais visível e
  motivador, como reconhecido na conversa que originou este pedido.
