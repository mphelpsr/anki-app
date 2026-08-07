# Especificação da Funcionalidade: Tela de Estudo — Card Mínimo (MVP1 Front-end)

<!--
Nota de revisão (2026-08-04, após observação de outros apps de SRS):
a palavra-alvo em inglês NÃO é mais ocultada até "Revelar"/"Reveal" — ela
é exibida em destaque (negrito + sublinhado) desde a primeira renderização
da carta. O que "Reveal" controla agora é a tradução e os botões de
avaliação (ver specs/004-recall-grading/spec.md). Motivo: nos apps de
referência observados, o que se testa é o reconhecimento do
significado/tradução de uma palavra já visível em contexto, não a
produção da palavra a partir de um espaço em branco. FR-003, FR-005,
FR-010, SC-002 e a seção de Entidades abaixo foram atualizados; FR-004 e
o Caso de Borda de idempotência de "Revelar" permanecem válidos, agora
aplicados à tradução/avaliação em vez da palavra.
-->

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
fila atual. Abaixo, vê a imagem que ilustra a palavra da carta atual e a
frase completa em inglês usando essa palavra, com a palavra-alvo já
visível e em destaque (negrito + sublinhado) — não é preciso adivinhar
nada para ver a frase. Ao tocar em "Reveal", a frase em inglês permanece
como está (serve de referência) e é a tradução que passa a aparecer (ver
`004-recall-grading/spec.md`).

**Por que essa prioridade**: É o núcleo visual do produto — sem isso não
há nada para "começar o front-end". Corresponde à experiência de
reconhecimento (ver a palavra em contexto, testar se você sabe o
significado) comum em apps de SRS de referência, isolada da lógica de
avaliação e agendamento completas, que ainda não estavam implementadas
quando esta fatia nasceu.

**Teste Independente**: Com uma fila mock de 2-3 cartas, abrir a tela e
conferir que a palavra-alvo já aparece em destaque na frase, sem nenhuma
interação necessária.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Contagem de cartas restantes ao abrir a tela
  Dado que a fila de estudo contém 5 cartas
  Quando o aprendiz abre a tela de estudo
  Então o sistema deve exibir "5 cartas restantes" no topo da tela

Cenário: Card exibido com a palavra-alvo já em destaque
  Dado que o aprendiz está vendo uma carta pela primeira vez
  Então a imagem referente à palavra da carta deve estar visível
  E a frase completa em inglês deve estar visível, com a palavra-alvo em negrito e sublinhada
  E o botão "Reveal" deve estar visível e habilitado

Cenário: Tocar em Reveal não altera a frase em inglês
  Dado que o aprendiz está vendo uma carta
  Quando o aprendiz toca no botão "Reveal"
  Então a frase em inglês e a palavra-alvo em destaque permanecem exatamente como estavam
```

---

### História de Usuário 2 - Navegar entre as cartas da fila (Prioridade: P2)

Usando duas setas (anterior/próxima), o aprendiz percorre as cartas da
fila atual para frente e para trás, cada uma já mostrando sua própria
palavra-alvo em destaque.

**Por que essa prioridade**: Corresponde à navegação por cartas presente
na referência (o par de setas destacado mesmo antes de revelar). Sem
avaliação/agendamento implementados ainda, essa navegação é o único jeito
de percorrer a fila mock nesta fatia do front-end.

**Independent Test**: Com uma fila mock de 3 cartas, tocar na seta direita
duas vezes e confirmar que chega na 3ª carta já com sua própria palavra em
destaque; tocar na seta esquerda e voltar para a 2ª.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Avançar para a próxima carta
  Dado que o aprendiz está na carta 2 de 5 da fila
  Quando o aprendiz toca na seta direita
  Então o sistema deve exibir a carta 3
  E a contagem de cartas restantes deve refletir a nova posição
  E a palavra-alvo da carta 3 deve estar visível em destaque, independentemente do estado de avaliação da carta 2

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
- O que acontece ao navegar para uma carta diferente antes de tocar em
  "Reveal" na atual? A tradução exibida (se houver) não "vaza" para a
  próxima carta — cada carta controla seu próprio estado de
  tradução/avaliação visível, reiniciado ao entrar na tela. A frase em
  inglês da nova carta é sempre exibida imediatamente, sem depender desse
  estado.
- O que acontece se o aprendiz tocar "Reveal" mais de uma vez na mesma
  carta? Não deve haver efeito colateral — o estado revelado permanece
  (idempotente); a frase em inglês nunca muda de qualquer forma.

## Requisitos *(obrigatório)*

### Requisitos Funcionais (EARS)

- **FR-001** (Onipresente): O sistema DEVE exibir, na parte superior da
  tela de estudo, a quantidade de cartas restantes na fila atual.
- **FR-002** (Onipresente): O sistema DEVE exibir, para a carta atual, a
  imagem que referencia a palavra dessa carta.
- **FR-003** (Onipresente): O sistema DEVE exibir a frase completa em
  inglês com a palavra-alvo sempre em destaque (negrito + sublinhado),
  desde a primeira renderização da carta — nunca oculta por um espaço em
  branco.
- **FR-004** (Estado): ENQUANTO o aprendiz não tiver tocado em "Reveal"
  para a carta atual, o sistema DEVE exibir o botão "Reveal" em estado
  habilitado.
- **FR-005** (Evento): QUANDO o aprendiz tocar no botão "Reveal", o
  sistema NÃO DEVE alterar a frase em inglês nem a palavra-alvo em
  destaque — apenas passa a exibir a tradução e as opções de avaliação
  (ver `004-recall-grading/spec.md`).
- **FR-006** (Evento): QUANDO o aprendiz tocar na seta direita e existir
  uma próxima carta na fila, o sistema DEVE exibir essa próxima carta com
  sua própria palavra-alvo já em destaque, independentemente do estado de
  avaliação da carta anterior.
- **FR-007** (Evento): QUANDO o aprendiz tocar na seta esquerda e existir
  uma carta anterior na fila, o sistema DEVE exibir essa carta anterior.
- **FR-008** (Estado): ENQUANTO a carta atual for a primeira da fila, o
  sistema DEVE exibir a seta esquerda em estado desabilitado.
- **FR-009** (Estado): ENQUANTO a carta atual for a última da fila, o
  sistema DEVE exibir a seta direita em estado desabilitado.
- **FR-010** (Comportamento indesejado): SE o aprendiz tocar no botão
  "Reveal" mais de uma vez para a mesma carta, ENTÃO o sistema NÃO DEVE
  produzir nenhum efeito colateral adicional (ação idempotente) — a frase
  em inglês, em particular, nunca é afetada por "Reveal".

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
  da frase (para saber onde aplicar o destaque). Nesta fatia, vem de um
  conjunto de dados mock local, não do pipeline de conteúdo real nem do
  banco SQLite (esses ainda não existem no código-fonte).
- **Fila de Estudo (mock)**: lista ordenada de Cartas de Estudo e um
  índice da carta atual, controlando a contagem de "restantes" e a
  habilitação das setas.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um observador consegue, olhando a tela sem explicação
  prévia, identificar corretamente os 5 elementos (contador, imagem,
  frase com a palavra em destaque, botão Reveal, setas) e sua função,
  comparando lado a lado com a referência visual fornecida.
- **SC-002**: Em 100% das cartas da fila mock, a palavra-alvo aparece
  corretamente em destaque desde a primeira renderização, e tocar
  "Reveal" nunca altera a frase em inglês.
- **SC-003**: A navegação entre cartas (setas) nunca deixa a tela em um
  estado sem carta visível ou com a contagem de restantes inconsistente
  com a posição atual.

## Suposições

- Os dados exibidos vêm de uma fila mock local (array em memória com 2-5
  cartas de exemplo), não do pipeline de ingestão Oxford nem do SQLite —
  esses ainda não foram implementados (ver `001-flashcard-study-loop/
  tasks.md`, Fase 2). Esta funcionalidade existe para destravar o
  front-end antes da camada de dados real estar pronta.
- A palavra-alvo em inglês é sempre visível desde o início — o teste de
  memorização é sobre reconhecer o significado (tradução), não sobre
  produzir a palavra a partir de um espaço em branco. "Reveal" controla a
  tradução e a avaliação (`004-recall-grading`), não a frase em inglês.
- A imagem referente à palavra é um asset de placeholder (ilustração
  genérica ou bloco estilizado), já que o pipeline de conteúdo real e a
  fonte das ilustrações (Oxford ou geradas) ainda não foram definidos.
- O layout visual (cores, tipografia, proporções) busca ficar "o mais
  próximo possível" da referência para estes 5 elementos, mas não precisa
  ser pixel-perfect — divergências de estilo fino podem ser ajustadas
  depois de uma revisão visual.
