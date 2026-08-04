# Especificação da Funcionalidade: Loop de Estudo com Flashcards (MVP)

**Branch da Feature**: `001-flashcard-study-loop`

**Criada em**: 2026-08-04

**Status**: Rascunho

**Entrada**: Descrição do usuário: "MVP study loop: browse a deck seeded from Oxford 3000/5000 word lists, study due flashcards, grade recall, and have the card rescheduled via spaced repetition"

## Cenários e Testes do Usuário *(obrigatório)*

### História de Usuário 1 - Estudar cards devidos em uma sessão (Prioridade: P1)

Um aprendiz abre o app, inicia uma sessão de estudo e vê flashcards um de
cada vez (frente: palavra em inglês, verso: definição/tradução/exemplo).
Para cada card, ele revela a resposta, julga o quão bem lembrou e o app
avança para o próximo card devido até que nenhum reste.

**Por que essa prioridade**: Esta é a razão de existir do app. Sem uma
sessão de estudo funcionando, não há produto — tudo o mais (listas de
decks, estatísticas, configurações) é secundário.

**Teste Independente**: Semear um deck com alguns cards devidos, iniciar
uma sessão, responder todos os cards com notas diferentes e confirmar que
a sessão termina de forma limpa sem cards devidos restantes.

**Cenários de Aceitação**:

1. **Dado** um deck com cards devidos, **Quando** o aprendiz inicia uma
   sessão de estudo, **Então** o primeiro card devido é mostrado apenas
   com a frente (resposta oculta).
2. **Dado** a frente de um card mostrada, **Quando** o aprendiz revela a
   resposta, **Então** o verso (definição/exemplo) é mostrado junto com as
   opções de avaliação de lembrança.
3. **Dado** a resposta revelada, **Quando** o aprendiz seleciona uma nota,
   **Então** o card é avaliado, a sessão avança para o próximo card devido
   (ou termina se nenhum restar), e o card avaliado não é mostrado
   novamente nessa sessão.
4. **Dado** o último card devido acabou de ser avaliado, **Quando** a
   sessão avança, **Então** o aprendiz vê um estado claro de "sessão
   concluída" em vez de uma tela vazia ou travada.

---

### História de Usuário 2 - Ver o que está devido antes de estudar (Prioridade: P2)

Antes de se comprometer com uma sessão, um aprendiz quer ver seu(s)
deck(s) e quantos cards estão devidos agora, para saber o que está prestes
a estudar.

**Por que essa prioridade**: Dá suporte ao loop central permitindo que o
aprendiz decida quando/o que estudar, alinhado com a navegação do
benchmark centrada em lista de decks, mas o app ainda é utilizável de
ponta a ponta sem isso (um deck padrão único poderia iniciar
automaticamente).

**Teste Independente**: Com um deck semeado contendo uma contagem de
devidos conhecida, abrir o app e verificar que a contagem exibida
corresponde, depois iniciar o estudo a partir dessa tela.

**Cenários de Aceitação**:

1. **Dado** o app tem um ou mais decks semeados, **Quando** o aprendiz
   abre a lista de decks, **Então** cada deck mostra seu nome e a
   contagem atual de cards devidos.
2. **Dado** um deck tem zero cards devidos, **Quando** o aprendiz o
   visualiza, **Então** o deck é mostrado como em dia e estudar é
   desabilitado ou claramente um no-op (sem crash, sem sessão vazia).
3. **Dado** um deck com cards devidos, **Quando** o aprendiz o seleciona,
   **Então** a sessão de estudo da História de Usuário 1 inicia com
   escopo nesse deck.

---

### História de Usuário 3 - A nota de lembrança determina a próxima data de revisão (Prioridade: P1)

Depois de avaliar um card, a resposta do aprendiz muda de forma
mensurável quando esse card volta: uma nota ruim traz o card de volta mais
cedo (no mesmo dia ou no dia seguinte), uma nota boa o empurra para mais
longe, seguindo um padrão de repetição espaçada que se alonga com
lembranças corretas consecutivas.

**Por que essa prioridade**: É isso que separa "flashcards" de um app de
repetição espaçada de verdade, e é o mecanismo em que o produto inteiro se
baseia no benchmark contra o AnkiApp. Precisa funcionar corretamente desde
o primeiro lançamento, já que o histórico de revisões se acumula ao longo
do tempo e não pode ser facilmente "corrigido" depois sem corromper o
cronograma de um aprendiz.

**Teste Independente**: Avaliar o mesmo card com a nota mais baixa e
verificar que sua próxima data de vencimento é mais cedo do que avaliar um
card equivalente com a nota mais alta; repetir um card por várias notas
"boas" e confirmar que o intervalo entre as datas de vencimento cresce a
cada vez.

**Cenários de Aceitação**:

1. **Dado** um card novo (nunca revisado), **Quando** o aprendiz o avalia
   como "não lembrei", **Então** o próximo horário de vencimento do card é
   muito em breve (dentro do mesmo dia).
2. **Dado** um card novo, **Quando** o aprendiz o avalia como "lembrei
   facilmente", **Então** a próxima data de vencimento do card é definida
   mais à frente do que uma nota "não lembrei" produziria.
3. **Dado** um card que já foi avaliado como "bom" ou melhor em suas
   últimas duas revisões, **Quando** ele é avaliado como "bom" ou melhor
   novamente, **Então** seu novo intervalo é maior que seu intervalo
   anterior.
4. **Dado** um card com o qual o aprendiz está ativamente com dificuldade
   (notas baixas recentes), **Quando** ele é avaliado com nota baixa
   novamente, **Então** seu intervalo reinicia para um ciclo de revisão
   curto em vez de continuar crescendo.

---

### Casos de Borda

- O que acontece quando um aprendiz abre o app pela primeira vez sem
  histórico de revisão? Todos os cards semeados devem ser tratados como
  novos/devidos para que uma primeira sessão seja sempre possível.
- O que acontece quando uma sessão de estudo é interrompida (app fechado/
  em segundo plano no meio da sessão) antes de um card ser avaliado? Ao
  retornar, o estado não avaliado desse card não pode ser perdido nem
  contado em duplicidade — ele deve simplesmente continuar devido.
- Como o sistema lida com um deck sem nenhum card (não apenas zero
  devidos)? O aprendiz deve ver um estado claro de "nenhum card neste
  deck", distinto de "nada devido agora".
- O que acontece se o aprendiz avaliar um card mais rápido do que a UI
  consegue persistir a nota anterior (entrada repetida rápida)? As notas
  devem ser aplicadas em ordem e nenhuma nota pode ser descartada
  silenciosamente.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE apresentar cards devidos um de cada vez
  dentro de uma sessão de estudo, com o lado da frente (pergunta) primeiro
  e o verso (resposta) oculto até ser revelado.
- **FR-002**: O sistema DEVE permitir que o aprendiz revele o verso
  (resposta) de um card sob demanda.
- **FR-003**: O sistema DEVE oferecer um conjunto pequeno e fixo de
  opções de nota de lembrança depois que a resposta é revelada (no
  mínimo: "não lembrei" e "lembrei", com notas intermediárias para
  "lembrei com dificuldade" e "lembrei facilmente" para dar suporte ao
  comportamento de crescimento/redução de intervalo da História 3).
- **FR-004**: O sistema DEVE registrar uma revisão avaliada de um card,
  incluindo qual nota foi dada e quando.
- **FR-005**: O sistema DEVE calcular a próxima data/horário de
  vencimento do card a partir da nota e do histórico de revisões
  anteriores usando uma regra de agendamento de repetição espaçada (notas
  mais baixas encurtam/reiniciam o intervalo, notas mais altas o
  alongam).
- **FR-006**: O sistema NÃO DEVE mostrar um card novamente dentro da
  mesma sessão de estudo depois que ele foi avaliado.
- **FR-007**: O sistema DEVE encerrar uma sessão de estudo com um estado
  claro de "concluída" quando nenhum card devido restar, em vez de mostrar
  uma tela vazia ou em branco.
- **FR-008**: O sistema DEVE listar o(s) deck(s) do aprendiz com uma
  contagem por deck de cards atualmente devidos.
- **FR-009**: O sistema DEVE tratar um deck com zero cards devidos como
  "em dia" e impedir o início de uma sessão vazia a partir dele.
- **FR-010**: O sistema DEVE distinguir, na visão do deck, entre um deck
  que não tem nenhum card e um deck que tem cards mas nenhum atualmente
  devido.
- **FR-011**: O sistema DEVE persistir os resultados das revisões
  localmente para que as contagens de devidos e as próximas datas de
  vencimento estejam corretas na próxima vez que o app for aberto, sem
  necessidade de conexão de rede.
- **FR-012**: O sistema DEVE semear ao menos um deck a partir de uma fonte
  de lista de palavras Oxford 3000/5000 (palavra, definição e um exemplo
  ou nota de uso por card) para que o aprendiz tenha conteúdo real para
  estudar no primeiro lançamento.
- **FR-013**: O sistema DEVE recuperar um card interrompido e não avaliado
  como ainda devido (não perdido, não duplicado) se o app for fechado no
  meio de uma sessão e reaberto.

### Entidades Principais

- **Deck**: Uma coleção nomeada de cards que um aprendiz estuda como uma
  unidade (ex.: um nível Oxford como "Oxford 3000 — A1-A2"). Tem um nome e
  uma contagem de cards atualmente devidos.
- **Card**: Um único item de estudo pertencente a um deck, com uma frente
  (pergunta — a palavra), um verso (resposta — definição/exemplo/
  tradução) e seu próprio estado de agendamento (intervalo atual, próxima
  data de vencimento, facilidade/força derivada do histórico de
  revisões).
- **Review (Revisão)**: Um único evento avaliado para um card — qual nota
  foi dada e quando — que alimenta o cálculo de agendamento para a
  próxima data de vencimento desse card. O histórico de revisões é o que
  faz o intervalo crescer/encolher ao longo do tempo.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Um aprendiz consegue ir de abrir o app a concluir seu
  primeiro card avaliado em menos de 30 segundos, sem necessidade de
  configuração de conta.
- **SC-002**: Um aprendiz consegue estudar todos os cards atualmente
  devidos em um deck em uma única sessão ininterrupta sem que o app
  perca, duplique ou pule um card.
- **SC-003**: Avaliar um card como "não lembrei" versus "lembrei
  facilmente" produz uma próxima data de vencimento mensuravelmente
  diferente em 100% dos casos (a nota mais baixa nunca é agendada para
  depois da nota mais alta, para o mesmo histórico de revisão).
- **SC-004**: Um card avaliado como "bom" ou melhor em revisões
  consecutivas mostra um intervalo estritamente crescente ao longo de
  pelo menos as primeiras 4 revisões bem-sucedidas, correspondendo ao
  padrão de crescimento esperado de repetição espaçada.
- **SC-005**: O app é totalmente estudável (iniciar sessão, avaliar
  cards, ver mudanças na próxima data de vencimento) com o dispositivo em
  modo avião.
- **SC-006**: Na primeira instalação, o aprendiz tem ao menos um deck com
  vocabulário real originado da Oxford pronto para estudar — zero
  configuração manual de conteúdo necessária.

## Suposições

- Assume-se um único perfil de aprendiz local para o MVP — sem contas,
  suporte multiusuário ou login. Isso está alinhado com o escopo do MVP
  offline-first e sem backend definido na constituição.
- O MVP é lançado com um conjunto fixo de decks derivados da Oxford
  3000/5000 (ex.: por nível CEFR). Aprendizes não podem criar, editar ou
  importar seus próprios decks/cards nesta funcionalidade; isso fica fora
  de escopo até uma funcionalidade futura.
- A avaliação de lembrança usa uma escala de quatro níveis (não lembrei /
  lembrei com dificuldade / lembrei / lembrei facilmente), próxima o
  suficiente da UX comum de SRS (incluindo o app de benchmark) para
  validar o comportamento de intervalo da História 3, sem impor um
  algoritmo de implementação específico.
- "Devido" é determinado comparando a data/horário de vencimento
  armazenada de um card com a hora local atual do dispositivo; nenhuma
  sincronização de relógio de servidor ou fuso horário é necessária para o
  MVP.
- Sessões de estudo têm escopo em um deck por vez para o MVP; uma visão
  combinada de "estudar tudo que está devido entre decks" fica fora de
  escopo até ser solicitada.
- Os termos exatos de licenciamento/uso da fonte Oxford são regidos pelo
  princípio de pipeline de conteúdo da constituição e são validados
  separadamente no trabalho de ingestão de conteúdo, não são
  rediscutidos nesta especificação.
