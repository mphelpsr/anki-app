# Fontes de Conteúdo

Registro de proveniência exigido pelo Princípio IV da Constituição
("Pipeline de Conteúdo Rastreável e Respeitando Licenças"). Todo dataset
em `src/content/seed/` precisa de uma entrada aqui antes de ser
empacotado no app.

## `oxford-3000-a1-a2.sample.json`

- **Fonte**: Amostra escrita à mão pela equipe do projeto — **não** é uma
  extração do Oxford 3000/5000 real.
- **Status de licença**: N/A (conteúdo original, sem material da Oxford
  University Press envolvido). Os termos de licença/uso do Oxford
  3000/5000 real ainda **não foram confirmados** — até que sejam, nenhum
  conteúdo derivado da Oxford é empacotado no app (Princípio IV).
- **Nível declarado**: A2 (rotulado como tal apenas para exercitar o
  indicador de progresso de `003-cefr-progress-counter`; não corresponde
  a uma classificação CEFR real de nenhuma fonte).
- **Data de extração**: 2026-08-08 (data de criação deste arquivo de
  amostra, não uma "extração" no sentido do pipeline).
- **Quantidade**: 4 cartas (`request`, `journey`, `harvest`, `lecture`).
- **Próximo passo, quando a licença Oxford for esclarecida**:
  implementar `content-pipeline/ingest-oxford.ts` (ver
  `specs/001-flashcard-study-loop/tasks.md`, T032) para gerar um dataset
  real a partir da fonte licenciada, substituindo este arquivo de amostra
  — mesmo formato (`contracts/seed-content-schema.json`), conteúdo
  diferente.
