# Plano de Implementação: Avaliação de Lembrança com Agendador Real

**Branch**: `004-recall-grading` | **Data**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da funcionalidade em `/specs/004-recall-grading/spec.md`

## Resumo

Implementar `src/domain/scheduler.ts` (agendador real de duas fases —
aprendizagem em minutos + crescimento em dias após graduar, conforme
atualizado em `001-flashcard-study-loop/contracts/scheduler-contract.md`)
e conectá-lo à tela de estudo: após "Reveal", quatro botões (Again/Hard/
Good/Easy) com rótulo de tempo calculado dinamicamente substituem o botão
de revelar; escolher um avalia a carta atual, atualiza seu estado em
memória e avança a sessão. A tradução em português passa a ser exibida
junto da revelação.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (modo strict) — mesmo projeto

**Dependências Principais**: Nenhuma nova

**Armazenamento**: N/A — estado de agendamento vive em `useState` na
`StudyCardScreen` (fila mock com estado mutável), sem SQLite ainda

**Testes**: Jest para `scheduler.ts` (testes primeiro, cobrindo as 6
regras do contrato) + atualização dos testes de integração existentes

**Plataforma Alvo**: Mesma (Expo, validado via `expo start --web`)

**Restrições**: FR-004 (Again < 2 min sempre) e FR-003 (ordenação não
decrescente entre os 4 tempos) são invariantes que os testes do
agendador devem cobrir para qualquer estado de entrada, não só os casos
do mock

**Escala/Escopo**: 1 módulo de domínio novo, 2 componentes novos
(GradeButtons, TranslationLine), atualização de mock/tela/testes
existentes

## Verificação da Constituição

*GATE: Deve passar antes da Fase 0 de pesquisa. Reverificar após o design da Fase 1.*

| Princípio | Verificação | Status |
|---|---|---|
| I. Offline-First, Propriedade Local | Cálculo 100% local, sem rede | PASSA |
| II. Repetição Espaçada É o Loop Central | Esta feature É a implementação real do loop central (mostrar → avaliar → reagendar) que a constituição exige antes de qualquer outra coisa — atrasado até agora por causa da sequência 002→003; passa a existir de fato aqui | PASSA |
| III. Testes Primeiro para Lógica de Domínio | `scheduler.ts` testado primeiro contra as 6 regras do contrato antes de qualquer wiring de UI | PASSA |
| IV. Pipeline de Conteúdo | N/A — ainda mock | PASSA (não aplicável) |
| V. Disciplina de MVP | Não adiciona persistência, estatísticas nem edição manual — só o loop de avaliação em memória | PASSA |
| Requisitos em EARS / Cenários em BDD | spec.md segue o formato | PASSA |

Nenhuma violação a justificar.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/004-recall-grading/
├── plan.md
├── tasks.md
└── checklists/
    └── requirements.md
```

*(`001-flashcard-study-loop/research.md`, `contracts/scheduler-
contract.md` e `data-model.md` foram atualizados in-place para refletir
o modelo de duas fases — não duplicados aqui.)*

### Código-fonte (raiz do repositório)

```text
src/
├── domain/
│   ├── mockQueue.ts             # inalterado
│   ├── mastery.ts                # ATUALIZADO: intervalDays -> intervalMinutes
│   └── scheduler.ts              # NOVO: scheduleNextReview (contrato de 001)
├── mocks/
│   └── studyQueue.ts             # ATUALIZADO: + easeFactor, intervalMinutes (era intervalDays),
│                                  #   translationBefore/translatedWord/translationAfter
└── features/
    └── study/
        ├── GradeButtons.tsx       # NOVO: 4 botões + preview dinâmico
        ├── TranslationLine.tsx    # NOVO: frase traduzida, exibida só quando revelado
        ├── RevealButton.tsx       # ATUALIZADO: rótulo "Reveal"
        └── StudyCardScreen.tsx    # ATUALIZADO: estado mutável de cards, handleGrade

tests/
├── unit/
│   ├── scheduler.test.ts          # NOVO
│   └── mastery.test.ts            # ATUALIZADO (campo renomeado)
└── integration/
    └── study-card-screen.test.tsx # ATUALIZADO
```

**Decisão de Estrutura**: Mesma estrutura de `002`/`003`. `scheduler.ts`
fica em `src/domain/` (não em `src/features/`) porque é o mesmo módulo
puro que `001-flashcard-study-loop` planejou — quando `001` ganhar
persistência real, o `reviewRepository.ts` chamará esta mesma função sem
mudanças.

## Rastreamento de Complexidade

*Nenhuma violação — tabela intencionalmente vazia.*
