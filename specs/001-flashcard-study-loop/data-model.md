# Modelo de Dados da Fase 1: Loop de Estudo com Flashcards (MVP)

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
| `front` | text | A palavra (pergunta) |
| `back` | text | Definição/exemplo/tradução (resposta) |
| `sourceRef` | text | Rastreabilidade até a entrada no dataset semente (Princípio IV da Constituição) |
| `repetitions` | integer | Contagem de revisões bem-sucedidas consecutivas (nota ≥ 2); estado do SM-2 |
| `easeFactor` | real | Fator de facilidade do SM-2; começa em 2,5, piso 1,30 |
| `intervalDays` | integer | Intervalo atual em dias; começa em 0 (novo/nunca revisado) |
| `nextDueAt` | integer (unix ms) | Quando o card se torna devido; cards novos têm padrão "agora", ficando imediatamente devidos (Caso de Borda da spec: primeiro lançamento) |
| `lastReviewedAt` | integer (unix ms), anulável | Nulo até a primeira revisão |

**Regras de validação**: `front`/`back` não vazios; `easeFactor >= 1,30`;
`intervalDays >= 0`; um Card com `lastReviewedAt = null` DEVE ter
`repetitions = 0` e `intervalDays = 0`.

**Transições de estado** (conduzidas pelo agendador em
`src/domain/scheduler.ts`, que recebe uma Nota e os campos de agendamento
atuais do Card, produzindo os próximos `repetitions` / `easeFactor` /
`intervalDays` / `nextDueAt` — ver
[contracts/scheduler-contract.md](./contracts/scheduler-contract.md)):

```text
Novo (repetitions=0, nunca revisado)
   --nota 0--> Aprendendo, interval=1 dia, repetitions=0, ease -0,20
   --nota 1--> Aprendendo, interval=1 dia, repetitions=1, ease -0,15
   --nota 2/3--> Aprendendo, interval=1 dia, repetitions=1, ease inalterado/+0,15

Aprendendo/Revisão (repetitions>=1)
   --nota 0--> reinicia: repetitions=0, interval=1 dia, ease -0,20 (piso 1,30)
   --nota 1/2/3--> repetitions+1, interval=round(intervalAnterior * easeFactor)
                     (exceto repetitions 1→2, que usa intervalo fixo de 6 dias, conforme SM-2),
                     ease ajustado conforme a nota
```

## Review (Revisão)

Um único evento avaliado para um Card (spec: Entidades Principais →
Review).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | text (uuid) | Chave primária |
| `cardId` | text | Chave estrangeira → Card.id |
| `grade` | integer (0-3) | A nota de lembrança dada |
| `reviewedAt` | integer (unix ms) | Quando a nota foi registrada |
| `intervalBefore` | integer | `intervalDays` do card imediatamente antes desta revisão (para verificação SC-004 / depuração) |
| `intervalAfter` | integer | `intervalDays` do card imediatamente depois desta revisão |

**Regras de validação**: `grade` em `{0,1,2,3}`; uma Review é
append-only — nunca atualizada ou excluída, atendendo ao FR-004
("registrar uma revisão avaliada") e fornecendo uma trilha de auditoria
independente do estado de agendamento (mutável) atual do Card.

**Relacionamentos**: Deck 1—N Card; Card 1—N Review. Excluir um Deck está
fora de escopo para esta funcionalidade (nenhum requisito de exclusão na
spec).

## Notas sobre rastreabilidade FR/SC

- FR-011 (persistir localmente, sem rede) / FR-013 (recuperar sessão
  interrompida): atendidos porque o Card é a fonte durável do estado
  "ainda devido" — uma sessão nunca armazena em buffer um card não
  avaliado fora do BD, então fechar o app no meio da sessão simplesmente
  deixa o `nextDueAt` intocado para o card não avaliado.
- SC-003/SC-004 (diferenças mensuráveis de intervalo / crescimento):
  diretamente verificáveis lendo `Card.intervalDays` e
  `Review.intervalAfter` antes/depois de avaliar, que é exatamente o que
  `tests/unit/scheduler.test.ts` verifica contra a função pura — sem
  necessidade de BD para essa prova.
