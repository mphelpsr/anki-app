# Especificação da Funcionalidade: Avaliação de Lembrança com Agendador Real

**Branch da Feature**: `004-recall-grading`

**Criada em**: 2026-08-04

**Status**: Rascunho

**Entrada**: Descrição do usuário: "After revealing the sentence, show the four Anki-style recall grade buttons (Again/Hard/Good/Easy), each with a dynamically computed time-until-next-review label driven by a real spaced-repetition scheduler; also show the Portuguese translation once revealed; rename the reveal button to English 'Reveal'"

<!--
Nota de revisão (2026-08-04): adiciona a História de Usuário 3 e
FR-011/FR-012 — feedback breve colorido por nota ao tocar em um botão de
avaliação, antes de avançar para a próxima carta, com uma cor fixa por
nota (Again=amarelo, Hard=vermelho, Good=laranja, Easy=verde). Isso
substitui a Suposição original de que os botões seguiriam apenas a
identidade visual dourada do app — agora cada botão de avaliação também
usa sua cor própria.
-->

**Contexto e motivação**: em conversa, o usuário anexou uma referência
visual (Again/Hard/Good/Easy, com um rótulo de tempo acima de cada botão,
ex.: `<1m`, `<6m`, `<10m`, `5d`) e pediu que, ao revelar uma carta, esses
quatro botões apareçam no lugar do botão "Revelar", cada um mostrando
**dinamicamente** quanto tempo falta para aquela carta voltar caso aquele
botão seja escolhido — calculado por regras reais de repetição espaçada,
não valores fixos de exemplo. Também pediu que a frase traduzida em
português apareça junto da revelação, e que o botão de revelar passe a se
chamar "Reveal" (inglês), para manter o padrão dos rótulos de ação em
inglês (Again/Hard/Good/Easy).

**Escopo desta funcionalidade**: substitui o comportamento pós-revelação
de `002-mvp1-card-screen` (onde o botão "Revelar" simplesmente
desaparecia) por: tradução em português + os 4 botões de avaliação. É a
primeira funcionalidade a implementar de fato o **agendador de repetição
espaçada real** (`src/domain/scheduler.ts`), até agora apenas
especificado em `001-flashcard-study-loop`. O estado de agendamento
continua vivendo em memória (React state), sem SQLite — persistência
entre sessões do app continua sendo escopo de `001`.

## Cenários e Testes do Usuário *(obrigatório)*

### História de Usuário 1 - Avaliar a lembrança com feedback de tempo real (Prioridade: P1)

Depois de tocar em "Reveal", o aprendiz vê quatro botões — Again, Hard,
Good, Easy — cada um rotulado com quanto tempo falta até aquela carta
voltar a aparecer, **calculado para o estado atual daquela carta
específica**. Ao escolher um botão, a carta é reagendada de acordo e a
tela avança para a próxima carta da fila, já com sua própria palavra-alvo
em destaque e aguardando um novo "Reveal".

**Por que essa prioridade**: É o núcleo do pedido — sem isso, os botões
seriam apenas decoração, e o app continuaria sem o mecanismo que
justifica chamá-lo de "repetição espaçada".

**Teste Independente**: Revelar uma carta nova, conferir que "Again"
mostra um tempo bem mais curto que "Easy", tocar em "Again" e confirmar
que a mesma carta reaparece na fila com um novo horário de vencimento
próximo (dentro de poucos minutos) — não no dia seguinte.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Botões de avaliação aparecem após revelar
  Dado que o aprendiz está vendo uma carta com a palavra ainda oculta
  Quando o aprendiz toca em "Reveal"
  Então o botão "Reveal" deixa de ser exibido
  E os quatro botões Again, Hard, Good, Easy passam a ser exibidos
  E cada botão mostra um rótulo de tempo calculado para o estado atual da carta

Cenário: "Again" sempre traz a carta de volta em curtíssimo prazo
  Dado que uma carta (nova ou já graduada) já teve "Reveal" acionado
  Quando o aprendiz toca em "Again"
  Então o novo horário de vencimento da carta deve ser inferior a 2 minutos a partir de agora

Cenário: Ordem crescente entre os quatro botões
  Dado uma carta com "Reveal" já acionado, em qualquer estado de repetição
  Então o tempo mostrado em "Again" deve ser menor ou igual ao de "Hard"
  E o tempo mostrado em "Hard" deve ser menor ou igual ao de "Good"
  E o tempo mostrado em "Good" deve ser menor ou igual ao de "Easy"

Cenário: Avaliar reagenda a carta e avança a sessão
  Dado que o aprendiz está vendo a carta 1 de 4, com "Reveal" já acionado
  Quando o aprendiz toca em qualquer um dos quatro botões de avaliação
  Então a carta 1 recebe um novo horário de vencimento consistente com o botão escolhido
  E a tela avança para a carta 2, já com sua própria palavra-alvo em destaque

Cenário: Avaliar a última carta da fila encerra a sessão
  Dado que o aprendiz está vendo a última carta da fila, com "Reveal" já acionado
  Quando o aprendiz toca em qualquer botão de avaliação
  Então a tela deve mostrar um estado claro de "sessão concluída" (mesmo comportamento de 002-mvp1-card-screen)
```

---

### História de Usuário 2 - Ver a tradução ao revelar (Prioridade: P2)

A palavra-alvo em inglês já aparece em destaque na frase desde o início
(ver revisão de `002-mvp1-card-screen/spec.md`); ao tocar em "Reveal", o
aprendiz passa a ver também a frase traduzida para português, com a
palavra correspondente destacada — como já mostrado na referência visual
original desta conversa.

**Por que essa prioridade**: Ajuda a confirmar o significado da palavra,
mas a tela já é funcional (permite estudar e avaliar) sem ela.

**Teste Independente**: Revelar uma carta e conferir que a tradução em
português aparece abaixo da frase em inglês, com a palavra traduzida
visualmente destacada.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Tradução aparece junto da revelação
  Dado que o aprendiz está vendo uma carta, com sua palavra-alvo já em destaque
  Quando o aprendiz toca em "Reveal"
  Então a frase traduzida em português deve ser exibida abaixo da frase em inglês
  E a palavra traduzida correspondente deve estar visualmente destacada
```

---

### História de Usuário 3 - Feedback visual breve ao avaliar (Prioridade: P2)

Ao tocar em um dos quatro botões de avaliação, o aprendiz vê brevemente um
popup centralizado sobre um fundo escurecido — com um selo na cor da nota
escolhida, o nome da nota e a quantidade de tempo até a próxima revisão
por extenso (ex.: "Próxima revisão em 36 dias") — por exatamente 1
segundo. Ao final desse segundo, o popup desaparece e a tela avança
automaticamente para a próxima carta. Cada nota tem uma cor fixa: Again em
amarelo, Hard em vermelho, Good em laranja, Easy em verde. Essa mesma cor
também é usada no próprio botão.

**Por que essa prioridade**: Não é necessária para o loop funcionar (a
avaliação já reagenda e avança sem isso), mas dá uma confirmação visual
imediata de qual nota foi escolhida e de quando a carta volta, reduzindo o
risco de toques errados passarem despercebidos.

**Teste Independente**: Tocar em "Good", confirmar que aparece um popup
laranja com o texto "Good" e a quantidade de dias até a próxima revisão,
que ele permanece por 1 segundo, some, e a tela mostra a próxima carta
automaticamente, sem toque adicional do aprendiz.

**Cenários de Aceitação** (BDD):

```gherkin
Cenário: Popup de feedback ao tocar em uma nota
  Dado que o aprendiz está vendo os quatro botões de avaliação
  Quando o aprendiz toca em "Hard"
  Então o sistema deve exibir um popup centralizado, sobre um fundo escurecido, na cor vermelha
  E esse popup deve mostrar o texto "Hard" e a quantidade de tempo até a próxima revisão por extenso

Cenário: Popup some sozinho após 1 segundo e a sessão avança automaticamente
  Dado que o popup de feedback está visível
  Quando se passa 1 segundo
  Então o popup deve deixar de ser exibido
  E a tela deve avançar automaticamente para a próxima carta (ou "sessão concluída", se for a última), sem exigir nenhum toque do aprendiz

Cenário: Cada nota tem sua própria cor, no botão e no popup
  Dado que o aprendiz está vendo os quatro botões de avaliação
  Então o botão "Again" e o selo do seu popup devem usar amarelo
  E o botão "Hard" e o selo do seu popup devem usar vermelho
  E o botão "Good" e o selo do seu popup devem usar laranja
  E o botão "Easy" e o selo do seu popup devem usar verde
```

---

### Casos de Borda

- Uma carta já graduada (com intervalo em dias) recebe "Again": o
  agendador deve tratá-la como um lapso e trazê-la de volta em minutos,
  não continuar a progressão de dias — não existe um "meio-termo" de
  horas para lapsos nesta fatia.
- Os rótulos de tempo (`<1m`, `<10m`, `4d`, etc.) são arredondados para
  leitura rápida; o valor exato usado para calcular o próximo horário de
  vencimento não precisa corresponder ao texto arredondado dígito a
  dígito, apenas estar na mesma ordem de grandeza.
- Navegar manualmente pelas setas (Elemento 5 de `002`) continua não
  aplicando nenhuma avaliação — nenhuma alteração na carta enquanto o
  aprendiz apenas navega.
- Se o aprendiz avaliar uma carta e depois voltar até ela pela seta
  esquerda, a carta deve refletir o novo estado (pós-avaliação), não o
  estado original do mock — o estado vive na sessão, não é recriado a
  cada renderização.

## Requisitos *(obrigatório)*

### Requisitos Funcionais (EARS)

- **FR-001** (Evento): QUANDO o aprendiz tocar em "Reveal", o sistema
  DEVE substituir o botão "Reveal" pelos quatro botões de avaliação
  (Again, Hard, Good, Easy).
- **FR-002** (Onipresente): O sistema DEVE calcular o rótulo de tempo de
  cada botão de avaliação a partir do estado de agendamento atual da
  carta exibida (repetições, fator de facilidade, intervalo), não de um
  valor fixo por botão.
- **FR-003** (Onipresente): O sistema DEVE ordenar os quatro tempos de
  forma não decrescente: Again <= Hard <= Good <= Easy, para qualquer
  estado de carta.
- **FR-004** (Onipresente): O sistema DEVE calcular o horário de
  vencimento produzido por "Again" para ser inferior a 2 minutos a partir
  do momento da avaliação, independentemente do histórico da carta.
- **FR-005** (Evento): QUANDO o aprendiz tocar em um dos quatro botões de
  avaliação, o sistema DEVE atualizar o estado de agendamento da carta
  exibida (repetições, fator de facilidade, intervalo, próximo
  vencimento) de acordo com o botão escolhido.
- **FR-006** (Evento): QUANDO uma avaliação for aplicada e houver uma
  próxima carta na fila, o sistema DEVE avançar para ela com a palavra
  oculta novamente (mesmo comportamento de ocultar já usado ao navegar
  pelas setas em `002`).
- **FR-007** (Evento): QUANDO uma avaliação for aplicada à última carta
  da fila, o sistema DEVE exibir o estado de "sessão concluída" já
  definido em `002-mvp1-card-screen`.
- **FR-008** (Evento): QUANDO o aprendiz tocar em "Reveal", o sistema
  DEVE exibir a frase traduzida em português, com a palavra traduzida
  visualmente destacada.
- **FR-009** (Comportamento indesejado): SE o aprendiz navegar pelas
  setas sem tocar em nenhum botão de avaliação, ENTÃO o sistema NÃO DEVE
  alterar o estado de agendamento de nenhuma carta.
- **FR-010** (Onipresente): O sistema DEVE rotular o botão de revelar
  como "Reveal" (em inglês), consistente com os rótulos em inglês dos
  quatro botões de avaliação.
- **FR-011** (Evento): QUANDO o aprendiz tocar em um dos quatro botões de
  avaliação, o sistema DEVE exibir um popup centralizado, sobre um fundo
  escurecido, com o nome da nota e a quantidade de tempo até a próxima
  revisão por extenso, por exatamente 1 segundo.
- **FR-012** (Onipresente): O sistema DEVE usar uma cor fixa e distinta
  por nota, aplicada tanto ao botão quanto ao selo do popup: Again =
  amarelo, Hard = vermelho, Good = laranja, Easy = verde.
- **FR-013** (Evento): QUANDO o intervalo de 1 segundo do popup terminar,
  o sistema DEVE, automaticamente e sem exigir nenhum toque do aprendiz,
  ocultar o popup e aplicar o avanço para a próxima carta ou o estado de
  "sessão concluída".

### Fora de Escopo Explícito

Persistência entre sessões do app (SQLite — ver `001`); qualquer painel
de estatísticas de avaliação; edição manual do agendamento pelo
aprendiz; alteração dos Elementos 2, 3 (estrutura da frase em inglês) e 5
de `002`; mudança de idioma do restante da UI (progresso de nível, badge
de pendências continuam em português).

### Entidades Principais

- **Carta de Estudo (mock, com estado mutável)**: os campos de
  agendamento (`repetitions`, `easeFactor`, `intervalMinutes`,
  `nextDueAt`) passam a ser atualizados em memória a cada avaliação,
  substituindo os valores fixos usados em `003-cefr-progress-counter`.
  Ganha também `translationBefore`/`translatedWord`/`translationAfter`
  para a História de Usuário 2.
- **Grade (Nota)**: um de quatro valores — Again, Hard, Good, Easy —
  consumido pelo agendador junto do estado atual da carta para produzir
  o próximo estado.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Em 100% das avaliações com "Again", a mesma carta volta a
  ficar devida em menos de 2 minutos.
- **SC-002**: Em 100% dos estados de carta testados, a ordem dos quatro
  tempos exibidos é Again <= Hard <= Good <= Easy.
- **SC-003**: Depois de avaliar todas as cartas de uma fila mock, o
  progresso de nível (`003-cefr-progress-counter`) reflete as avaliações
  feitas nesta sessão, sem precisar recarregar a tela.
- **SC-004**: Um aprendiz consegue completar uma sessão inteira (revelar
  → avaliar → próxima carta, repetidamente) até o estado de "sessão
  concluída", sem nenhuma carta travar sem botão de avaliação disponível.

## Suposições

- O agendador implementado aqui estende o modelo de `001-flashcard-
  study-loop` (que previa apenas intervalos em dias) com uma fase de
  "aprendizagem" em minutos para cartas novas ou que acabaram de falhar
  (nota "Again"), antes de graduarem para o crescimento em dias por
  fator de facilidade — mais fiel ao comportamento de apps de repetição
  espaçada de referência do que a versão apenas-em-dias descrita
  originalmente. `001/research.md` e
  `001/contracts/scheduler-contract.md` são atualizados em conjunto com
  esta feature para não ficarem contraditórios.
- Os valores exatos de tempo da imagem de referência (`<1m`, `<6m`,
  `<10m`, `5d`) são ilustrativos, não uma especificação numérica — o que
  importa é a ordem crescente e o "Again" sempre muito curto (FR-003,
  FR-004), não reproduzir os números exatos.
- A tradução em português usa a mesma estrutura de "antes/palavra/depois"
  já usada para a frase em inglês, para permitir destacar a palavra
  traduzida sem reprocessar texto livre.
- Estilo dos botões de avaliação (bordas, tipografia) segue a identidade
  visual já estabelecida no app; a cor de fundo de cada botão, porém,
  passa a ser específica da nota (FR-012), não mais o dourado uniforme —
  revisão feita para dar suporte ao feedback pós-toque da História 3.
- A duração do popup (FR-011/FR-013) é fixada em 1 segundo por decisão
  explícita do produto — diferente da primeira versão desta feature, que
  tratava o valor como ajustável e não normativo. O parâmetro que controla
  a duração na implementação permanece configurável apenas para testes
  automatizados (reduzido a 0), não para uso em produção.
- O intervalo por extenso mostrado no popup (ex.: "36 dias") usa a mesma
  fonte de verdade (`src/domain/scheduler.ts`) que os rótulos curtos dos
  botões (`<1m`, `36d`), apenas formatado de forma mais legível — não é
  um segundo cálculo independente.
