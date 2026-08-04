# Especificação da Funcionalidade: Tela de Estudo — Card Mínimo (MVP1 Front-end)

**Branch da Feature**: `002-mvp1-card-screen`

**Criada em**: 2026-08-04

**Status**: Rascunho

**Entrada**: Descrição do usuário: "MVP1 front-end: minimal study card screen matching the reference experience (remaining-count header, word image, sentence with reveal-on-tap blank, Revelar button, prev/next arrows only)"

**Escopo desta funcionalidade**: esta é uma fatia deliberadamente estreita
da História de Usuário 1 de
[`specs/001-flashcard-study-loop/spec.md`](../001-flashcard-study-loop/spec.md) —
o primeiro incremento visual/interativo para começar o front-end. Cobre
**apenas** os cinco elementos abaixo, com base na referência visual
fornecida pelo usuário (duas capturas de tela: card antes e depois de
revelado). Todos os demais elementos presentes na referência (badge CEFR,
anel de progresso, botão de configurações, seta de voltar, título da
palavra isolado, tradução em português, ícones de livro/nota/áudio/dica,
"Modo de resposta" e os botões de avaliação X/"Nunca mais"/✓) estão
**fora de escopo** aqui e ficam para incrementos futuros (parte deles já
está coberta em termos de comportamento pela spec 001, ex.: avaliação de
recall).

## Cenários e Testes do Usuário *(obrigatório)*

### História de Usuário 1 - Ver e revelar o card de estudo (Prioridade: P1)

Um aprendiz abre a tela de estudo e vê, no topo, quantas cartas restam na
fila atual. Abaixo, vê a imagem que ilustra a palavra da carta atual e uma
frase em inglês usando essa palavra — mas com a palavra oculta por um
sublinhado. Ao tocar em "Revelar", o sublinhado dá lugar à palavra em
inglês, ainda sublinhada, dentro da própria frase.

**Por que essa prioridade**: É o núcleo visual do produto — sem isso não
há nada para "começar o front-end". Corresponde diretamente aos
Cenários de Aceitação 1 e 2 da História 1 em `001-flashcard-study-loop`
(mostrar frente, revelar resposta), mas isolado da lógica de avaliação e
agendamento, que ainda não está implementada.

**Teste Independente**: Com uma fila mock de 2-3 cartas, abrir a tela,
conferir que a palavra está oculta na frase, tocar "Revelar" e confirmar
que a palavra aparece sublinhada no lugar certo da frase.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Contagem de cartas restantes ao abrir a tela
  Dado que a fila de estudo contém 5 cartas
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir "5 cartas restantes" no topo da tela

Cenário: Card exibido com a palavra oculta
  Dado que o aprendiz está vendo uma carta que ainda não foi revelada
  Então a imagem referente à palavra da carta deve estar visível
  E a frase deve mostrar um espaço sublinhado no lugar da palavra em inglês
  E o botão "Revelar" deve estar visível e habilitado

Cenário: Revelar a palavra da carta atual
  Dado que o aprendiz está vendo uma carta com a palavra oculta
  Quando o aprendiz toca no botão "Revelar"
  Então a frase deve mostrar a palavra em inglês no lugar do espaço em branco
  E essa palavra revelada deve permanecer sublinhada
```

---

### História de Usuário 2 - Navegar entre as cartas da fila (Prioridade: P2)

Usando duas setas (anterior/próxima), o aprendiz percorre as cartas da
fila atual para frente e para trás, independentemente de ter revelado a
palavra da carta atual.

**Por que essa prioridade**: Corresponde à navegação por cartas presente
na referência (o par de setas destacado mesmo antes de revelar). Sem
avaliação/agendamento implementados ainda, essa navegação é o único jeito
de percorrer a fila mock nesta fatia do front-end.

**Independent Test**: Com uma fila mock de 3 cartas, tocar na seta direita
duas vezes e confirmar que chega na 3ª carta com a palavra oculta
novamente; tocar na seta esquerda e voltar para a 2ª.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Avançar para a próxima carta
  Dado que o aprendiz está na carta 2 de 5 da fila
  Quando o aprendiz toca na seta direita
  Então o sistema deve exibir a carta 3
  E a contagem de cartas restantes deve refletir a nova posição
  E a palavra da carta 3 deve estar oculta, independentemente de a carta 2 ter sido revelada

Cenário: Retroceder para a carta anterior
  Dado que o aprendiz está na carta 3 de 5 da fila
  Quando o aprendiz toca na seta esquerda
  Então o sistema deve exibir a carta 2

Cenário: Seta esquerda desabilitada na primeira carta
  Dado que o aprendiz está na primeira carta da fila
  Então a seta esquerda deve estar desabilitada

Cenário: Seta direita desabilitada na última carta
  Dado que o aprendiz está na última carta da fila
  Então a seta direita deve estar desabilitada
```

---

### Casos de Borda

- O que acontece se a fila de estudo mock estiver vazia? Fora de escopo
  nesta fatia — a tela assume uma fila não vazia fornecida por dados mock
  (ver Suposições). O estado de fila vazia real é tratado pela spec 001
  (FR-009/FR-010).
- O que acontece ao navegar para uma carta diferente antes de revelar a
  atual? A palavra não revelada não "vaza" para a próxima carta — cada
  carta controla seu próprio estado de revelado/oculto, reiniciado ao
  entrar na tela.
- O que acontece se o aprendiz tocar "Revelar" mais de uma vez na mesma
  carta? Não deve haver efeito colateral — a palavra permanece revelada
  (idempotente).

## Requisitos *(obrigatório)*

### Requisitos Funcionais (EARS)

- **FR-001** (Onipresente): O sistema DEVE exibir, na parte superior da
  tela de estudo, a quantidade de cartas restantes na fila atual.
- **FR-002** (Onipresente): O sistema DEVE exibir, para a carta atual, a
  imagem que referencia a palavra dessa carta.
- **FR-003** (Estado): ENQUANTO a palavra da carta atual não tiver sido
  revelada, o sistema DEVE exibir um espaço sublinhado no lugar exato da
  palavra dentro da frase de exemplo.
- **FR-004** (Estado): ENQUANTO a palavra da carta atual não tiver sido
  revelada, o sistema DEVE exibir o botão "Revelar" em estado habilitado.
- **FR-005** (Evento): QUANDO o aprendiz tocar no botão "Revelar", o
  sistema DEVE substituir o espaço sublinhado da frase pela palavra em
  inglês da carta, mantendo-a sublinhada.
- **FR-006** (Evento): QUANDO o aprendiz tocar na seta direita e existir
  uma próxima carta na fila, o sistema DEVE exibir essa próxima carta com
  a palavra oculta, independentemente do estado de revelado da carta
  anterior.
- **FR-007** (Evento): QUANDO o aprendiz tocar na seta esquerda e existir
  uma carta anterior na fila, o sistema DEVE exibir essa carta anterior.
- **FR-008** (Estado): ENQUANTO a carta atual for a primeira da fila, o
  sistema DEVE exibir a seta esquerda em estado desabilitado.
- **FR-009** (Estado): ENQUANTO a carta atual for a última da fila, o
  sistema DEVE exibir a seta direita em estado desabilitado.
- **FR-010** (Comportamento indesejado): SE o aprendiz tocar no botão
  "Revelar" quando a palavra já estiver revelada, ENTÃO o sistema NÃO
  DEVE alterar o estado da carta (ação idempotente, sem efeito colateral
  visível).

### Fora de Escopo Explícito

Estes elementos aparecem na referência visual mas NÃO fazem parte desta
funcionalidade (nem como requisito, nem como componente visual):
badge de nível CEFR; anel/indicador de progresso; ícone de configurações;
seta de voltar do cabeçalho; título isolado da palavra (frente/verso);
tradução para português da frase; ícones de dicionário, nota, áudio
(dog/pronúncia) e dica; texto "Modo de resposta"; botões de avaliação
(X / "Nunca mais" / ✓).

### Entidades Principais

- **Carta de Estudo (mock)**: unidade exibida na tela, com uma imagem, uma
  frase contendo a palavra-alvo em inglês e a posição/índice dela dentro
  da frase (para saber onde inserir o sublinhado/a palavra revelada).
  Nesta fatia, vem de um conjunto de dados mock local, não do pipeline de
  conteúdo real nem do banco SQLite (esses ainda não existem no
  código-fonte).
- **Fila de Estudo (mock)**: lista ordenada de Cartas de Estudo e um
  índice da carta atual, controlando a contagem de "restantes" e a
  habilitação das setas.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um observador consegue, olhando a tela sem explicação
  prévia, identificar corretamente os 5 elementos (contador, imagem,
  frase com sublinhado, botão Revelar, setas) e sua função, comparando
  lado a lado com a referência visual fornecida.
- **SC-002**: Em 100% das cartas da fila mock, tocar "Revelar" substitui
  o sublinhado pela palavra correta, sem afetar o restante da frase.
- **SC-003**: A navegação entre cartas (setas) nunca deixa a tela em um
  estado sem carta visível ou com a contagem de restantes inconsistente
  com a posição atual.

## Suposições

- Os dados exibidos vêm de uma fila mock local (array em memória com 2-5
  cartas de exemplo), não do pipeline de ingestão Oxford nem do SQLite —
  esses ainda não foram implementados (ver `001-flashcard-study-loop/
  tasks.md`, Fase 2). Esta funcionalidade existe para destravar o
  front-end antes da camada de dados real estar pronta.
- "Revelar" aqui é puramente visual (troca de texto na frase); não grava
  avaliação, não chama o agendador SM-2 e não persiste nada — isso
  permanece definido pela spec 001 e será conectado em um incremento
  posterior.
- A imagem referente à palavra é um asset de placeholder (ilustração
  genérica ou bloco estilizado), já que o pipeline de conteúdo real e a
  fonte das ilustrações (Oxford ou geradas) ainda não foram definidos.
- O layout visual (cores, tipografia, proporções) busca ficar "o mais
  próximo possível" da referência para estes 5 elementos, mas não precisa
  ser pixel-perfect — divergências de estilo fino podem ser ajustadas
  depois de uma revisão visual.
