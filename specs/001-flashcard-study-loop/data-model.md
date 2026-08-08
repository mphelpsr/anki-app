# Modelo de Dados da Fase 1: Loop de Estudo com Flashcards (MVP)

<!--
Nota de sincronização (implementação do SQLite real, 2026-08-08): o Card
abaixo substitui os campos genéricos `front`/`back` da primeira versão
pelos campos concretos que `002-mvp1-card-screen` e `004-recall-grading`
já usam em produção (frase em inglês com posição da palavra-alvo,
tradução em português com a mesma estrutura, emoji placeholder de
imagem). Isso não muda nenhum FR desta spec, só alinha o modelo de dados
ao que a UI já exige. Ver `src/data/schema.ts` para o SQL vigente.
-->

## Deck

Representa uma coleção nomeada de cards estudada como uma unidade (spec:
Entidades Principais → Deck).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | text (uuid) | Chave primária |
| `name` | text | ex.: "Oxford 3000 — A1-A2" |
| `sourceLevel` | text | Faixa CEFR que o deck representa (A1, A2, B1, B2...) |
| `createdAt` | integer (unix ms) | Definido uma vez, no momento da semeadura |

**Derivado, não armazenado**: `dueCount` — calculado por Deck contando os
Cards cujo `nextDueAt <= now`. Recalculado a cada leitura, nunca
persistido, para que nunca possa divergir da tabela Card (FR-008,
FR-010).

**Regras de validação**: `name` não vazio; `sourceLevel` deve ser uma das
faixas CEFR suportadas pelo pipeline de conteúdo.

## Card

Um item de estudo único pertencente a um Deck (spec: Entidades Principais
→ Card).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | text (uuid) | Chave primária |
| `deckId` | text | Chave estrangeira → Deck.id |
| `word` | text | A palavra-alvo em inglês |
| `sentenceBefore` / `sentenceAfter` | text | Frase de exemplo em inglês, partida em torno de `word` (permite destacá-la sem reprocessar texto livre — ver `002-mvp1-card-screen`) |
| `translationBefore` / `translatedWord` / `translationAfter` | text | Mesma estrutura, em português, exibida ao tocar "Reveal" (`004-recall-grading`) |
| `emoji` | text | Placeholder de imagem (ver Suposições de `002-mvp1-card-screen/spec.md` — fonte real de ilustrações ainda não definida) |
| `sourceRef` | text | Rastreabilidade até a entrada no dataset semente (Princípio IV da Constituição) |
| `repetitions` | integer | 0 = carta nova/em relearning; >=1 = graduada. Estado do agendador de duas fases |
| `easeFactor` | real | Fator de facilidade; começa em 2,5, piso 1,30 |
| `intervalMinutes` | integer | Intervalo atual em minutos (não mais dias — ver nota de sincronização de `004-recall-grading` em [contracts/scheduler-contract.md](./contracts/scheduler-contract.md)); começa em 0 (novo/nunca revisado) |
| `nextDueAt` | integer (unix ms) | Quando o card se torna devido; cards novos têm padrão "agora", ficando imediatamente devidos (Caso de Borda da spec: primeiro lançamento) |
| `lastReviewedAt` | integer (unix ms), anulável | Nulo até a primeira revisão |

**Regras de validação**: `word`, `sentenceBefore`/`sentenceAfter`,
`translationBefore`/`translatedWord`/`translationAfter` não vazios;
`easeFactor >= 1,30`; `intervalMinutes >= 0`; um Card com
`lastReviewedAt = null` DEVE ter `repetitions = 0` e
`intervalMinutes = 0`.

**Transições de estado** (conduzidas pelo agendador em
`src/domain/scheduler.ts`, que recebe uma Nota e os campos de agendamento
atuais do Card, produzindo os próximos `repetitions` / `easeFactor` /
`intervalMinutes` / `nextDueAt` — ver
[contracts/scheduler-contract.md](./contracts/scheduler-contract.md)):

```text
Fase de aprendizagem (repetitions=0: novo ou em relearning)
   --Again--> permanece, interval=1 min, repetitions=0, ease -0,20
   --Hard--> permanece, interval=10 min, repetitions=0, ease -0,15
   --Good--> gradua: interval=1 dia (1440 min), repetitions=1, ease inalterado
   --Easy--> gradua: interval=4 dias (5760 min), repetitions=1, ease +0,15

Fase graduada (repetitions>=1)
   --Again--> lapso, volta à fase de aprendizagem: repetitions=0, interval=1 min, ease -0,20 (piso 1,30)
   --Hard--> repetitions+1, interval=round(intervalAnteriorEmDias * 1,2) em dias, ease -0,15
   --Good--> repetitions+1, interval=round(intervalAnteriorEmDias * easeFactor) em dias, ease inalterado
   --Easy--> repetitions+1, interval=round(intervalAnteriorEmDias * easeFactor * 1,3) em dias, ease +0,15
```

O multiplicador de Hard é fixo (1,2), não o `easeFactor`, para garantir que
Hard produza sempre um intervalo menor que Good — se ambos usassem
`easeFactor`, ficariam idênticos e a UI não teria como diferenciá-los
(bug encontrado e corrigido durante `004-recall-grading`).

## Review (Revisão)

Um único evento avaliado para um Card (spec: Entidades Principais →
Review).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | text (uuid) | Chave primária |
| `cardId` | text | Chave estrangeira → Card.id |
| `grade` | integer (0-3) | A nota de lembrança dada |
| `reviewedAt` | integer (unix ms) | Quando a nota foi registrada |
| `intervalBefore` | integer | `intervalMinutes` do card imediatamente antes desta revisão (para verificação SC-004 / depuração) |
| `intervalAfter` | integer | `intervalMinutes` do card imediatamente depois desta revisão |

**Regras de validação**: `grade` em `{0,1,2,3}`; uma Review é
append-only — nunca atualizada ou excluída, atendendo ao FR-004
("registrar uma revisão avaliada") e fornecendo uma trilha de auditoria
independente do estado de agendamento (mutável) atual do Card.

**Relacionamentos**: Deck 1—N Card; Card 1—N Review. Excluir um Deck está
fora de escopo para esta funcionalidade (nenhum requisito de exclusão na
spec).

## Nota sobre o nível CEFR usado por `003-cefr-progress-counter`

`003` modela cada carta mock com seu próprio `cefrLevel`. No schema real,
o nível é uma propriedade do **Deck** (`sourceLevel`), não do Card — o
repositório (`deckRepository`) é responsável por unir Card ↔ Deck e
produzir a forma `MasteryCard` (com `cefrLevel` "achatado") que
`src/domain/mastery.ts` já espera. A função de domínio não muda; só a
origem do dado.

## Notas sobre rastreabilidade FR/SC

- FR-011 (persistir localmente, sem rede) / FR-013 (recuperar sessão
  interrompida): atendidos porque o Card é a fonte durável do estado
  "ainda devido" — uma sessão nunca armazena em buffer um card não
  avaliado fora do BD, então fechar o app no meio da sessão simplesmente
  deixa o `nextDueAt` intocado para o card não avaliado.
- SC-003/SC-004 (diferenças mensuráveis de intervalo / crescimento):
  diretamente verificáveis lendo `Card.intervalMinutes` e
  `Review.intervalAfter` antes/depois de avaliar, que é exatamente o que
  `tests/unit/scheduler.test.ts` verifica contra a função pura — sem
  necessidade de BD para essa prova.
